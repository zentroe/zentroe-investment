import { KYC, IKYC, IKYCDocument } from '../models/KYC';
import { User } from '../models/User';
import { deleteFile } from '../config/cloudinary';
import mongoose from 'mongoose';

export interface KYCUploadData {
  userId: string;
  documentType: 'drivers_license' | 'passport';
  frontImage: {
    url: string;
    publicId: string;
    size: number;
  };
  backImage?: {
    url: string;
    publicId: string;
    size: number;
  };
}

export interface KYCReviewData {
  kycId: string;
  adminId: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
  notes?: string;
}

export class KYCService {

  /**
   * Get user's KYC status and documents
   */
  static async getUserKYCStatus(userId: string): Promise<IKYC | null> {
    try {
      const kyc = await KYC.findOne({ user: userId })
        .populate('reviewedBy', 'firstName lastName email')
        .lean();

      return kyc;
    } catch (error) {
      console.error('Error fetching user KYC status:', error);
      throw error;
    }
  }

  /**
   * Upload KYC document
   */
  static async uploadKYCDocument(uploadData: KYCUploadData): Promise<IKYC> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        // Find or create KYC record
        let kyc = await KYC.findOne({ user: uploadData.userId }).session(session);

        if (!kyc) {
          kyc = new KYC({
            user: uploadData.userId,
            status: 'pending',
            documents: []
          });
        }

        // Check if user can upload documents
        if (!(kyc as any).canUploadDocuments()) {
          throw new Error('Cannot upload documents at this time. KYC status must be pending or rejected.');
        }

        // Remove existing documents of the same type (allow re-upload)
        // Also delete old images from Cloudinary
        const existingDocs = kyc.documents.filter(doc => doc.type === uploadData.documentType);
        for (const doc of existingDocs) {
          if (doc.frontImageKey) {
            await deleteFile(doc.frontImageKey);
          }
          if (doc.backImageKey) {
            await deleteFile(doc.backImageKey);
          }
        }
        kyc.documents = kyc.documents.filter(doc => doc.type !== uploadData.documentType);

        // Prepare document data
        const documentData: Partial<IKYCDocument> = {
          user: new mongoose.Types.ObjectId(uploadData.userId),
          type: uploadData.documentType,
          frontImageUrl: uploadData.frontImage.url,
          frontImageKey: uploadData.frontImage.publicId,
          metadata: {
            originalName: `${uploadData.documentType}_front`,
            size: uploadData.frontImage.size,
            mimeType: 'image/auto'
          }
        };

        // Save back image if provided
        if (uploadData.backImage) {
          documentData.backImageUrl = uploadData.backImage.url;
          documentData.backImageKey = uploadData.backImage.publicId;
        }

        // Add document to KYC record
        kyc.documents.push(documentData as IKYCDocument);

        // Save KYC record
        await kyc.save({ session });

        return kyc;
      });
    } catch (error) {
      console.error('Error uploading KYC document:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Submit KYC for review
   */
  static async submitKYCForReview(userId: string): Promise<IKYC> {
    try {
      const kyc = await KYC.findOne({ user: userId });

      if (!kyc) {
        throw new Error('No KYC record found for user');
      }

      if (!(kyc as any).canSubmitForReview()) {
        throw new Error('Cannot submit KYC for review. Please upload documents first.');
      }

      return await (kyc as any).submitForReview();
    } catch (error) {
      console.error('Error submitting KYC for review:', error);
      throw error;
    }
  }

  /**
   * Delete KYC document
   */
  static async deleteKYCDocument(userId: string, documentId: string): Promise<IKYC> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const kyc = await KYC.findOne({ user: userId }).session(session);

        if (!kyc) {
          throw new Error('No KYC record found for user');
        }

        if (!(kyc as any).canUploadDocuments()) {
          throw new Error('Cannot delete documents at this time');
        }

        // Find and remove the document
        const documentIndex = kyc.documents.findIndex(doc => (doc._id as any).toString() === documentId);

        if (documentIndex === -1) {
          throw new Error('Document not found');
        }

        const document = kyc.documents[documentIndex];

        // Delete files from Cloudinary
        try {
          await deleteFile(document.frontImageKey);
          if (document.backImageKey) {
            await deleteFile(document.backImageKey);
          }
        } catch (fileError) {
          console.error('Error deleting files from Cloudinary:', fileError);
          // Continue with database cleanup even if file deletion fails
        }

        // Remove document from array
        kyc.documents.splice(documentIndex, 1);

        await kyc.save({ session });

        return kyc;
      });
    } catch (error) {
      console.error('Error deleting KYC document:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // Admin Functions

  /**
   * Get all KYC submissions for admin review
   */
  static async getAllKYCSubmissions(
    page = 1,
    limit = 20,
    status?: string,
    search?: string
  ) {
    try {
      const skip = (page - 1) * limit;
      const filter: any = {};

      if (status) {
        filter.status = status;
      }

      // Build aggregation pipeline
      const pipeline: any[] = [
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $lookup: {
            from: 'users',
            localField: 'reviewedBy',
            foreignField: '_id',
            as: 'reviewedBy'
          }
        },
        {
          $unwind: {
            path: '$reviewedBy',
            preserveNullAndEmptyArrays: true
          }
        }
      ];

      // Add search filter if provided
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { 'user.email': { $regex: search, $options: 'i' } },
              { 'user.firstName': { $regex: search, $options: 'i' } },
              { 'user.lastName': { $regex: search, $options: 'i' } }
            ]
          }
        });
      }

      // Add sorting, pagination, and projection
      pipeline.push(
        { $sort: { submittedAt: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            status: 1,
            documents: 1,
            submittedAt: 1,
            reviewedAt: 1,
            rejectionReason: 1,
            notes: 1,
            createdAt: 1,
            updatedAt: 1,
            'user._id': 1,
            'user.firstName': 1,
            'user.lastName': 1,
            'user.email': 1,
            'reviewedBy.firstName': 1,
            'reviewedBy.lastName': 1,
            'reviewedBy.email': 1
          }
        }
      );

      const [submissions, totalCount] = await Promise.all([
        KYC.aggregate(pipeline),
        KYC.countDocuments(filter)
      ]);

      return {
        submissions,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching KYC submissions:', error);
      throw error;
    }
  }

  /**
   * Get KYC submission by ID for admin review
   */
  static async getKYCSubmissionById(submissionId: string): Promise<IKYC | null> {
    try {
      const submission = await KYC.findById(submissionId)
        .populate('user', 'firstName lastName email phone dateOfBirth address')
        .populate('reviewedBy', 'firstName lastName email')
        .lean();

      return submission;
    } catch (error) {
      console.error('Error fetching KYC submission:', error);
      throw error;
    }
  }

  /**
   * Review KYC submission (approve or reject)
   */
  static async reviewKYCSubmission(reviewData: KYCReviewData): Promise<IKYC> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const kyc = await KYC.findById(reviewData.kycId).session(session);

        if (!kyc) {
          throw new Error('KYC submission not found');
        }

        if (kyc.status !== 'submitted') {
          throw new Error('KYC submission is not in submitted status');
        }

        // Update KYC status
        if (reviewData.action === 'approve') {
          await (kyc as any).approve(reviewData.adminId, reviewData.notes);

          // Update user's KYC status
          await User.findByIdAndUpdate(
            kyc.user,
            {
              $set: {
                'kyc.status': 'approved',
                'kyc.reviewedAt': new Date(),
                'kyc.reviewedBy': reviewData.adminId
              }
            },
            { session }
          );
        } else {
          if (!reviewData.rejectionReason) {
            throw new Error('Rejection reason is required when rejecting KYC');
          }

          await (kyc as any).reject(reviewData.adminId, reviewData.rejectionReason, reviewData.notes);

          // Update user's KYC status
          await User.findByIdAndUpdate(
            kyc.user,
            {
              $set: {
                'kyc.status': 'rejected',
                'kyc.reviewedAt': new Date(),
                'kyc.reviewedBy': reviewData.adminId,
                'kyc.notes': reviewData.rejectionReason
              }
            },
            { session }
          );
        }

        return kyc;
      });
    } catch (error) {
      console.error('Error reviewing KYC submission:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get KYC statistics
   */
  static async getKYCStatistics() {
    try {
      const [
        totalSubmissions,
        pendingReview,
        approved,
        rejected,
        thisMonthStats
      ] = await Promise.all([
        KYC.countDocuments(),
        KYC.countDocuments({ status: 'submitted' }),
        KYC.countDocuments({ status: 'approved' }),
        KYC.countDocuments({ status: 'rejected' }),
        KYC.countDocuments({
          submittedAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        })
      ]);

      // Calculate approval rate
      const totalReviewed = approved + rejected;
      const approvalRate = totalReviewed > 0 ? ((approved / totalReviewed) * 100).toFixed(1) : '0';

      // Calculate average review time
      const reviewedSubmissions = await KYC.find({
        status: { $in: ['approved', 'rejected'] },
        submittedAt: { $exists: true },
        reviewedAt: { $exists: true }
      }).select('submittedAt reviewedAt').lean();

      let averageReviewTime = '0';
      if (reviewedSubmissions.length > 0) {
        const totalReviewTime = reviewedSubmissions.reduce((acc, submission) => {
          const reviewTime = submission.reviewedAt!.getTime() - submission.submittedAt!.getTime();
          return acc + reviewTime;
        }, 0);

        const avgTimeMs = totalReviewTime / reviewedSubmissions.length;
        const avgDays = Math.round(avgTimeMs / (1000 * 60 * 60 * 24));
        averageReviewTime = `${avgDays} days`;
      }

      return {
        totalSubmissions,
        pendingReview,
        approved,
        rejected,
        thisMonthSubmissions: thisMonthStats,
        averageReviewTime,
        approvalRate: `${approvalRate}%`
      };
    } catch (error) {
      console.error('Error fetching KYC statistics:', error);
      throw error;
    }
  }
}

export default KYCService;
import { Request, Response } from 'express';
import { KYCService } from '../services/kycService';
import { AuthenticatedRequest } from '../types/CustomRequest';
import { AuthenticatedAdminRequest } from '../middleware/adminAuth';
import { uploadFile } from '../config/cloudinary';
import { User } from '../models/User';

/**
 * Get user's KYC status and documents
 */
export const getUserKYCStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Get KYC document status from KYC collection
    const kycDocument = await KYCService.getUserKYCStatus(userId);

    // Also get the user's kyc status from User model (this is the source of truth)
    const user = await User.findById(userId).select('kyc').lean();

    // Merge both sources - User.kyc.status takes priority if it exists
    let finalStatus: any = {
      status: user?.kyc?.status || kycDocument?.status || 'pending',
      submittedAt: kycDocument?.submittedAt || user?.kyc?.submittedAt,
      reviewedAt: kycDocument?.reviewedAt || user?.kyc?.reviewedAt,
      reviewedBy: kycDocument?.reviewedBy || user?.kyc?.reviewedBy,
      rejectionReason: kycDocument?.rejectionReason,
      notes: kycDocument?.notes || user?.kyc?.notes,
      documents: kycDocument?.documents || []
    };

    res.status(200).json({
      success: true,
      data: finalStatus
    });
  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KYC status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Upload KYC documents
 */
export const uploadKYCDocuments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { documentType, frontImage, backImage } = req.body;

    // Validation
    if (!documentType || !['drivers_license', 'passport'].includes(documentType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid or missing document type'
      });
      return;
    }

    if (!frontImage) {
      res.status(400).json({
        success: false,
        message: 'Front image is required'
      });
      return;
    }

    // For driver's license, back image is required
    if (documentType === 'drivers_license' && !backImage) {
      res.status(400).json({
        success: false,
        message: 'Back image is required for driver\'s license'
      });
      return;
    }

    // Upload front image to Cloudinary
    const frontUploadResult = await uploadFile(
      frontImage,
      `kyc/${userId}`,
      {
        resourceType: 'image',
        publicId: `${userId}_${documentType}_front_${Date.now()}`,
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      }
    );

    if (!frontUploadResult.success) {
      res.status(500).json({
        success: false,
        message: 'Failed to upload front image',
        error: frontUploadResult.error
      });
      return;
    }

    let backUploadResult: { success: boolean; data?: any; error?: string } | null = null;
    if (backImage) {
      backUploadResult = await uploadFile(
        backImage,
        `kyc/${userId}`,
        {
          resourceType: 'image',
          publicId: `${userId}_${documentType}_back_${Date.now()}`,
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        }
      );

      if (!backUploadResult.success) {
        res.status(500).json({
          success: false,
          message: 'Failed to upload back image',
          error: backUploadResult.error
        });
        return;
      }
    }

    const uploadData = {
      userId,
      documentType,
      frontImage: {
        url: frontUploadResult.data!.secure_url,
        publicId: frontUploadResult.data!.public_id,
        size: frontUploadResult.data!.bytes
      },
      backImage: backUploadResult ? {
        url: backUploadResult.data!.secure_url,
        publicId: backUploadResult.data!.public_id,
        size: backUploadResult.data!.bytes
      } : undefined
    };

    const kyc = await KYCService.uploadKYCDocument(uploadData);

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: kyc
    });
  } catch (error: any) {
    console.error('Upload KYC documents error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload documents',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Submit KYC documents for review
 */
export const submitKYCVerification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const kyc = await KYCService.submitKYCForReview(userId);

    res.status(200).json({
      success: true,
      message: 'KYC documents submitted for review successfully',
      data: kyc
    });
  } catch (error) {
    console.error('Submit KYC verification error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit KYC verification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete KYC document
 */
export const deleteKYCDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { documentId } = req.params;

    if (!documentId) {
      res.status(400).json({
        success: false,
        message: 'Document ID is required'
      });
      return;
    }

    const kyc = await KYCService.deleteKYCDocument(userId, documentId);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
      data: kyc
    });
  } catch (error) {
    console.error('Delete KYC document error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete document',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Admin Controllers

/**
 * Get all KYC submissions for admin review
 */
export const getAllKYCSubmissions = async (req: AuthenticatedAdminRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      search
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const result = await KYCService.getAllKYCSubmissions(
      pageNum,
      limitNum,
      status as string,
      search as string
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get all KYC submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KYC submissions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get specific KYC submission by ID
 */
export const getKYCSubmissionById = async (req: AuthenticatedAdminRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;

    if (!submissionId) {
      res.status(400).json({
        success: false,
        message: 'Submission ID is required'
      });
      return;
    }

    const submission = await KYCService.getKYCSubmissionById(submissionId);

    if (!submission) {
      res.status(404).json({
        success: false,
        message: 'KYC submission not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Get KYC submission by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KYC submission',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Review KYC submission (approve or reject)
 */
export const reviewKYCSubmission = async (req: AuthenticatedAdminRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { action, rejectionReason, notes } = req.body;
    const adminId = req.admin.adminId;

    // Validation
    if (!submissionId) {
      res.status(400).json({
        success: false,
        message: 'Submission ID is required'
      });
      return;
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      res.status(400).json({
        success: false,
        message: 'Valid action (approve or reject) is required'
      });
      return;
    }

    if (action === 'reject' && !rejectionReason) {
      res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting KYC'
      });
      return;
    }

    if (!adminId) {
      res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
      return;
    }

    const reviewData = {
      kycId: submissionId,
      adminId,
      action,
      rejectionReason,
      notes
    };

    const updatedKYC = await KYCService.reviewKYCSubmission(reviewData);

    res.status(200).json({
      success: true,
      message: `KYC submission ${action}d successfully`,
      data: updatedKYC
    });
  } catch (error) {
    console.error('Review KYC submission error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to review KYC submission',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get KYC statistics for admin dashboard
 */
export const getKYCStatistics = async (req: AuthenticatedAdminRequest, res: Response): Promise<void> => {
  try {
    const statistics = await KYCService.getKYCStatistics();

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Get KYC statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KYC statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
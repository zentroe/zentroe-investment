import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { Payment, BankTransferPayment } from '../models/PaymentModels';

// Configure Cloudinary (should be done in your config file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Interface for authenticated request
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    id: string;
    isAdmin?: boolean;
  };
}

// Company bank details (in production, store in environment variables)
const COMPANY_BANK_DETAILS = {
  bankName: "JPMorgan Chase Bank",
  accountName: "Zentroe Investment LLC",
  accountNumber: "1234567890",
  routingNumber: "021000021",
  swiftCode: "CHASUS33",
  address: "270 Park Avenue, New York, NY 10017"
};

// Generate unique reference code
const generateReferenceCode = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `ZEN-${timestamp.slice(-6)}-${random}`;
};

// Upload file to Cloudinary
const uploadToCloudinary = async (fileData: string, originalName: string): Promise<{
  public_id: string;
  secure_url: string;
  format: string;
  bytes: number;
}> => {
  try {
    // Extract file type from data URL
    const mimeMatch = fileData.match(/data:([^;]+);base64,/);
    if (!mimeMatch) {
      throw new Error('Invalid file data format');
    }

    const mimeType = mimeMatch[1];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (!allowedTypes.includes(mimeType)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.');
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fileData, {
      folder: 'zentroe/bank-receipts',
      resource_type: 'auto', // Automatically detect if image or raw (for PDF)
      public_id: `bank-receipt-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
      transformation: mimeType.startsWith('image/') ? [
        { width: 1500, height: 1500, crop: 'limit' },
        { quality: 'auto:good' }
      ] : undefined
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

// Submit bank transfer payment
export const submitBankTransfer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      paymentId,
      accountId, // New format from dashboard
      amount,
      currency,
      bankName,
      accountNumber,
      routingNumber,
      accountHolderName,
      swiftCode,
      referenceCode,
      receiptFile, // Old format: Base64 encoded file data object
      proofOfPayment, // New format: Base64 string from dashboard
      investmentPlanId // New format: Plan ID from dashboard
    } = req.body;

    // Detect which format is being used
    const isNewFormat = accountId && amount && !paymentId;

    if (isNewFormat) {
      // NEW FORMAT: Dashboard submission with accountId
      // Validate required fields for new format
      if (!accountId || !amount) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: accountId and amount are required'
        });
        return;
      }

      if (!proofOfPayment) {
        res.status(400).json({
          success: false,
          message: 'Proof of payment is required'
        });
        return;
      }

      // Import models dynamically
      const BankAccount = (await import('../models/BankAccount')).default;
      const Deposit = (await import('../models/Deposit')).default;
      const { uploadFile } = await import('../config/cloudinary');

      // Find the bank account
      const bankAccount = await BankAccount.findById(accountId);
      if (!bankAccount || !bankAccount.isActive) {
        res.status(404).json({
          success: false,
          message: 'Bank account not found or inactive'
        });
        return;
      }

      // Upload proof of payment to Cloudinary
      let proofUrl: string | null = null;
      try {
        const uploadResult = await uploadFile(proofOfPayment, 'payment-proofs/bank-transfer', {
          resourceType: 'auto',
          publicId: `bank-proof-${req.user!.userId}-${Date.now()}`
        });

        if (uploadResult.success && uploadResult.data) {
          proofUrl = uploadResult.data.secure_url;
        }
      } catch (uploadError) {
        console.error('⚠️ Upload error:', uploadError);
      }

      // Create deposit directly (dashboard flow)
      const depositData: any = {
        userId: req.user!.userId,
        paymentMethod: 'bank_transfer',
        bankAccountId: accountId,
        amount: parseFloat(amount),
        status: 'pending'
      };

      if (proofUrl) {
        depositData.proofOfPayment = proofUrl;
      }

      if (investmentPlanId) {
        depositData.investmentPlanId = investmentPlanId;
      }

      const deposit = new Deposit(depositData);
      await deposit.save();

      res.json({
        success: true,
        message: 'Bank transfer submitted successfully',
        data: {
          depositId: deposit._id,
          status: 'pending'
        }
      });

    } else {
      // OLD FORMAT: Onboarding flow with paymentId
      // Validate required fields for old format
      if (!paymentId || !amount || !bankName || !accountNumber || !routingNumber || !accountHolderName) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
        return;
      }

      if (!receiptFile || !receiptFile.data || !receiptFile.originalName) {
        res.status(400).json({
          success: false,
          message: 'Receipt file is required'
        });
        return;
      }

      // Find the base payment
      const basePayment = await Payment.findById(paymentId);
      if (!basePayment || basePayment.userId.toString() !== req.user!.userId) {
        res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
        return;
      }

      if (basePayment.status !== 'pending') {
        res.status(400).json({
          success: false,
          message: 'Payment is no longer pending'
        });
        return;
      }

      // Upload file to Cloudinary
      let uploadedFile;
      try {
        uploadedFile = await uploadToCloudinary(receiptFile.data, receiptFile.originalName);
      } catch (error: any) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      // Generate reference code if not provided
      const finalReferenceCode = referenceCode || generateReferenceCode();

      // Create bank transfer payment record
      const bankTransferPayment = new BankTransferPayment({
        paymentId: basePayment._id,
        userId: req.user!.userId,
        amount: parseFloat(amount),
        currency: currency || 'USD',
        referenceCode: finalReferenceCode,
        userBankName: bankName,
        userAccountNumber: accountNumber,
        userRoutingNumber: routingNumber,
        userAccountHolderName: accountHolderName,
        userSwiftCode: swiftCode || '',
        companyBankName: COMPANY_BANK_DETAILS.bankName,
        companyAccountNumber: COMPANY_BANK_DETAILS.accountNumber,
        companyRoutingNumber: COMPANY_BANK_DETAILS.routingNumber,
        receiptFile: {
          filename: uploadedFile.public_id,
          originalName: receiptFile.originalName,
          mimetype: receiptFile.data.split(';')[0].split(':')[1],
          size: uploadedFile.bytes,
          path: uploadedFile.secure_url
        },
        status: 'pending'
      });

      await bankTransferPayment.save();

      // Update base payment status
      basePayment.status = 'processing';
      basePayment.metadata = {
        ...basePayment.metadata,
        bankTransferPaymentId: bankTransferPayment._id,
        referenceCode: finalReferenceCode
      };
      await basePayment.save();

      res.json({
        success: true,
        message: 'Bank transfer submitted successfully',
        data: {
          paymentId: basePayment?._id,
          bankTransferPaymentId: bankTransferPayment._id,
          referenceCode: finalReferenceCode,
          status: 'processing'
        }
      });
    }

  } catch (error: any) {
    console.error('Bank transfer submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit bank transfer',
      error: error.message
    });
  }
};

// Get bank transfer details
export const getBankTransferDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params;

    const bankTransfer = await BankTransferPayment.findOne({
      paymentId,
      userId: req.user!.userId
    }).populate('paymentId');

    if (!bankTransfer) {
      res.status(404).json({
        success: false,
        message: 'Bank transfer not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: bankTransfer._id,
        paymentId: bankTransfer.paymentId,
        amount: bankTransfer.amount,
        currency: bankTransfer.currency,
        referenceCode: bankTransfer.referenceCode,
        userBankDetails: {
          bankName: bankTransfer.userBankName,
          accountNumber: bankTransfer.userAccountNumber,
          routingNumber: bankTransfer.userRoutingNumber,
          accountHolderName: bankTransfer.userAccountHolderName,
          swiftCode: bankTransfer.userSwiftCode
        },
        receiptFile: bankTransfer.receiptFile ? {
          filename: bankTransfer.receiptFile.filename,
          originalName: bankTransfer.receiptFile.originalName,
          size: bankTransfer.receiptFile.size
        } : null,
        status: bankTransfer.status,
        verificationDate: bankTransfer.verificationDate,
        verificationNotes: bankTransfer.verificationNotes,
        createdAt: bankTransfer.createdAt,
        updatedAt: bankTransfer.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Get bank transfer details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bank transfer details',
      error: error.message
    });
  }
};

// Admin: Get all pending bank transfers
export const getPendingBankTransfers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin (implement your admin check logic)
    if (!req.user!.isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
      return;
    }

    const { page = 1, limit = 10, status = 'pending' } = req.query;

    const bankTransfers = await BankTransferPayment.find({ status })
      .populate('userId', 'firstName lastName email')
      .populate('paymentId')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit)); return;

    const total = await BankTransferPayment.countDocuments({ status });

    res.json({
      success: true,
      data: {
        bankTransfers,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: bankTransfers.length,
          totalRecords: total
        }
      }
    });

  } catch (error: any) {
    console.error('Get pending bank transfers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending bank transfers',
      error: error.message
    });
  }
};

// Admin: Verify bank transfer
export const verifyBankTransfer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    if (!req.user!.isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
      return;
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be verified or rejected.'
      });
      return;
    }

    const bankTransfer = await BankTransferPayment.findById(id).populate('paymentId');
    if (!bankTransfer) {
      res.status(404).json({
        success: false,
        message: 'Bank transfer not found'
      });
      return;
    }

    // Update bank transfer
    bankTransfer.status = status as any;
    bankTransfer.verificationDate = new Date();
    bankTransfer.verificationNotes = notes;
    bankTransfer.verifiedBy = req.user!.userId as any;
    await bankTransfer.save();

    // Update base payment
    const basePayment = await Payment.findById(bankTransfer.paymentId);
    if (basePayment) {
      basePayment.status = status === 'verified' ? 'completed' : 'failed';
      basePayment.processedBy = req.user!.userId as any;
      basePayment.adminNotes = notes;
      await basePayment.save();
    }

    res.json({
      success: true,
      message: `Bank transfer ${status} successfully`,
      data: {
        id: bankTransfer._id,
        status: bankTransfer.status,
        verificationDate: bankTransfer.verificationDate,
        verificationNotes: bankTransfer.verificationNotes
      }
    });

  } catch (error: any) {
    console.error('Verify bank transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify bank transfer',
      error: error.message
    });
  }
};

// Get company bank details (for frontend display)
export const getCompanyBankDetails = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: COMPANY_BANK_DETAILS
    });
  } catch (error: any) {
    console.error('Get company bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bank details',
      error: error.message
    });
  }
};

export default {
  submitBankTransfer,
  getBankTransferDetails,
  getPendingBankTransfers,
  verifyBankTransfer,
  getCompanyBankDetails
};

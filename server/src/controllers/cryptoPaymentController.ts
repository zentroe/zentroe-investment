import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { Payment, CryptoPayment } from '../models/PaymentModels';

// Interface for authenticated request
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    id: string;
    isAdmin?: boolean;
  };
}

// Configure Cloudinary (should be done in your config file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Crypto wallet configurations (in production, store in environment variables)
interface WalletConfig {
  address: string;
  network: string;
  minimumConfirmations: number;
}

const CRYPTO_WALLETS: Record<string, WalletConfig> = {
  bitcoin: {
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    network: "Bitcoin Mainnet",
    minimumConfirmations: 3
  },
  ethereum: {
    address: "0x742d35Cc6634C0532925a3b8D8Ac342AC32B8C88",
    network: "Ethereum Mainnet",
    minimumConfirmations: 12
  },
  usdt: {
    address: "0x742d35Cc6634C0532925a3b8D8Ac342AC32B8C88",
    network: "Ethereum (ERC-20)",
    minimumConfirmations: 12
  },
  usdc: {
    address: "0x742d35Cc6634C0532925a3b8D8Ac342AC32B8C88",
    network: "Ethereum (ERC-20)",
    minimumConfirmations: 12
  }
};

// Mock exchange rates (in production, use real API like CoinGecko)
const EXCHANGE_RATES: Record<string, number> = {
  bitcoin: 45000,
  ethereum: 2500,
  usdt: 1,
  usdc: 1
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
      folder: 'zentroe/crypto-proofs',
      resource_type: 'auto', // Automatically detect if image or raw (for PDF)
      public_id: `crypto-proof-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
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

// Get supported cryptocurrencies
export const getSupportedCryptos = async (req: Request, res: Response) => {
  try {
    const cryptos = Object.keys(CRYPTO_WALLETS).map(crypto => ({
      id: crypto,
      name: crypto.charAt(0).toUpperCase() + crypto.slice(1),
      symbol: crypto.toUpperCase(),
      wallet: CRYPTO_WALLETS[crypto],
      currentRate: EXCHANGE_RATES[crypto]
    }));

    res.json({
      success: true,
      data: cryptos
    });

  } catch (error: any) {
    console.error('Get supported cryptos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get supported cryptocurrencies',
      error: error.message
    });
  }
};

// Calculate crypto amount based on fiat
export const calculateCryptoAmount = async (req: Request, res: Response) => {
  try {
    const { cryptocurrency, fiatAmount, fiatCurrency = 'USD' } = req.query;

    if (!cryptocurrency || !fiatAmount) {
      res.status(400).json({
        success: false,
        message: 'Cryptocurrency and fiat amount are required'
      });
      return;
    }

    const crypto = cryptocurrency as string;
    const amount = parseFloat(fiatAmount as string);

    if (!CRYPTO_WALLETS[crypto]) {
      res.status(400).json({
        success: false,
        message: 'Unsupported cryptocurrency'
      });
      return;
    }

    const exchangeRate = EXCHANGE_RATES[crypto];
    const cryptoAmount = amount / exchangeRate;

    let formattedAmount: string;
    if (crypto === 'bitcoin') {
      formattedAmount = cryptoAmount.toFixed(8);
    } else if (crypto === 'ethereum') {
      formattedAmount = cryptoAmount.toFixed(6);
    } else {
      formattedAmount = cryptoAmount.toFixed(2);
    }

    res.json({
      success: true,
      data: {
        cryptocurrency: crypto,
        fiatAmount: amount,
        fiatCurrency,
        cryptoAmount: parseFloat(formattedAmount),
        formattedAmount,
        exchangeRate,
        wallet: CRYPTO_WALLETS[crypto]
      }
    });

  } catch (error: any) {
    console.error('Calculate crypto amount error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate crypto amount',
      error: error.message
    });
  }
};

// Submit crypto payment
export const submitCryptoPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      paymentId,
      walletId, // NEW: From dashboard modal
      amount,
      currency,
      cryptocurrency,
      walletAddress,
      transactionHash,
      userWalletAddress,
      networkFee,
      proofFile, // Old format: { data, originalName }
      proofOfPayment, // NEW: Direct base64 string from dashboard
      investmentPlanId // NEW: For dashboard investments
    } = req.body;

    // Support both old format (paymentId required) and new format (walletId + amount)
    const isNewFormat = walletId && amount && !paymentId;

    if (isNewFormat) {
      // NEW FORMAT: Dashboard investment modal
      console.log('🔵 Processing crypto payment (new format - dashboard):', {
        walletId,
        amount,
        investmentPlanId: investmentPlanId || 'not specified',
        hasProof: !!proofOfPayment
      });

      // Validate new format fields
      if (!walletId || !amount) {
        res.status(400).json({
          success: false,
          message: 'Wallet ID and amount are required'
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

      // Import models
      const CryptoWallet = (await import('../models/CryptoWallet')).default;
      const Deposit = (await import('../models/Deposit')).default;
      const { uploadFile } = await import('../config/cloudinary');

      // Get wallet details
      const wallet = await CryptoWallet.findById(walletId);
      if (!wallet || !wallet.isActive) {
        res.status(404).json({
          success: false,
          message: 'Wallet not found or inactive'
        });
        return;
      }

      // Upload proof to Cloudinary
      let proofUrl: string | null = null;
      try {
        const uploadResult = await uploadFile(proofOfPayment, 'payment-proofs/crypto', {
          resourceType: 'auto',
          publicId: `crypto-proof-${req.user!.userId}-${Date.now()}`
        });

        if (uploadResult.success && uploadResult.data) {
          proofUrl = uploadResult.data.secure_url;
        }
      } catch (uploadError) {
        console.error('⚠️ Upload error:', uploadError);
      }

      // Create deposit record
      const depositData: any = {
        userId: req.user!.userId,
        paymentMethod: 'crypto',
        cryptoWalletId: walletId,
        amount: parseFloat(amount as string),
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

      console.log('✅ Crypto payment submitted (new format):', deposit._id);

      res.status(201).json({
        success: true,
        message: 'Crypto payment submitted successfully',
        paymentId: deposit._id,
        depositId: deposit._id,
        status: 'pending'
      });
      return;
    }

    // OLD FORMAT: Original implementation
    console.log('🟡 Processing crypto payment (old format - onboarding)');

    // Validate old format required fields
    if (!paymentId || !amount || !cryptocurrency || !transactionHash || !userWalletAddress) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
      return;
    }

    if (!CRYPTO_WALLETS[cryptocurrency]) {
      res.status(400).json({
        success: false,
        message: 'Unsupported cryptocurrency'
      });
      return;
    }

    if (!proofFile || !proofFile.data || !proofFile.originalName) {
      res.status(400).json({
        success: false,
        message: 'Transaction proof file is required'
      });
      return;
    }

    // Find the base payment
    const basePayment = await Payment.findById(paymentId);
    if (!basePayment || basePayment.userId.toString() !== req.user?.userId) {
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

    // Check if transaction hash already exists
    const existingCryptoPayment = await CryptoPayment.findOne({ transactionHash });
    if (existingCryptoPayment) {
      res.status(400).json({
        success: false,
        message: 'Transaction hash already exists'
      });
      return;
    }

    // Upload proof file to Cloudinary
    let uploadedFile;
    try {
      uploadedFile = await uploadToCloudinary(proofFile.data, proofFile.originalName);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }

    // Calculate crypto amount
    const fiatAmount = parseFloat(amount);
    const exchangeRate = EXCHANGE_RATES[cryptocurrency];
    const cryptoAmount = fiatAmount / exchangeRate;

    // Create crypto payment record
    const cryptoPayment = new CryptoPayment({
      paymentId: basePayment._id,
      userId: req.user!.userId,
      cryptocurrency,
      amount: cryptoAmount,
      fiatAmount,
      fiatCurrency: currency || 'USD',
      exchangeRate,
      companyWalletAddress: CRYPTO_WALLETS[cryptocurrency].address,
      userWalletAddress,
      network: CRYPTO_WALLETS[cryptocurrency].network,
      transactionHash,
      networkFee: networkFee ? parseFloat(networkFee) : undefined,
      confirmations: 0,
      minimumConfirmations: CRYPTO_WALLETS[cryptocurrency].minimumConfirmations,
      blockchainVerified: false,
      proofFile: {
        filename: uploadedFile.public_id,
        originalName: proofFile.originalName,
        mimetype: proofFile.data.split(';')[0].split(':')[1],
        size: uploadedFile.bytes,
        path: uploadedFile.secure_url
      },
      status: 'pending'
    });

    await cryptoPayment.save();

    // Update base payment status
    basePayment.status = 'processing';
    basePayment.metadata = {
      ...basePayment.metadata,
      cryptoPaymentId: cryptoPayment._id,
      transactionHash
    };
    await basePayment.save();

    res.json({
      success: true,
      message: 'Crypto payment submitted successfully',
      data: {
        paymentId: basePayment._id,
        cryptoPaymentId: cryptoPayment._id,
        transactionHash,
        cryptocurrency,
        amount: cryptoAmount,
        fiatAmount,
        status: 'processing'
      }
    });

  } catch (error: any) {
    console.error('Crypto payment submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit crypto payment',
      error: error.message
    });
  }
};

// Get crypto payment details
export const getCryptoPaymentDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params;

    const cryptoPayment = await CryptoPayment.findOne({
      paymentId,
      userId: req.user!.userId
    }).populate('paymentId');

    if (!cryptoPayment) {
      res.status(404).json({
        success: false,
        message: 'Crypto payment not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: cryptoPayment._id,
        paymentId: cryptoPayment.paymentId,
        cryptocurrency: cryptoPayment.cryptocurrency,
        amount: cryptoPayment.amount,
        fiatAmount: cryptoPayment.fiatAmount,
        fiatCurrency: cryptoPayment.fiatCurrency,
        exchangeRate: cryptoPayment.exchangeRate,
        companyWalletAddress: cryptoPayment.companyWalletAddress,
        userWalletAddress: cryptoPayment.userWalletAddress,
        network: cryptoPayment.network,
        transactionHash: cryptoPayment.transactionHash,
        networkFee: cryptoPayment.networkFee,
        confirmations: cryptoPayment.confirmations,
        minimumConfirmations: cryptoPayment.minimumConfirmations,
        blockchainVerified: cryptoPayment.blockchainVerified,
        blockchainVerificationDate: cryptoPayment.blockchainVerificationDate,
        proofFile: cryptoPayment.proofFile ? {
          filename: cryptoPayment.proofFile.filename,
          originalName: cryptoPayment.proofFile.originalName,
          size: cryptoPayment.proofFile.size,
          url: cryptoPayment.proofFile.path
        } : null,
        status: cryptoPayment.status,
        verificationNotes: cryptoPayment.verificationNotes,
        createdAt: cryptoPayment.createdAt,
        updatedAt: cryptoPayment.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Get crypto payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get crypto payment details',
      error: error.message
    });
  }
};

// Admin: Get all pending crypto payments
export const getPendingCryptoPayments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    if (!req.user!.isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
      return;
    }

    const { page = 1, limit = 10, status = 'pending', cryptocurrency } = req.query;

    const filter: any = { status };
    if (cryptocurrency) {
      filter.cryptocurrency = cryptocurrency;
    }

    const cryptoPayments = await CryptoPayment.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('paymentId')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await CryptoPayment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        cryptoPayments,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: cryptoPayments.length,
          totalRecords: total
        }
      }
    });

  } catch (error: any) {
    console.error('Get pending crypto payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending crypto payments',
      error: error.message
    });
  }
};

// Admin: Verify crypto payment
export const verifyCryptoPayment = async (req: AuthenticatedRequest, res: Response) => {
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
    const { status, notes, confirmations, blockchainVerified } = req.body;

    if (!['confirming', 'verified', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be confirming, verified, or rejected.'
      });
      return;
    }

    const cryptoPayment = await CryptoPayment.findById(id).populate('paymentId');
    if (!cryptoPayment) {
      res.status(404).json({
        success: false,
        message: 'Crypto payment not found'
      });
      return;
    }

    // Update crypto payment
    cryptoPayment.status = status as any;
    cryptoPayment.verificationNotes = notes;
    cryptoPayment.verifiedBy = req.user!.userId as any;

    if (confirmations !== undefined) {
      cryptoPayment.confirmations = confirmations;
    }

    if (blockchainVerified !== undefined) {
      cryptoPayment.blockchainVerified = blockchainVerified;
      if (blockchainVerified) {
        cryptoPayment.blockchainVerificationDate = new Date();
      }
    }

    await cryptoPayment.save();

    // Update base payment
    const basePayment = await Payment.findById(cryptoPayment.paymentId);
    if (basePayment) {
      let baseStatus = 'processing';
      if (status === 'verified') {
        baseStatus = 'completed';
      } else if (status === 'rejected') {
        baseStatus = 'failed';
      }

      basePayment.status = baseStatus as any;
      basePayment.processedBy = req.user!.userId as any;
      basePayment.adminNotes = notes;
      await basePayment.save();
    }

    res.json({
      success: true,
      message: `Crypto payment ${status} successfully`,
      data: {
        id: cryptoPayment._id,
        status: cryptoPayment.status,
        confirmations: cryptoPayment.confirmations,
        blockchainVerified: cryptoPayment.blockchainVerified,
        blockchainVerificationDate: cryptoPayment.blockchainVerificationDate,
        verificationNotes: cryptoPayment.verificationNotes
      }
    });

  } catch (error: any) {
    console.error('Verify crypto payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify crypto payment',
      error: error.message
    });
  }
};

// Simulate blockchain verification (in production, use real blockchain APIs)
export const simulateBlockchainCheck = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { transactionHash, cryptocurrency } = req.body;

    if (!transactionHash || !cryptocurrency) {
      res.status(400).json({
        success: false,
        message: 'Transaction hash and cryptocurrency are required'
      });
      return;
    }

    // Mock blockchain verification (replace with real API calls)
    const mockVerification = {
      transactionHash,
      cryptocurrency,
      found: true,
      confirmations: Math.floor(Math.random() * 20) + 1,
      amount: Math.random() * 10,
      fromAddress: '0x' + Math.random().toString(16).substr(2, 40),
      toAddress: CRYPTO_WALLETS[cryptocurrency]?.address,
      blockHeight: Math.floor(Math.random() * 1000000) + 15000000,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time in last 7 days
      status: 'confirmed'
    };

    res.json({
      success: true,
      message: 'Blockchain verification completed',
      data: mockVerification
    });

  } catch (error: any) {
    console.error('Blockchain verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify on blockchain',
      error: error.message
    });
  }
};

export default {
  getSupportedCryptos,
  calculateCryptoAmount,
  submitCryptoPayment,
  getCryptoPaymentDetails,
  getPendingCryptoPayments,
  verifyCryptoPayment,
  simulateBlockchainCheck
};

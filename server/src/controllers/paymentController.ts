import { Request, Response } from 'express';
import PaymentConfig from '../models/PaymentConfig';
import CryptoWallet from '../models/CryptoWallet';
import BankAccount from '../models/BankAccount';
import Deposit from '../models/Deposit';
import { CardPayment } from '../models/CardPayment';
import { uploadFile } from '../config/cloudinary';

// Helper function to upload payment proof from base64 data
const uploadPaymentProof = async (base64Data: string, userId: string, paymentType: string) => {
  try {
    const uploadResult = await uploadFile(base64Data, `payment-proofs/${paymentType}`, {
      resourceType: 'auto',
      publicId: `${paymentType}-proof-${userId}-${Date.now()}`
    });

    return uploadResult;
  } catch (error) {
    console.error('Upload payment proof error:', error);
    return { success: false, error: 'Failed to upload file' };
  }
};

// Get payment configuration and available options
export const getPaymentOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find or create payment config
    let config = await PaymentConfig.findOne();

    if (!config) {
      console.log('PaymentConfig not found, creating default...');
      config = new PaymentConfig({
        cryptoEnabled: true,  // Enable by default for testing
        bankTransferEnabled: true,
        cardPaymentEnabled: true
      });
      await config.save();
      console.log('Default PaymentConfig created:', config);
    }

    let cryptoWallets: any[] = [];
    let bankAccounts: any[] = [];

    if (config?.cryptoEnabled) {
      console.log('🔍 Fetching crypto wallets...');

      // Get active wallets with ALL fields to ensure address is included
      cryptoWallets = await CryptoWallet.find({ isActive: true });
      console.log('� Found', cryptoWallets.length, 'active crypto wallets');

      if (cryptoWallets.length > 0) {
        console.log('🏦 First wallet details:', {
          name: cryptoWallets[0].name,
          hasAddress: !!cryptoWallets[0].address,
          addressLength: cryptoWallets[0].address?.length || 0
        });

        // Log full details only if address is missing
        if (!cryptoWallets[0].address) {
          console.log('⚠️ MISSING ADDRESS - Full wallet data:', JSON.stringify(cryptoWallets[0], null, 2));
        }
      } else {
        console.log('⚠️ No active crypto wallets found in database');
      }
    }

    if (config?.bankTransferEnabled) {
      bankAccounts = await BankAccount.find({ isActive: true }).select('bankName accountName accountNumber routingNumber swiftCode bankAddress businessAddress iban country currency');
    }

    const response = {
      config: {
        cryptoEnabled: config?.cryptoEnabled || false,
        bankTransferEnabled: config?.bankTransferEnabled || false,
        cardPaymentEnabled: config?.cardPaymentEnabled || false
      },
      cryptoWallets,
      bankAccounts
    };

    console.log('Payment options response:', response);
    res.json(response);
  } catch (error) {
    console.error('Get payment options error:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Get crypto wallet details
export const getCryptoWalletDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletId } = req.params;
    const { amount } = req.query;

    const wallet = await CryptoWallet.findById(walletId);
    if (!wallet || !wallet.isActive) {
      res.status(404).json({ message: 'Wallet not found or inactive' });
      return;
    }

    res.json({
      wallet: {
        id: wallet._id,
        name: wallet.name,
        address: wallet.address,
        network: wallet.network,
        icon: wallet.icon
      },
      amount: amount || 0
    });
  } catch (error) {
    console.error('Get crypto wallet details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get bank account details  
export const getBankAccountDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountId } = req.params;
    const { amount } = req.query;

    const account = await BankAccount.findById(accountId);
    if (!account || !account.isActive) {
      res.status(404).json({ message: 'Bank account not found or inactive' });
      return;
    }

    res.json({
      account: {
        id: account._id,
        bankName: account.bankName,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        routingNumber: account.routingNumber,
        swiftCode: account.swiftCode,
        bankAddress: account.bankAddress,
        businessAddress: account.businessAddress,
        country: account.country,
        currency: account.currency
      },
      amount: amount || 0
    });
  } catch (error) {
    console.error('Get bank account details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Submit crypto payment - Creates proper payment records for admin tracking
export const submitCryptoPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      walletId,
      amount,
      transactionHash,
      userWalletAddress,
      proofOfPayment,
      investmentPlanId // Optional: For dashboard investments
    } = req.body;
    const userId = (req as any).user.userId;

    console.log('🚀 Processing crypto payment submission:', {
      userId,
      walletId,
      amount,
      transactionHash,
      userWalletAddress,
      hasProof: !!proofOfPayment,
      investmentPlanId: investmentPlanId || 'not specified (onboarding)'
    });

    if (!walletId || !amount) {
      res.status(400).json({ message: 'Wallet ID and amount are required' });
      return;
    }

    // Get wallet details
    const wallet = await CryptoWallet.findById(walletId);
    if (!wallet || !wallet.isActive) {
      res.status(404).json({ message: 'Wallet not found or inactive' });
      return;
    }

    // Import payment models
    const { CryptoPayment } = require('../models/PaymentModels');

    // Handle proof of payment upload if provided
    let proofFile: { filename: string; originalName: string; mimetype: string; size: number; path: string } | null = null;
    if (proofOfPayment) {
      try {
        const uploadResult = await uploadFile(proofOfPayment, 'payment-proofs/crypto', {
          resourceType: 'auto',
          publicId: `crypto-proof-${userId}-${Date.now()}`
        });

        if (uploadResult.success && uploadResult.data) {
          proofFile = {
            filename: `crypto-proof-${userId}-${Date.now()}`,
            originalName: 'payment-proof',
            mimetype: 'image/jpeg', // Default, could be detected
            size: 0, // Size not available from base64
            path: uploadResult.data.secure_url
          };
        }
      } catch (uploadError) {
        console.error('⚠️ Failed to upload proof, continuing without it:', uploadError);
      }
    }

    // Map wallet name to valid cryptocurrency enum value
    const getCryptocurrencyFromWalletName = (walletName: string): string => {
      const name = walletName.toLowerCase();
      if (name.includes('btc') || name.includes('bitcoin')) return 'bitcoin';
      if (name.includes('eth') || name.includes('ethereum')) return 'ethereum';
      if (name.includes('usdt') || name.includes('tether')) return 'usdt';
      if (name.includes('usdc') || name.includes('usd coin')) return 'usdc';
      // Default fallback
      return 'bitcoin';
    };

    // Create single crypto payment record (no more dual collection approach)
    const cryptoPayment = new CryptoPayment({
      userId,
      cryptocurrency: getCryptocurrencyFromWalletName(wallet.name),
      amount: 0, // Will be calculated based on exchange rate
      fiatAmount: parseFloat(amount),
      fiatCurrency: 'USD',
      exchangeRate: 1, // Would be fetched from API in production
      companyWalletAddress: wallet.address,
      userWalletAddress: userWalletAddress || 'Not provided',
      network: wallet.network || 'mainnet',
      transactionHash: transactionHash || `pending-${Date.now()}`,
      confirmations: 0,
      minimumConfirmations: 3,
      blockchainVerified: false,
      proofFile,
      status: 'pending'
    });

    await cryptoPayment.save();
    console.log('✅ Crypto payment record created:', cryptoPayment._id);

    // Create corresponding deposit record for consistency
    const depositData: any = {
      userId,
      paymentMethod: 'crypto',
      cryptoWalletId: walletId,
      amount: parseFloat(amount),
      proofOfPayment: proofFile?.path,
      status: 'pending'
    };

    // If investmentPlanId is provided (dashboard investment), save it
    if (investmentPlanId) {
      depositData.investmentPlanId = investmentPlanId;
      console.log(`📋 Deposit linked to investment plan: ${investmentPlanId}`);
    } else {
      console.log(`📋 Deposit created without plan link (onboarding flow)`);
    }

    const deposit = new Deposit(depositData);

    await deposit.save();
    console.log('✅ Corresponding deposit record created:', deposit._id);

    res.status(201).json({
      success: true,
      message: 'Crypto payment submitted successfully and recorded for admin review',
      paymentId: cryptoPayment._id,
      cryptoPaymentId: cryptoPayment._id,
      depositId: deposit._id,
      status: cryptoPayment.status,
      estimatedProcessingTime: '1-3 hours for manual verification'
    });
  } catch (error) {
    console.error('❌ Submit crypto payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Submit bank transfer payment - Creates proper payment records for admin tracking
export const submitBankTransferPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      accountId,
      amount,
      userBankDetails,
      referenceNumber,
      proofOfPayment,
      investmentPlanId // Optional: For dashboard investments
    } = req.body;
    const userId = (req as any).user.userId;

    console.log('🏦 Processing bank transfer submission:', {
      userId,
      accountId,
      amount,
      userBankDetails,
      referenceNumber,
      hasProof: !!proofOfPayment,
      investmentPlanId: investmentPlanId || 'not specified (onboarding)'
    });

    if (!accountId || !amount) {
      res.status(400).json({ message: 'Bank account ID and amount are required' });
      return;
    }

    // Get bank account details
    const bankAccount = await BankAccount.findById(accountId);
    if (!bankAccount || !bankAccount.isActive) {
      res.status(404).json({ message: 'Bank account not found or inactive' });
      return;
    }

    // Import payment models
    const { Payment, BankTransferPayment } = require('../models/PaymentModels');

    // Create base payment record
    const basePayment = new Payment({
      userId,
      amount: parseFloat(amount),
      currency: 'USD',
      paymentMethod: 'bank_transfer',
      status: 'pending',
      metadata: {
        accountId,
        bankName: bankAccount.bankName,
        referenceNumber: referenceNumber || `REF-${Date.now()}`,
        submittedAt: new Date()
      }
    });

    await basePayment.save();
    console.log('✅ Base payment record created:', basePayment._id);

    // Handle proof of payment upload if provided
    let receiptFile: { filename: string; originalName: string; mimetype: string; size: number; path: string } | null = null;
    if (proofOfPayment) {
      try {
        const uploadResult = await uploadFile(proofOfPayment, 'payment-proofs/bank', {
          resourceType: 'auto',
          publicId: `bank-proof-${userId}-${Date.now()}`
        });

        if (uploadResult.success && uploadResult.data) {
          receiptFile = {
            filename: `bank-proof-${userId}-${Date.now()}`,
            originalName: 'bank-receipt',
            mimetype: 'image/jpeg', // Default, could be detected
            size: 0, // Size not available from base64
            path: uploadResult.data.secure_url
          };
        }
      } catch (uploadError) {
        console.error('⚠️ Failed to upload receipt, continuing without it:', uploadError);
      }
    }

    // Create bank transfer payment record
    const bankTransferPayment = new BankTransferPayment({
      paymentId: basePayment._id,
      userId,
      amount: parseFloat(amount),
      currency: 'USD',
      referenceCode: referenceNumber || `REF-${Date.now()}`,

      // User bank details (if provided)
      userBankName: userBankDetails?.bankName || 'Not provided',
      userAccountNumber: userBankDetails?.accountNumber || 'Not provided',
      userRoutingNumber: userBankDetails?.routingNumber || 'Not provided',
      userAccountHolderName: userBankDetails?.accountHolderName || 'Not provided',
      userSwiftCode: userBankDetails?.swiftCode,

      // Company bank details used
      companyBankName: bankAccount.bankName,
      companyAccountNumber: bankAccount.accountNumber,
      companyRoutingNumber: bankAccount.routingNumber || 'N/A',

      receiptFile,
      status: 'pending'
    });

    await bankTransferPayment.save();
    console.log('✅ Bank transfer payment record created:', bankTransferPayment._id);

    // Create corresponding deposit record for consistency (like we do for crypto)
    const depositData: any = {
      userId,
      paymentMethod: 'bank_transfer',
      bankAccountId: accountId,
      amount: parseFloat(amount),
      proofOfPayment: receiptFile?.path,
      bankTransferReference: referenceNumber || `REF-${Date.now()}`,
      status: 'pending'
    };

    // If investmentPlanId is provided (dashboard investment), save it
    if (investmentPlanId) {
      depositData.investmentPlanId = investmentPlanId;
      console.log(`📋 Deposit linked to investment plan: ${investmentPlanId}`);
    } else {
      console.log(`📋 Deposit created without plan link (onboarding flow)`);
    }

    const deposit = new Deposit(depositData);
    await deposit.save();
    console.log('✅ Corresponding deposit record created:', deposit._id);

    res.status(201).json({
      success: true,
      message: 'Bank transfer payment submitted successfully and recorded for admin review',
      paymentId: basePayment._id,
      bankTransferPaymentId: bankTransferPayment._id,
      depositId: deposit._id,
      status: basePayment.status,
      referenceCode: bankTransferPayment.referenceCode,
      estimatedProcessingTime: '1-3 business days for verification'
    });
  } catch (error) {
    console.error('❌ Submit bank transfer payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Submit card payment
export const submitCardPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cardDetails, amount, proofOfPayment } = req.body;
    const userId = (req as any).user.id;

    if (!cardDetails || !amount) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    let proofUrl: string | null = null;
    if (proofOfPayment) {
      // Upload proof of payment to Cloudinary
      const uploadResult = await uploadFile(proofOfPayment, 'payment-proofs', {
        resourceType: 'auto'
      });

      if (!uploadResult.success || !uploadResult.data) {
        res.status(500).json({ message: 'Failed to upload proof of payment' });
        return;
      }

      proofUrl = uploadResult.data.secure_url;
    }

    // Create card payment record
    const cardPayment = new CardPayment({
      cardNumber: cardDetails.cardNumber,
      expiryDate: cardDetails.expiryDate,
      cvv: cardDetails.cvv,
      cardholderName: cardDetails.cardholderName
    });

    await cardPayment.save();

    // Create deposit record
    const deposit = new Deposit({
      userId,
      paymentMethod: 'card',
      cardPayment: cardPayment._id,
      amount: parseFloat(amount),
      proofOfPayment: proofUrl,
      status: 'pending'
    });

    await deposit.save();

    res.status(201).json({
      message: 'Card payment submitted successfully',
      depositId: deposit._id,
      status: deposit.status
    });
  } catch (error) {
    console.error('Submit card payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's payment history
export const getUserPaymentHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10 } = req.query;

    // Get deposits
    const deposits = await Deposit.find({ userId })
      .populate('cryptoWallet', 'name')
      .populate('bankAccount', 'bankName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // Get card payments
    const { SimpleCardPayment } = await import('../models/SimpleCardPayment');
    const cardPayments = await SimpleCardPayment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const totalDeposits = await Deposit.countDocuments({ userId });
    const totalCardPayments = await SimpleCardPayment.countDocuments({ userId });

    res.json({
      deposits,
      cardPayments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalDeposits + totalCardPayments,
        pages: Math.ceil((totalDeposits + totalCardPayments) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get user payment history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Check payment status
export const checkPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { depositId } = req.params;

    const deposit = await Deposit.findOne({ _id: depositId, userId })
      .populate('cryptoWallet', 'name')
      .populate('bankAccount', 'bankName')
      .populate('cardPayment', 'status');

    if (!deposit) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }

    res.json({ deposit });
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Legacy functions for backward compatibility
export const depositFunds = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: "Please use the new payment endpoints" });
};

export const withdrawFunds = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    message: "Withdraw endpoint deprecated. Please use /api/withdrawals/request endpoint instead",
    newEndpoint: "/api/withdrawals/request"
  });
};

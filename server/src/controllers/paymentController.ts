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

    let cryptoWallets = [];
    let bankAccounts = [];

    if (config?.cryptoEnabled) {
      cryptoWallets = await CryptoWallet.find({ isActive: true }).select('name icon');
    }

    if (config?.bankTransferEnabled) {
      bankAccounts = await BankAccount.find({ isActive: true }).select('bankName accountName');
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
        swiftCode: account.swiftCode
      },
      amount: amount || 0
    });
  } catch (error) {
    console.error('Get bank account details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Submit crypto payment
export const submitCryptoPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletId, amount, proofOfPayment } = req.body;
    const userId = (req as any).user.id;

    if (!walletId || !amount || !proofOfPayment) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Upload proof of payment to Cloudinary
    const uploadResult = await uploadFile(proofOfPayment, 'payment-proofs', {
      resourceType: 'auto'
    });

    if (!uploadResult.success || !uploadResult.data) {
      res.status(500).json({ message: 'Failed to upload proof of payment' });
      return;
    }

    // Create deposit record
    const deposit = new Deposit({
      userId,
      paymentMethod: 'crypto',
      cryptoWallet: walletId,
      amount: parseFloat(amount),
      proofOfPayment: uploadResult.data.secure_url,
      status: 'pending'
    });

    await deposit.save();

    res.status(201).json({
      message: 'Crypto payment submitted successfully',
      depositId: deposit._id,
      status: deposit.status
    });
  } catch (error) {
    console.error('Submit crypto payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Submit bank transfer payment
export const submitBankTransferPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountId, amount, proofOfPayment } = req.body;
    const userId = (req as any).user.id;

    if (!accountId || !amount || !proofOfPayment) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Upload proof of payment to Cloudinary
    const uploadResult = await uploadFile(proofOfPayment, 'payment-proofs', {
      resourceType: 'auto'
    });

    if (!uploadResult.success || !uploadResult.data) {
      res.status(500).json({ message: 'Failed to upload proof of payment' });
      return;
    }

    // Create deposit record
    const deposit = new Deposit({
      userId,
      paymentMethod: 'bank_transfer',
      bankAccount: accountId,
      amount: parseFloat(amount),
      proofOfPayment: uploadResult.data.secure_url,
      status: 'pending'
    });

    await deposit.save();

    res.status(201).json({
      message: 'Bank transfer payment submitted successfully',
      depositId: deposit._id,
      status: deposit.status
    });
  } catch (error) {
    console.error('Submit bank transfer payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
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

    let proofUrl = null;
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

import { Request, Response } from 'express';
import PaymentConfig from '../models/PaymentConfig';
import CryptoWallet from '../models/CryptoWallet';
import BankAccount from '../models/BankAccount';
import Deposit from '../models/Deposit';
import { CardPayment } from '../models/CardPayment';
import { uploadFile } from '../config/cloudinary';

// Helper function to upload assets from base64 data
const uploadAsset = async (base64Data: string, folder: string, publicId: string) => {
  try {
    const uploadResult = await uploadFile(base64Data, folder, {
      resourceType: 'image',
      publicId
    });

    return uploadResult;
  } catch (error) {
    console.error('Upload asset error:', error);
    return { success: false, error: 'Failed to upload file' };
  }
};

// Payment Configuration Management
export const getPaymentConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    let config = await PaymentConfig.findOne();

    // Create default config if none exists
    if (!config) {
      config = new PaymentConfig({
        cryptoEnabled: false,
        bankTransferEnabled: false,
        cardPaymentEnabled: false
      });
      await config.save();
    }

    res.json({ config });
  } catch (error) {
    console.error('Get payment config error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePaymentConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cryptoEnabled, bankTransferEnabled, cardPaymentEnabled } = req.body;

    let config = await PaymentConfig.findOne();

    if (!config) {
      config = new PaymentConfig();
    }

    config.cryptoEnabled = cryptoEnabled;
    config.bankTransferEnabled = bankTransferEnabled;
    config.cardPaymentEnabled = cardPaymentEnabled;

    await config.save();

    res.json({ message: 'Payment configuration updated', config });
  } catch (error) {
    console.error('Update payment config error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Crypto Wallet Management
export const getCryptoWallets = async (req: Request, res: Response): Promise<void> => {
  try {
    const wallets = await CryptoWallet.find().sort({ createdAt: -1 });
    res.json({ wallets });
  } catch (error) {
    console.error('Get crypto wallets error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCryptoWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, address, network, iconFile } = req.body;
    let iconUrl = '';

    if (!name || !address) {
      res.status(400).json({ message: 'Name and address are required' });
      return;
    }

    // Handle icon upload if provided
    if (iconFile) {
      const uploadResult = await uploadAsset(
        iconFile,
        'wallet-icons',
        `wallet-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      );

      if (uploadResult.success) {
        iconUrl = uploadResult.data?.secure_url || '';
      } else {
        res.status(500).json({ message: 'Failed to upload wallet icon' });
        return;
      }
    }

    const wallet = new CryptoWallet({
      name,
      address,
      network,
      icon: iconUrl
    });

    await wallet.save();

    res.status(201).json({ message: 'Crypto wallet created', wallet });
  } catch (error) {
    console.error('Create crypto wallet error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCryptoWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, address, network, isActive, iconFile } = req.body;
    let updateData: any = { name, address, network, isActive };

    // Handle icon upload if provided
    if (iconFile) {
      const uploadResult = await uploadAsset(
        iconFile,
        'wallet-icons',
        `wallet-${name?.toLowerCase().replace(/\s+/g, '-') || 'updated'}-${Date.now()}`
      );

      if (uploadResult.success) {
        updateData.icon = uploadResult.data?.secure_url;
      } else {
        res.status(500).json({ message: 'Failed to upload wallet icon' });
        return;
      }
    }

    const wallet = await CryptoWallet.findByIdAndUpdate(id, updateData, { new: true });

    if (!wallet) {
      res.status(404).json({ message: 'Crypto wallet not found' });
      return;
    }

    res.json({ message: 'Crypto wallet updated', wallet });
  } catch (error) {
    console.error('Update crypto wallet error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCryptoWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const wallet = await CryptoWallet.findByIdAndDelete(id);
    if (!wallet) {
      res.status(404).json({ message: 'Crypto wallet not found' });
      return;
    }

    res.json({ message: 'Crypto wallet deleted' });
  } catch (error) {
    console.error('Delete crypto wallet error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Bank Account Management
export const getBankAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const accounts = await BankAccount.find().sort({ createdAt: -1 });
    res.json({ accounts });
  } catch (error) {
    console.error('Get bank accounts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createBankAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bankName, accountName, accountNumber, routingNumber, swiftCode, bankAddress } = req.body;

    if (!bankName || !accountName || !accountNumber) {
      res.status(400).json({ message: 'Bank name, account name, and account number are required' });
      return;
    }

    const account = new BankAccount({
      bankName,
      accountName,
      accountNumber,
      routingNumber,
      swiftCode,
      bankAddress
    });

    await account.save();

    res.status(201).json({ message: 'Bank account created', account });
  } catch (error) {
    console.error('Create bank account error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBankAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { bankName, accountName, accountNumber, routingNumber, swiftCode, bankAddress, isActive } = req.body;

    const account = await BankAccount.findByIdAndUpdate(
      id,
      { bankName, accountName, accountNumber, routingNumber, swiftCode, bankAddress, isActive },
      { new: true }
    );

    if (!account) {
      res.status(404).json({ message: 'Bank account not found' });
      return;
    }

    res.json({ message: 'Bank account updated', account });
  } catch (error) {
    console.error('Update bank account error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteBankAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const account = await BankAccount.findByIdAndDelete(id);
    if (!account) {
      res.status(404).json({ message: 'Bank account not found' });
      return;
    }

    res.json({ message: 'Bank account deleted' });
  } catch (error) {
    console.error('Delete bank account error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Deposit Management
export const getAllDeposits = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, paymentMethod, page = 1, limit = 10 } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const deposits = await Deposit.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('cryptoWalletId')
      .populate('bankAccountId')
      .populate('cardPaymentId')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Deposit.countDocuments(filter);

    res.json({
      deposits,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get all deposits error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateDepositStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const deposit = await Deposit.findByIdAndUpdate(
      id,
      {
        status,
        adminNotes,
        processedAt: status !== 'pending' ? new Date() : undefined
      },
      { new: true }
    ).populate('userId', 'firstName lastName email');

    if (!deposit) {
      res.status(404).json({ message: 'Deposit not found' });
      return;
    }

    // If approved, update user balance (this would be implemented in user service)
    if (status === 'approved') {
      // TODO: Update user balance/portfolio
    }

    res.json({ message: 'Deposit status updated', deposit });
  } catch (error) {
    console.error('Update deposit status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Card Payment Management
export const getAllCardPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter: any = {};
    if (status) filter.status = status;

    const cardPayments = await CardPayment.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await CardPayment.countDocuments(filter);

    res.json({
      cardPayments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get all card payments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCardPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['processing', 'approved', 'failed'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const cardPayment = await CardPayment.findByIdAndUpdate(
      id,
      {
        status,
        adminProcessed: true
      },
      { new: true }
    ).populate('userId', 'firstName lastName email');

    if (!cardPayment) {
      res.status(404).json({ message: 'Card payment not found' });
      return;
    }

    // If approved, create or update corresponding deposit
    if (status === 'approved') {
      await Deposit.findOneAndUpdate(
        { cardPaymentId: cardPayment._id },
        { status: 'approved', processedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Card payment status updated', cardPayment });
  } catch (error) {
    console.error('Update card payment status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

import { Request, Response } from 'express';
import PaymentConfig from '../models/PaymentConfig';
import CryptoWallet from '../models/CryptoWallet';
import BankAccount from '../models/BankAccount';
import Deposit from '../models/Deposit';
import { CardPayment } from '../models/CardPayment';
import { SimpleCardPayment } from '../models/SimpleCardPayment';
import { uploadFile } from '../config/cloudinary';
import { activateInvestmentFromPayment } from '../services/investmentService';

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
        cryptoEnabled: true,  // Enable by default since we have the simple card payment system
        bankTransferEnabled: true,
        cardPaymentEnabled: true
      });
      await config.save();
      console.log('Default PaymentConfig created in admin:', config);
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

    // Map database field names to frontend-expected field names
    const formattedWallets = wallets.map(wallet => ({
      _id: wallet._id,
      name: wallet.name,
      address: wallet.address,
      network: wallet.network,
      icon: wallet.icon,
      active: wallet.isActive, // Map isActive to active for frontend consistency
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt
    }));

    res.json({ wallets: formattedWallets });
  } catch (error) {
    console.error('Get crypto wallets error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCryptoWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, address, network, iconFile, icon } = req.body;
    let iconUrl = icon || ''; // Use pre-uploaded icon URL if provided

    if (!name || !address) {
      res.status(400).json({ message: 'Name and address are required' });
      return;
    }

    // Handle icon upload if iconFile is provided (fallback method)
    if (iconFile && !icon) {
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

    if (!iconUrl) {
      res.status(400).json({ message: 'Icon is required' });
      return;
    }

    const wallet = new CryptoWallet({
      name,
      address,
      network,
      icon: iconUrl
    });

    await wallet.save();

    // Format response to match frontend expectations
    const formattedWallet = {
      _id: wallet._id,
      name: wallet.name,
      address: wallet.address,
      network: wallet.network,
      icon: wallet.icon,
      active: wallet.isActive,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt
    };

    res.status(201).json({ message: 'Crypto wallet created', wallet: formattedWallet });
  } catch (error) {
    console.error('Create crypto wallet error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCryptoWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, address, network, isActive, active, iconFile, icon } = req.body;

    // Handle both 'active' and 'isActive' for frontend compatibility
    const activeStatus = active !== undefined ? active : isActive;
    let updateData: any = { name, address, network };

    if (activeStatus !== undefined) {
      updateData.isActive = activeStatus;
    }

    // Handle pre-uploaded icon URL
    if (icon) {
      updateData.icon = icon;
    }

    // Handle icon upload if provided (fallback method)
    if (iconFile && !icon) {
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

    // Format response to match frontend expectations
    const formattedWallet = {
      _id: wallet._id,
      name: wallet.name,
      address: wallet.address,
      network: wallet.network,
      icon: wallet.icon,
      active: wallet.isActive,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt
    };

    res.json({ message: 'Crypto wallet updated', wallet: formattedWallet });
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

    // Map database field names to frontend-expected field names
    const formattedAccounts = accounts.map(account => ({
      _id: account._id,
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      routingNumber: account.routingNumber || '',
      swiftCode: account.swiftCode || '',
      iban: '', // Not available in current model, set as empty
      country: 'United States', // Default value since not in current model
      currency: 'USD', // Default value since not in current model
      active: account.isActive, // Map isActive to active for frontend consistency
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    }));

    res.json({ accounts: formattedAccounts });
  } catch (error) {
    console.error('Get bank accounts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createBankAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bankName, accountName, accountNumber, routingNumber, swiftCode, bankAddress, iban, country, currency } = req.body;

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

    // Format response to match frontend expectations
    const formattedAccount = {
      _id: account._id,
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      routingNumber: account.routingNumber || '',
      swiftCode: account.swiftCode || '',
      iban: iban || '', // Frontend sends this but we don't store it yet
      country: country || 'United States', // Frontend sends this but we don't store it yet
      currency: currency || 'USD', // Frontend sends this but we don't store it yet
      active: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };

    res.status(201).json({ message: 'Bank account created', account: formattedAccount });
  } catch (error) {
    console.error('Create bank account error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBankAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { bankName, accountName, accountNumber, routingNumber, swiftCode, bankAddress, isActive, active, iban, country, currency } = req.body;

    // Handle both 'active' and 'isActive' for frontend compatibility
    const activeStatus = active !== undefined ? active : isActive;
    let updateData: any = { bankName, accountName, accountNumber, routingNumber, swiftCode, bankAddress };

    if (activeStatus !== undefined) {
      updateData.isActive = activeStatus;
    }

    const account = await BankAccount.findByIdAndUpdate(id, updateData, { new: true });

    if (!account) {
      res.status(404).json({ message: 'Bank account not found' });
      return;
    }

    // Format response to match frontend expectations
    const formattedAccount = {
      _id: account._id,
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      routingNumber: account.routingNumber || '',
      swiftCode: account.swiftCode || '',
      iban: iban || '', // Frontend sends this but we don't store it yet
      country: country || 'United States', // Frontend sends this but we don't store it yet
      currency: currency || 'USD', // Frontend sends this but we don't store it yet
      active: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };

    res.json({ message: 'Bank account updated', account: formattedAccount });
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
      try {
        // Extract the actual user ID from the populated object
        const userId = (deposit.userId as any)._id.toString();
        console.log(`🚀 Activating investment for user ID: ${userId}, amount: ${deposit.amount}`);
        await activateInvestmentFromPayment(
          userId,
          (deposit._id as any).toString(),
          deposit.amount
        );
        console.log(`✅ Investment activated successfully for deposit ${(deposit._id as any)}`);
      } catch (error) {
        console.error(`❌ Error activating investment for deposit ${(deposit._id as any)}:`, error);
        // Don't fail the payment approval if investment activation fails
        // The admin can handle this separately if needed
      }
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

    const cardPayments = await SimpleCardPayment.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await SimpleCardPayment.countDocuments(filter);

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
    const { status, processingNotes } = req.body;

    if (!['processing', 'approved', 'rejected', 'failed'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const cardPayment = await SimpleCardPayment.findOneAndUpdate(
      { paymentId: id },
      {
        status,
        processingNotes,
        processedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'firstName lastName email');

    if (!cardPayment) {
      res.status(404).json({ message: 'Card payment not found' });
      return;
    }

    // If approved, create or update corresponding deposit
    if (status === 'approved') {
      const updatedDeposit = await Deposit.findOneAndUpdate(
        {
          userId: cardPayment.userId,
          adminNotes: `Card Payment - ${cardPayment.paymentId}`
        },
        {
          status: 'approved',
          processedAt: new Date(),
          adminNotes: `Card Payment - ${cardPayment.paymentId} - Approved by admin`
        },
        { new: true }
      );

      // Activate investment for the user when card payment is approved
      try {
        // Extract the actual user ID from the populated object
        const userId = (cardPayment.userId as any)._id.toString();
        console.log(`🚀 Activating investment for card payment: ${cardPayment.paymentId}, user ID: ${userId}, amount: ${cardPayment.amount}`);
        await activateInvestmentFromPayment(
          userId,
          cardPayment.paymentId,
          cardPayment.amount
        );
        console.log(`✅ Investment activated successfully for card payment ${cardPayment.paymentId}`);
      } catch (error) {
        console.error(`❌ Error activating investment for card payment ${cardPayment.paymentId}:`, error);
        // Don't fail the payment approval if investment activation fails
        // The admin can handle this separately if needed
      }
    } else if (status === 'rejected') {
      await Deposit.findOneAndUpdate(
        {
          userId: cardPayment.userId,
          adminNotes: `Card Payment - ${cardPayment.paymentId}`
        },
        {
          status: 'rejected',
          processedAt: new Date(),
          adminNotes: `Card Payment - ${cardPayment.paymentId} - Rejected by admin`
        },
        { new: true }
      );
    }

    res.json({ message: 'Card payment status updated', cardPayment });
  } catch (error) {
    console.error('Update card payment status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Manual Investment Creation from Deposit
export const startInvestmentFromDeposit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Find the approved deposit
    const deposit = await Deposit.findById(id).populate('userId', 'firstName lastName email');

    if (!deposit) {
      res.status(404).json({ message: 'Deposit not found' });
      return;
    }

    if (deposit.status !== 'approved') {
      res.status(400).json({ message: 'Only approved deposits can be used to start investments' });
      return;
    }

    // Try to activate investment
    try {
      // Extract the actual user ID from the populated object
      const userId = (deposit.userId as any)._id.toString();
      console.log(`🚀 Manually starting investment for deposit ${id}, user ID: ${userId}, amount: ${deposit.amount}`);
      const investment = await activateInvestmentFromPayment(
        userId,
        (deposit._id as any).toString(),
        deposit.amount
      );
      console.log(`✅ Investment manually created successfully: ${investment._id}`);

      res.json({
        message: 'Investment started successfully',
        investment: {
          _id: investment._id,
          status: investment.status,
          amount: investment.amount
        }
      });
    } catch (error) {
      console.error(`❌ Error manually starting investment for deposit ${id}:`, error);
      res.status(400).json({
        message: 'Failed to start investment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Start investment from deposit error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

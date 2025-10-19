import { Request, Response } from 'express';
import PaymentConfig from '../models/PaymentConfig';
import CryptoWallet from '../models/CryptoWallet';
import BankAccount from '../models/BankAccount';
import Deposit from '../models/Deposit';
import { CardPayment } from '../models/CardPayment';
import { SimpleCardPayment } from '../models/SimpleCardPayment';
import { uploadFile } from '../config/cloudinary';
import { activateInvestmentFromPayment } from '../services/investmentService';
import { User } from '../models/User';
import { UserInvestment } from '../models/UserInvestment';
import InvestmentPlan from '../models/InvestmentPlan';
import { sendDepositApprovedEmail, sendInvestmentStartedEmail } from '../utils/emailHandler';

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
      bankAddress: account.bankAddress || '',
      businessAddress: account.businessAddress || '',
      iban: account.iban || '',
      country: account.country,
      currency: account.currency,
      active: account.isActive, // Map isActive to active for frontend consistency
      isActive: account.isActive, // Also include isActive for new code
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
    const { bankName, accountName, accountNumber, routingNumber, swiftCode, bankAddress, businessAddress, iban, country, currency } = req.body;

    if (!bankName || !accountName || !accountNumber) {
      res.status(400).json({ message: 'Bank name, account name, and account number are required' });
      return;
    }

    if (!country || !currency) {
      res.status(400).json({ message: 'Country and currency are required' });
      return;
    }

    const account = new BankAccount({
      bankName,
      accountName,
      accountNumber,
      routingNumber,
      swiftCode,
      iban,
      bankAddress,
      businessAddress,
      country,
      currency
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
      bankAddress: account.bankAddress || '',
      businessAddress: account.businessAddress || '',
      iban: account.iban || '',
      country: account.country,
      currency: account.currency,
      active: account.isActive,
      isActive: account.isActive,
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
    const { bankName, accountName, accountNumber, routingNumber, swiftCode, bankAddress, businessAddress, isActive, active, iban, country, currency } = req.body;

    // Handle both 'active' and 'isActive' for frontend compatibility
    const activeStatus = active !== undefined ? active : isActive;
    let updateData: any = { bankName, accountName, accountNumber, routingNumber, swiftCode, iban, bankAddress, businessAddress, country, currency };

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
      bankAddress: account.bankAddress || '',
      businessAddress: account.businessAddress || '',
      iban: account.iban || '',
      country: account.country,
      currency: account.currency,
      active: account.isActive,
      isActive: account.isActive,
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
      const userId = (deposit.userId as any)._id.toString();
      const userEmail = (deposit.userId as any).email;
      const userName = `${(deposit.userId as any).firstName} ${(deposit.userId as any).lastName}`;

      try {
        console.log(`🚀 Activating investment for user ID: ${userId}, amount: ${deposit.amount}`);
        await activateInvestmentFromPayment(
          userId,
          (deposit._id as any).toString(),
          deposit.amount
        );
        console.log(`✅ Investment activated successfully for deposit ${(deposit._id as any)}`);

        // Send deposit approved email
        try {
          await sendDepositApprovedEmail(userEmail, userName, deposit.amount);
          console.log(`✅ Deposit approved email sent to ${userEmail}`);
        } catch (emailError) {
          console.error('❌ Error sending deposit approved email:', emailError);
        }

        // Get investment details to send investment started email
        try {
          const investment = await UserInvestment.findOne({
            userId,
            depositId: (deposit._id as any).toString(),
            status: 'active'
          }).populate('investmentPlan');

          if (investment && investment.investmentPlan && investment.amountInvested) {
            const plan = investment.investmentPlan as any;
            await sendInvestmentStartedEmail(
              userEmail,
              userName,
              investment.amountInvested,
              plan.name,
              plan.duration,
              plan.profitPercentage
            );
            console.log(`✅ Investment started email sent to ${userEmail}`);
          }
        } catch (emailError) {
          console.error('❌ Error sending investment started email:', emailError);
        }
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

// Delete Deposit (Admin only)
export const deleteDeposit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deposit = await Deposit.findById(id);

    if (!deposit) {
      res.status(404).json({ message: 'Deposit not found' });
      return;
    }

    // Check if deposit has an associated active investment
    const hasActiveInvestment = await UserInvestment.findOne({
      depositId: id,
      status: 'active'
    });

    if (hasActiveInvestment) {
      res.status(400).json({
        message: 'Cannot delete deposit with an active investment. Please close the investment first.'
      });
      return;
    }

    // Delete the deposit
    await Deposit.findByIdAndDelete(id);

    console.log(`✅ Deposit ${id} deleted by admin`);
    res.json({ message: 'Deposit deleted successfully' });
  } catch (error) {
    console.error('Delete deposit error:', error);
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

// ===== NEW PAYMENT SYSTEM ADMIN FUNCTIONS =====

// Get all payments (new payment system)
export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, paymentMethod, page = 1, limit = 50 } = req.query;

    // Import payment models
    const { Payment } = await import('../models/PaymentModels');

    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const skip = (Number(page) - 1) * Number(limit);

    const payments = await Payment.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(filter);

    console.log(`📋 Admin fetched ${payments.length} payments (total: ${total})`);

    res.json({
      success: true,
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all crypto payments
export const getAllCryptoPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    // Import payment models
    const { CryptoPayment } = await import('../models/PaymentModels');

    // Build filter for crypto payments
    const filter: any = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    // Get crypto payments directly with user data populated
    const cryptoPayments = await CryptoPayment.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Format the data to match frontend expectations
    const paymentDetails = cryptoPayments.map((cryptoPayment) => {
      return {
        _id: cryptoPayment._id,
        paymentId: cryptoPayment._id,
        userId: cryptoPayment.userId,
        cryptocurrency: cryptoPayment.cryptocurrency,
        fiatAmount: cryptoPayment.fiatAmount,
        fiatCurrency: cryptoPayment.fiatCurrency,
        companyWalletAddress: cryptoPayment.companyWalletAddress,
        userWalletAddress: cryptoPayment.userWalletAddress,
        network: cryptoPayment.network,
        transactionHash: cryptoPayment.transactionHash,
        confirmations: cryptoPayment.confirmations,
        blockchainVerified: cryptoPayment.blockchainVerified,
        proofFile: cryptoPayment.proofFile,
        status: cryptoPayment.status,
        verificationNotes: cryptoPayment.verificationNotes,
        createdAt: cryptoPayment.createdAt,
        updatedAt: cryptoPayment.updatedAt
      };
    });

    const total = await CryptoPayment.countDocuments(filter); console.log(`💰 Admin fetched ${paymentDetails.length} crypto payments (total: ${total})`);

    res.json({
      success: true,
      payments: paymentDetails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get all crypto payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all bank transfer payments
export const getAllBankTransferPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    // Import payment models
    const { Payment, BankTransferPayment } = await import('../models/PaymentModels');

    // Build filter for base payments
    const baseFilter: any = { paymentMethod: 'bank_transfer' };
    if (status) baseFilter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    // Get base payments first
    const basePayments = await Payment.find(baseFilter)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get detailed bank transfer payment data
    const paymentDetails = await Promise.all(
      basePayments.map(async (payment) => {
        const bankTransferPayment = await BankTransferPayment.findOne({ paymentId: payment._id });
        return {
          basePayment: payment,
          bankTransferDetails: bankTransferPayment
        };
      })
    );

    const total = await Payment.countDocuments(baseFilter);

    console.log(`🏦 Admin fetched ${paymentDetails.length} bank transfer payments (total: ${total})`);

    res.json({
      success: true,
      payments: paymentDetails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get all bank transfer payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = (req as any).admin.adminId;

    console.log(`🔄 Admin updating payment ${id} to status: ${status}`);

    // Import payment models
    const { Payment } = await import('../models/PaymentModels');

    // Find and update the base payment
    const payment = await Payment.findById(id);
    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
      return;
    }

    // Update payment status
    payment.status = status;
    if (adminNotes) payment.adminNotes = adminNotes;
    payment.processedBy = adminId;
    await payment.save();

    console.log(`✅ Payment ${id} status updated to: ${status}`);

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      payment: {
        _id: payment._id,
        status: payment.status,
        adminNotes: payment.adminNotes,
        processedBy: payment.processedBy,
        updatedAt: payment.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ===== NEW PAYMENT SYSTEM MANAGEMENT =====

// Get all crypto payments
export const getCryptoPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, cryptocurrency, limit = 50, offset = 0 } = req.query;

    console.log('🔍 Fetching crypto payments with filters:', { status, cryptocurrency, limit, offset });

    // Import models dynamically
    const { Payment, CryptoPayment } = await import('../models/PaymentModels');

    // Build filter query
    const paymentFilter: any = { paymentMethod: 'crypto' };
    if (status && status !== 'all') {
      paymentFilter.status = status;
    }

    const cryptoFilter: any = {};
    if (cryptocurrency) {
      cryptoFilter.cryptocurrency = cryptocurrency;
    }

    // Get base payments with crypto method
    const basePayments = await Payment.find(paymentFilter)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    console.log(`📊 Found ${basePayments.length} base crypto payments`);

    // Get corresponding crypto payment details
    const cryptoPayments = await Promise.all(
      basePayments.map(async (basePayment) => {
        const cryptoDetail = await CryptoPayment.findOne({
          paymentId: basePayment._id,
          ...cryptoFilter
        });

        if (!cryptoDetail) {
          console.log(`⚠️ No crypto details found for payment ${basePayment._id}`);
          return null;
        }

        return {
          _id: cryptoDetail._id,
          paymentId: basePayment._id,
          userId: basePayment.userId,
          cryptocurrency: cryptoDetail.cryptocurrency,
          fiatAmount: cryptoDetail.fiatAmount,
          fiatCurrency: cryptoDetail.fiatCurrency,
          companyWalletAddress: cryptoDetail.companyWalletAddress,
          userWalletAddress: cryptoDetail.userWalletAddress,
          network: cryptoDetail.network,
          transactionHash: cryptoDetail.transactionHash,
          confirmations: cryptoDetail.confirmations,
          blockchainVerified: cryptoDetail.blockchainVerified,
          proofFile: cryptoDetail.proofFile,
          status: cryptoDetail.status,
          verificationNotes: cryptoDetail.verificationNotes,
          createdAt: cryptoDetail.createdAt,
          updatedAt: cryptoDetail.updatedAt
        };
      })
    );

    // Filter out null results
    const validCryptoPayments = cryptoPayments.filter(payment => payment !== null);

    console.log(`✅ Returning ${validCryptoPayments.length} crypto payments`);

    res.json({
      success: true,
      data: validCryptoPayments,
      pagination: {
        total: validCryptoPayments.length,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    console.error('❌ Get crypto payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update crypto payment status
export const updateCryptoPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const { status, notes } = req.body;

    console.log('🔄 Updating crypto payment status:', { paymentId, status, notes });

    // Import models dynamically
    const { CryptoPayment } = await import('../models/PaymentModels');
    const mongoose = await import('mongoose');

    // Convert paymentId to ObjectId
    const paymentObjectId = new mongoose.Types.ObjectId(paymentId);

    // Update crypto payment directly (no more paymentId reference)
    const cryptoPayment = await CryptoPayment.findByIdAndUpdate(
      paymentObjectId,
      {
        status,
        verificationNotes: notes,
        verifiedBy: (req as any).admin.adminId,
        ...(status === 'verified' && { verificationDate: new Date() })
      },
      { new: true }
    );

    if (!cryptoPayment) {
      res.status(404).json({
        success: false,
        message: 'Crypto payment not found'
      });
      return;
    }

    // Update corresponding deposit status
    const Deposit = (await import('../models/Deposit')).default;
    const depositStatus = status === 'verified' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending';

    const deposit = await Deposit.findOneAndUpdate(
      {
        userId: cryptoPayment.userId,
        paymentMethod: 'crypto',
        status: 'pending'
      },
      {
        status: depositStatus,
        adminNotes: notes || cryptoPayment.verificationNotes,
        processedAt: new Date()
      },
      { new: true, sort: { createdAt: -1 } } // Get the most recent pending deposit
    );

    if (deposit) {
      console.log('✅ Corresponding deposit status updated:', deposit._id);
    }

    console.log('✅ Crypto payment status updated successfully');

    res.json({
      success: true,
      message: 'Crypto payment status updated successfully',
      data: {
        cryptoPaymentId: cryptoPayment._id,
        status: cryptoPayment.status,
        verificationNotes: cryptoPayment.verificationNotes,
        updatedAt: cryptoPayment.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Update crypto payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

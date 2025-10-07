import { Router } from "express";
import {
  depositFunds,
  withdrawFunds,
  getPaymentOptions,
  getCryptoWalletDetails,
  getBankAccountDetails,
  submitCryptoPayment,
  submitBankTransferPayment,
  submitCardPayment,
  getUserPaymentHistory,
  checkPaymentStatus
} from "../controllers/paymentController";
import { protectRoute } from "../middleware/protectRoute";
import { isAdmin } from "../middleware/isAdmin";

// Import existing payment controllers
import bankTransferController from '../controllers/bankTransferController';
import cryptoPaymentController from '../controllers/cryptoPaymentController';
import * as cardPaymentController from '../controllers/cardPaymentController';

const router = Router();

// =====================
// EXISTING ROUTES
// =====================

// Deposit funds (user) - Legacy
router.post("/deposit", protectRoute, depositFunds);

// Withdraw funds (user)
router.post("/withdraw", protectRoute, withdrawFunds);

// For admins: View all payment transactions
router.get("/all", protectRoute, isAdmin, (req, res) => {
  res.json({ message: "Admin endpoint for payment transactions - To be implemented" });
});

// =====================
// NEW PAYMENT SYSTEM ROUTES
// =====================

// Get available payment options
router.get("/options", protectRoute, getPaymentOptions);

// Get crypto wallet details
router.get("/crypto/:walletId", protectRoute, getCryptoWalletDetails);

// Get bank account details
router.get("/bank/:accountId", protectRoute, getBankAccountDetails);

// Submit crypto payment
router.post("/crypto/submit", protectRoute, submitCryptoPayment);

// Submit bank transfer payment
router.post("/bank/submit", protectRoute, submitBankTransferPayment);

// Submit card payment
router.post("/card/submit", protectRoute, submitCardPayment);

// Get user payment history
router.get("/history", protectRoute, getUserPaymentHistory);

// Check payment status
router.get("/status/:depositId", protectRoute, checkPaymentStatus);

// =====================
// CARD PAYMENT ROUTES
// =====================

// Add card (tokenize)
router.post('/card/add', protectRoute, cardPaymentController.addCard);

// Process card payment
router.post('/card/process', protectRoute, cardPaymentController.processCardPayment);

// Get user's cards
router.get('/card/list', protectRoute, cardPaymentController.getUserCards);

// Delete card
router.delete('/card/:tokenId', protectRoute, cardPaymentController.deleteCard);

// Admin: Get pending card payments
router.get('/card/admin/pending', protectRoute, isAdmin, cardPaymentController.getCardPaymentsForReview);

// Admin: Approve/reject card payment
router.post('/card/admin/:cardPaymentId/approve', protectRoute, isAdmin, cardPaymentController.approveCardPayment);

// Admin: Verify card token
router.post('/card/admin/:cardTokenId/verify', protectRoute, isAdmin, cardPaymentController.verifyCardToken);

// ========================
// BANK TRANSFER ROUTES
// ========================

// Get company bank details
router.get('/bank-transfer/company-details', bankTransferController.getCompanyBankDetails);

// Submit bank transfer
router.post('/bank-transfer', protectRoute, bankTransferController.submitBankTransfer);

// Get bank transfer details
router.get('/bank-transfer/:paymentId', protectRoute, bankTransferController.getBankTransferDetails);

// Admin: Get pending bank transfers
router.get('/bank-transfer/admin/pending', protectRoute, isAdmin, bankTransferController.getPendingBankTransfers);

// Admin: Verify bank transfer
router.post('/bank-transfer/admin/:id/verify', protectRoute, isAdmin, bankTransferController.verifyBankTransfer);

// ======================
// CRYPTO PAYMENT ROUTES
// ======================

// Get supported cryptocurrencies
router.get('/crypto/supported', cryptoPaymentController.getSupportedCryptos);

// Calculate crypto amount
router.get('/crypto/calculate', cryptoPaymentController.calculateCryptoAmount);

// Submit crypto payment
router.post('/crypto', protectRoute, cryptoPaymentController.submitCryptoPayment);

// Get crypto payment details
router.get('/crypto/:paymentId', protectRoute, cryptoPaymentController.getCryptoPaymentDetails);

// Admin: Get pending crypto payments
router.get('/crypto/admin/pending', protectRoute, isAdmin, cryptoPaymentController.getPendingCryptoPayments);

// Admin: Verify crypto payment
router.post('/crypto/admin/:id/verify', protectRoute, isAdmin, cryptoPaymentController.verifyCryptoPayment);

// Admin: Simulate blockchain verification
router.post('/crypto/admin/blockchain-check', protectRoute, isAdmin, cryptoPaymentController.simulateBlockchainCheck);

// ====================
// GENERAL PAYMENT ROUTES
// ====================

// Create initial payment record
router.post('/create', protectRoute, async (req, res) => {
  try {
    const { amount, currency = 'USD', investmentId, paymentMethod } = req.body;

    if (!amount || !paymentMethod) {
      res.status(400).json({
        success: false,
        message: 'Amount and payment method are required'
      });
      return;
    }

    if (!['card', 'bank_transfer', 'crypto'].includes(paymentMethod)) {
      res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
      return;
    }

    // Import Payment model dynamically to avoid circular dependencies
    const { Payment } = await import('../models/PaymentModels');

    const payment = new Payment({
      userId: (req as any).user.userId,
      investmentId,
      amount: parseFloat(amount),
      currency,
      paymentMethod,
      status: 'pending',
      metadata: {
        createdFrom: 'payment-api',
        userAgent: req.headers['user-agent']
      }
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Payment record created successfully',
      data: {
        paymentId: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        createdAt: payment.createdAt
      }
    });

  } catch (error: any) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment record',
      error: error.message
    });
  }
});

// Get payment status
router.get('/:paymentId/status', protectRoute, async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Import Payment model dynamically
    const { Payment } = await import('../models/PaymentModels');

    const payment = await Payment.findOne({
      _id: paymentId,
      userId: (req as any).user.userId
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        metadata: payment.metadata,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
});

// =====================
// MANUAL PAYMENT CONFIRMATION ROUTES
// =====================

// Confirm crypto payment (no proof required - user confirms they sent it)
router.post('/crypto/confirm', protectRoute, async (req, res) => {
  try {
    const {
      walletId,
      amount,
      transactionHash,
      userWalletAddress,
      proofOfPayment
    } = req.body;
    const userId = (req as any).user.userId;

    console.log('🚀 Confirming crypto payment:', {
      userId,
      walletId,
      amount,
      transactionHash,
      userWalletAddress
    });

    if (!walletId || !amount) {
      res.status(400).json({
        success: false,
        message: 'Wallet ID and amount are required'
      });
      return;
    }

    // Get wallet details
    const CryptoWallet = (await import('../models/CryptoWallet')).default;
    const wallet = await CryptoWallet.findById(walletId);

    if (!wallet || !wallet.isActive) {
      res.status(404).json({
        success: false,
        message: 'Wallet not found or inactive'
      });
      return;
    }

    // Import payment models
    const { Payment, CryptoPayment } = await import('../models/PaymentModels');

    // Create base payment record
    const basePayment = new Payment({
      userId,
      amount: parseFloat(amount),
      currency: 'USD',
      paymentMethod: 'crypto',
      status: 'pending',
      metadata: {
        walletId,
        walletName: wallet.name,
        network: wallet.network,
        confirmedAt: new Date(),
        confirmationType: 'manual'
      }
    });

    await basePayment.save();

    // Handle proof of payment upload if provided
    let proofFile = null;
    if (proofOfPayment) {
      try {
        const { uploadFile } = await import('../config/cloudinary');
        const uploadResult = await uploadFile(proofOfPayment, 'payment-proofs/crypto', {
          resourceType: 'auto',
          publicId: `crypto-proof-${userId}-${Date.now()}`
        });

        if (uploadResult.success && uploadResult.data) {
          proofFile = {
            filename: `crypto-proof-${userId}-${Date.now()}`,
            originalName: 'transaction-screenshot',
            mimetype: 'image/jpeg',
            size: 0,
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

    // Create crypto payment record
    const cryptoPayment = new CryptoPayment({
      paymentId: basePayment._id,
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

    // Create deposit record for admin tracking
    const Deposit = (await import('../models/Deposit')).default;
    const deposit = new Deposit({
      userId,
      amount: parseFloat(amount),
      paymentMethod: 'crypto',
      status: 'pending',
      cryptoWalletId: walletId,
      cryptoTransactionHash: transactionHash || `pending-${Date.now()}`,
      proofOfPayment: proofFile?.path,
      adminNotes: `Crypto Payment - ${wallet.name} - ${cryptoPayment._id}`
    });

    await deposit.save();
    console.log('✅ Deposit record created:', deposit._id);

    res.status(201).json({
      success: true,
      message: 'Crypto payment confirmed and recorded for admin review',
      paymentId: basePayment._id,
      cryptoPaymentId: cryptoPayment._id,
      depositId: deposit._id,
      status: basePayment.status
    });

  } catch (error: any) {
    console.error('❌ Confirm crypto payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Confirm bank transfer payment (no proof required - user confirms they sent it)
router.post('/bank/confirm', protectRoute, async (req, res) => {
  try {
    const {
      accountId,
      amount,
      userBankDetails,
      referenceNumber
    } = req.body;
    const userId = (req as any).user.userId;

    console.log('🏦 Confirming bank transfer:', {
      userId,
      accountId,
      amount,
      userBankDetails,
      referenceNumber
    });

    if (!accountId || !amount) {
      res.status(400).json({
        success: false,
        message: 'Bank account ID and amount are required'
      });
      return;
    }

    // Get bank account details
    const BankAccount = (await import('../models/BankAccount')).default;
    const bankAccount = await BankAccount.findById(accountId);

    if (!bankAccount || !bankAccount.isActive) {
      res.status(404).json({
        success: false,
        message: 'Bank account not found or inactive'
      });
      return;
    }

    // Import payment models
    const { Payment, BankTransferPayment } = await import('../models/PaymentModels');

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
        confirmedAt: new Date(),
        confirmationType: 'manual'
      }
    });

    await basePayment.save();

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

      status: 'pending'
    });

    await bankTransferPayment.save();

    // Create deposit record for admin tracking
    const Deposit = (await import('../models/Deposit')).default;
    const deposit = new Deposit({
      userId,
      amount: parseFloat(amount),
      paymentMethod: 'bank_transfer',
      status: 'pending',
      bankAccountId: accountId,
      bankTransferReference: bankTransferPayment.referenceCode,
      adminNotes: `Bank Transfer - ${bankAccount.bankName} - ${bankTransferPayment._id}`
    });

    await deposit.save();
    console.log('✅ Deposit record created:', deposit._id);

    res.status(201).json({
      success: true,
      message: 'Bank transfer payment confirmed and recorded for admin review',
      paymentId: basePayment._id,
      bankTransferPaymentId: bankTransferPayment._id,
      depositId: deposit._id,
      status: basePayment.status,
      referenceCode: bankTransferPayment.referenceCode
    });

  } catch (error: any) {
    console.error('❌ Confirm bank transfer payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;

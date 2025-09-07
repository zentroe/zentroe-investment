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

export default router;

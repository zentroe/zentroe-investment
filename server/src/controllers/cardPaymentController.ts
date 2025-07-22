import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types/CustomRequest';
import { CardToken, CardPayment } from '../models/CardPayment';
import { Payment } from '../models/PaymentModels';
import { CardEncryption, CardValidator, RiskAssessment, TransactionGenerator } from '../utils/cardSecurity';

/**
 * Add a new card (tokenization)
 */
export const addCard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const {
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      holderName,
      billingAddress
    } = req.body;

    // Validate card details
    if (!CardValidator.validateCardNumber(cardNumber)) {
      res.status(400).json({ message: 'Invalid card number' });
      return;
    }

    if (!CardValidator.validateExpiry(expiryMonth, expiryYear)) {
      res.status(400).json({ message: 'Invalid or expired card' });
      return;
    }

    const cardBrand = CardValidator.detectCardBrand(cardNumber);
    if (!CardValidator.validateCVV(cvv, cardBrand)) {
      res.status(400).json({ message: 'Invalid CVV' });
      return;
    }

    // Check if card already exists (by last 4 and expiry)
    const last4 = cardNumber.slice(-4);
    const existingCard = await CardToken.findOne({
      userId: req.user.userId,
      last4,
      expiryMonth,
      expiryYear,
      isActive: true
    });

    if (existingCard) {
      res.status(409).json({ message: 'This card is already registered' });
      return;
    }

    // Encrypt card data (never store full card number)
    const cardData = JSON.stringify({
      cardNumber: cardNumber.slice(0, 6) + '*'.repeat(cardNumber.length - 10) + cardNumber.slice(-4), // Store only first 6 and last 4
      expiryMonth,
      expiryYear,
      holderName,
      addedAt: new Date().toISOString()
    });

    const encryptedData = CardEncryption.encrypt(cardData);
    const tokenId = CardEncryption.generateToken();

    // Create card token
    const cardToken = new CardToken({
      userId: req.user.userId,
      tokenId,
      encryptedCardData: JSON.stringify(encryptedData),
      last4,
      brand: cardBrand,
      expiryMonth,
      expiryYear,
      holderName: holderName.trim(),
      billingAddress,
      isVerified: false, // Admin needs to verify
      usageCount: 0,
      isActive: true
    });

    await cardToken.save();

    // Return safe card info (no sensitive data)
    res.status(201).json({
      message: 'Card added successfully. Pending admin verification.',
      card: {
        tokenId: cardToken.tokenId,
        last4: cardToken.last4,
        brand: cardToken.brand,
        expiryMonth: cardToken.expiryMonth,
        expiryYear: cardToken.expiryYear,
        holderName: cardToken.holderName,
        isVerified: cardToken.isVerified,
        isActive: cardToken.isActive
      }
    });

  } catch (error: any) {
    console.error('Error adding card:', error);
    res.status(500).json({ message: 'Failed to add card', error: error.message });
  }
};

/**
 * Get user's cards
 */
export const getUserCards = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const cards = await CardToken.find({
      userId: req.user.userId,
      isActive: true
    }).select('tokenId last4 brand expiryMonth expiryYear holderName isVerified createdAt');

    res.status(200).json({ cards });

  } catch (error: any) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ message: 'Failed to fetch cards', error: error.message });
  }
};

/**
 * Process card payment
 */
export const processCardPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { paymentId, cardTokenId, cvv } = req.body;

    // Verify payment exists and belongs to user
    const payment = await Payment.findOne({
      _id: paymentId,
      userId: req.user.userId,
      status: 'pending'
    });

    if (!payment) {
      res.status(404).json({ message: 'Payment not found or already processed' });
      return;
    }

    // Verify card token exists and belongs to user
    const cardToken = await CardToken.findOne({
      _id: cardTokenId,
      userId: req.user.userId,
      isActive: true
    });

    if (!cardToken) {
      res.status(404).json({ message: 'Card not found or inactive' });
      return;
    }

    if (!cardToken.isVerified) {
      res.status(400).json({ message: 'Card not yet verified by admin' });
      return;
    }

    // Validate CVV (you might want to encrypt and validate this)
    if (!CardValidator.validateCVV(cvv, cardToken.brand)) {
      res.status(400).json({ message: 'Invalid CVV' });
      return;
    }

    // Risk assessment
    const now = new Date();
    const riskData = {
      amount: payment.amount,
      userHistory: {}, // You can fetch user transaction history
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay()
    };

    const { score: riskScore, flags: fraudFlags } = RiskAssessment.calculateRiskScore(riskData);

    // Generate transaction ID
    const transactionId = TransactionGenerator.generateTransactionId();

    // Create card payment record
    const cardPayment = new CardPayment({
      paymentId: payment._id,
      userId: req.user.userId,
      cardTokenId: cardToken._id,
      amount: payment.amount,
      currency: payment.currency,
      transactionId,
      processingMethod: riskScore > 50 ? 'manual' : 'manual', // For now, all manual
      processingStatus: 'pending',
      ipAddress: riskData.ipAddress,
      userAgent: riskData.userAgent,
      riskScore,
      fraudFlags
    });

    await cardPayment.save();

    // Update card usage
    cardToken.lastUsed = new Date();
    cardToken.usageCount += 1;
    await cardToken.save();

    // Update payment status
    payment.status = 'processing';
    payment.metadata = {
      ...payment.metadata,
      card: {
        last4: cardToken.last4,
        brand: cardToken.brand,
        expiryMonth: cardToken.expiryMonth,
        expiryYear: cardToken.expiryYear,
        processorTransactionId: transactionId
      }
    };
    await payment.save();

    res.status(200).json({
      message: 'Card payment submitted for processing',
      transactionId,
      status: 'pending_approval',
      riskScore,
      estimatedProcessingTime: riskScore > 50 ? '24-48 hours' : '12-24 hours'
    });

  } catch (error: any) {
    console.error('Error processing card payment:', error);
    res.status(500).json({ message: 'Failed to process payment', error: error.message });
  }
};

/**
 * Admin: Get all card payments for review
 */
export const getCardPaymentsForReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const cardPayments = await CardPayment.find({ processingStatus: status })
      .populate('userId', 'firstName lastName email')
      .populate('cardTokenId', 'last4 brand holderName')
      .populate('paymentId')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await CardPayment.countDocuments({ processingStatus: status });

    res.status(200).json({
      cardPayments,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        count: total
      }
    });

  } catch (error: any) {
    console.error('Error fetching card payments for review:', error);
    res.status(500).json({ message: 'Failed to fetch card payments', error: error.message });
  }
};

/**
 * Admin: Approve card payment
 */
export const approveCardPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { cardPaymentId } = req.params;
    const { processingNotes, bankTransactionId } = req.body;

    const cardPayment = await CardPayment.findById(cardPaymentId)
      .populate('paymentId');

    if (!cardPayment) {
      res.status(404).json({ message: 'Card payment not found' });
      return;
    }

    // Update card payment status
    cardPayment.processingStatus = 'completed';
    cardPayment.processedBy = new mongoose.Types.ObjectId(req.user.userId);
    cardPayment.processedAt = new Date();
    cardPayment.processingNotes = processingNotes;
    cardPayment.bankTransactionId = bankTransactionId;
    await cardPayment.save();

    // Update main payment status
    const payment = await Payment.findById(cardPayment.paymentId);
    if (payment) {
      payment.status = 'completed';
      await payment.save();
    }

    res.status(200).json({
      message: 'Card payment approved successfully',
      cardPayment
    });

  } catch (error: any) {
    console.error('Error approving card payment:', error);
    res.status(500).json({ message: 'Failed to approve card payment', error: error.message });
  }
};

/**
 * Delete a card token
 */
export const deleteCard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { tokenId } = req.params;

    const cardToken = await CardToken.findOne({
      tokenId,
      userId: req.user.userId,
      isActive: true
    });

    if (!cardToken) {
      res.status(404).json({ message: 'Card not found or already deleted' });
      return;
    }

    // Soft delete - mark as inactive
    cardToken.isActive = false;
    await cardToken.save();

    res.status(200).json({
      message: 'Card deleted successfully',
      tokenId: cardToken.tokenId
    });

  } catch (error: any) {
    console.error('Error deleting card:', error);
    res.status(500).json({ message: 'Failed to delete card', error: error.message });
  }
};

/**
 * Admin: Verify card token
 */
export const verifyCardToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { cardTokenId } = req.params;
    const { verificationMethod, notes } = req.body;

    const cardToken = await CardToken.findById(cardTokenId);
    if (!cardToken) {
      res.status(404).json({ message: 'Card token not found' });
      return;
    }

    cardToken.isVerified = true;
    cardToken.verificationMethod = verificationMethod;
    await cardToken.save();

    res.status(200).json({
      message: 'Card verified successfully',
      cardToken: {
        tokenId: cardToken.tokenId,
        last4: cardToken.last4,
        brand: cardToken.brand,
        isVerified: cardToken.isVerified
      }
    });

  } catch (error: any) {
    console.error('Error verifying card:', error);
    res.status(500).json({ message: 'Failed to verify card', error: error.message });
  }
};

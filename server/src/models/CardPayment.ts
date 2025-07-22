import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

// Card tokenization model
export interface ICardToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenId: string;           // Unique token for the card
  encryptedCardData: string; // Encrypted card details
  last4: string;             // Last 4 digits for display
  brand: string;             // Visa, MasterCard, Amex, etc.
  expiryMonth: number;
  expiryYear: number;
  holderName: string;

  // Billing information
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // Security and validation
  isVerified: boolean;       // Admin verified this card
  verificationMethod?: string; // How it was verified
  lastUsed?: Date;
  usageCount: number;

  // Status
  isActive: boolean;
  deactivatedReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const CardTokenSchema = new Schema<ICardToken>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tokenId: { type: String, required: true, unique: true },
  encryptedCardData: { type: String, required: true },
  last4: { type: String, required: true, length: 4 },
  brand: {
    type: String,
    required: true,
    enum: ['Visa', 'MasterCard', 'American Express', 'Discover', 'Other']
  },
  expiryMonth: { type: Number, required: true, min: 1, max: 12 },
  expiryYear: { type: Number, required: true },
  holderName: { type: String, required: true, trim: true },

  billingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'United States' }
  },

  isVerified: { type: Boolean, default: false },
  verificationMethod: String,
  lastUsed: Date,
  usageCount: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true },
  deactivatedReason: String
}, {
  timestamps: true
});

// Indexes
CardTokenSchema.index({ userId: 1, isActive: 1 });
CardTokenSchema.index({ tokenId: 1 });
CardTokenSchema.index({ last4: 1, expiryMonth: 1, expiryYear: 1 });

export const CardToken = mongoose.model<ICardToken>('CardToken', CardTokenSchema);

// Card payment transaction model
export interface ICardPayment extends Document {
  paymentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  cardTokenId: mongoose.Types.ObjectId;

  // Transaction details
  amount: number;
  currency: string;
  transactionId: string;     // Our internal transaction ID

  // Processing details
  processingMethod: 'manual' | 'api' | 'bank_transfer';
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'disputed';

  // Admin processing (for manual method)
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  processingNotes?: string;

  // Bank/API processing (if using bank API)
  bankTransactionId?: string;
  bankResponse?: any;

  // Security and fraud detection
  ipAddress: string;
  userAgent: string;
  riskScore?: number;
  fraudFlags?: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const CardPaymentSchema = new Schema<ICardPayment>({
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cardTokenId: { type: Schema.Types.ObjectId, ref: 'CardToken', required: true },

  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'USD' },
  transactionId: { type: String, required: true, unique: true },

  processingMethod: {
    type: String,
    enum: ['manual', 'api', 'bank_transfer'],
    required: true
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'disputed'],
    default: 'pending'
  },

  processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date,
  processingNotes: String,

  bankTransactionId: String,
  bankResponse: Schema.Types.Mixed,

  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  riskScore: { type: Number, min: 0, max: 100 },
  fraudFlags: [String],
}, {
  timestamps: true
});

// Indexes
CardPaymentSchema.index({ paymentId: 1 });
CardPaymentSchema.index({ userId: 1, processingStatus: 1 });
CardPaymentSchema.index({ transactionId: 1 });
CardPaymentSchema.index({ processingStatus: 1, createdAt: -1 });

export const CardPayment = mongoose.model<ICardPayment>('CardPayment', CardPaymentSchema);

import mongoose, { Document, Schema } from 'mongoose';

// Card token model for storing encrypted card details
export interface ICardToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenId: string;           // Unique token identifier
  last4: string;            // Last 4 digits of card
  expiryMonth: string;
  expiryYear: string;
  cardType: string;         // 'visa', 'mastercard', etc.
  cardholderName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CardTokenSchema = new Schema<ICardToken>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tokenId: { type: String, required: true, unique: true },
  last4: { type: String, required: true },
  expiryMonth: { type: String, required: true },
  expiryYear: { type: String, required: true },
  cardType: { type: String, required: true },
  cardholderName: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes
CardTokenSchema.index({ userId: 1, isActive: 1 });
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
CardPaymentSchema.index({ processingStatus: 1, createdAt: -1 });

export const CardPayment = mongoose.model<ICardPayment>('CardPayment', CardPaymentSchema);

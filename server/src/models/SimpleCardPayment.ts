import mongoose, { Document, Schema } from 'mongoose';

// Simple card payment model for direct card submissions
export interface ISimpleCardPayment extends Document {
  paymentId: string;        // Our internal payment ID
  userId: mongoose.Types.ObjectId;

  // Payment details
  amount: number;
  currency: string;

  // Card details (for manual processing)
  cardNumber: string;       // Last 4 digits or masked
  expiryMonth: string;
  expiryYear: string;
  cvv: string;              // For manual processing (should be encrypted in production)
  holderName: string;

  // Processing status
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'failed';

  // OTP workflow
  needsOtp: boolean;
  otpCode?: string;
  otpRequestedAt?: Date;
  otpSubmittedAt?: Date;

  // Admin processing
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  processingNotes?: string;

  // Security
  ipAddress?: string;
  userAgent?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const SimpleCardPaymentSchema = new Schema<ISimpleCardPayment>({
  paymentId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'USD' },

  cardNumber: { type: String, required: true },  // Store last 4 or masked
  expiryMonth: { type: String, required: true },
  expiryYear: { type: String, required: true },
  cvv: { type: String, required: true },         // Encrypt in production
  holderName: { type: String, required: true, trim: true },

  status: {
    type: String,
    enum: ['pending', 'processing', 'approved', 'rejected', 'failed'],
    default: 'pending'
  },

  needsOtp: { type: Boolean, default: false },
  otpCode: String,
  otpRequestedAt: Date,
  otpSubmittedAt: Date,

  processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date,
  processingNotes: String,

  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true
});

// Indexes
SimpleCardPaymentSchema.index({ userId: 1, status: 1 });
SimpleCardPaymentSchema.index({ status: 1, createdAt: -1 });
// Note: paymentId index is automatically created by unique: true

export const SimpleCardPayment = mongoose.model<ISimpleCardPayment>('SimpleCardPayment', SimpleCardPaymentSchema);

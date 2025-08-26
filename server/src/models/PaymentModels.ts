import mongoose, { Document, Schema } from 'mongoose';

// Base Payment Document Interface
export interface IBasePayment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  investmentId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'bank_transfer' | 'crypto';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'expired';
  metadata: Record<string, any>;
  adminNotes?: string;
  processedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

// Bank Transfer Payment Interface
export interface IBankTransferPayment extends Document {
  _id: mongoose.Types.ObjectId;
  paymentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  // Transfer details
  amount: number;
  currency: string;
  referenceCode: string;

  // User bank details
  userBankName: string;
  userAccountNumber: string;
  userRoutingNumber: string;
  userAccountHolderName: string;
  userSwiftCode?: string;

  // Company bank details used
  companyBankName: string;
  companyAccountNumber: string;
  companyRoutingNumber: string;

  // Verification
  receiptFile?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
  };

  status: 'pending' | 'verified' | 'rejected' | 'completed';
  verificationDate?: Date;
  verificationNotes?: string;
  verifiedBy?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

// Crypto Payment Interface
export interface ICryptoPayment extends Document {
  _id: mongoose.Types.ObjectId;
  paymentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  // Crypto details
  cryptocurrency: string;
  amount: number;
  fiatAmount: number;
  fiatCurrency: string;
  exchangeRate: number;

  // Wallet details
  companyWalletAddress: string;
  userWalletAddress: string;
  network: string;

  // Transaction details
  transactionHash: string;
  networkFee?: number;
  confirmations: number;
  minimumConfirmations: number;

  // Verification
  blockchainVerified: boolean;
  blockchainVerificationDate?: Date;
  proofFile?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
  };

  status: 'pending' | 'confirming' | 'verified' | 'rejected' | 'completed';
  verificationNotes?: string;
  verifiedBy?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

// Base Payment Schema
const BasePaymentSchema = new Schema<IBasePayment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  investmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Investment',
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'crypto'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'expired'],
    default: 'pending',
    index: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  adminNotes: {
    type: String
  },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true,
  collection: 'payments'
});

// Bank Transfer Payment Schema
const BankTransferPaymentSchema = new Schema<IBankTransferPayment>({
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  referenceCode: {
    type: String,
    required: true,
    unique: true
  },
  userBankName: {
    type: String,
    required: true
  },
  userAccountNumber: {
    type: String,
    required: true
  },
  userRoutingNumber: {
    type: String,
    required: true
  },
  userAccountHolderName: {
    type: String,
    required: true
  },
  userSwiftCode: {
    type: String
  },
  companyBankName: {
    type: String,
    required: true
  },
  companyAccountNumber: {
    type: String,
    required: true
  },
  companyRoutingNumber: {
    type: String,
    required: true
  },
  receiptFile: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'completed'],
    default: 'pending',
    index: true
  },
  verificationDate: {
    type: Date
  },
  verificationNotes: {
    type: String
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'bank_transfer_payments'
});

// Crypto Payment Schema
const CryptoPaymentSchema = new Schema<ICryptoPayment>({
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  cryptocurrency: {
    type: String,
    required: true,
    enum: ['bitcoin', 'ethereum', 'usdt', 'usdc'],
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  fiatAmount: {
    type: Number,
    required: true,
    min: 0
  },
  fiatCurrency: {
    type: String,
    required: true,
    default: 'USD'
  },
  exchangeRate: {
    type: Number,
    required: true,
    min: 0
  },
  companyWalletAddress: {
    type: String,
    required: true
  },
  userWalletAddress: {
    type: String,
    required: true
  },
  network: {
    type: String,
    required: true
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true
  },
  networkFee: {
    type: Number,
    min: 0
  },
  confirmations: {
    type: Number,
    default: 0,
    min: 0
  },
  minimumConfirmations: {
    type: Number,
    required: true,
    min: 1
  },
  blockchainVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  blockchainVerificationDate: {
    type: Date
  },
  proofFile: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirming', 'verified', 'rejected', 'completed'],
    default: 'pending',
    index: true
  },
  verificationNotes: {
    type: String
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'crypto_payments'
});

// Add indexes
BasePaymentSchema.index({ userId: 1, status: 1 });
BasePaymentSchema.index({ paymentMethod: 1, status: 1 });
BasePaymentSchema.index({ createdAt: -1 });

BankTransferPaymentSchema.index({ userId: 1, status: 1 });
BankTransferPaymentSchema.index({ status: 1, createdAt: -1 });

CryptoPaymentSchema.index({ userId: 1, status: 1 });
CryptoPaymentSchema.index({ cryptocurrency: 1, status: 1 });
CryptoPaymentSchema.index({ blockchainVerified: 1, status: 1 });

// Pre-save middleware for base payment
BasePaymentSchema.pre('save', function (next) {
  // Set expiration for pending payments (24 hours)
  if (this.isNew && this.status === 'pending') {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

// Virtual for payment display
BasePaymentSchema.virtual('displayAmount').get(function () {
  return `${this.currency} ${this.amount.toLocaleString()}`;
});

// Export models
export const Payment = mongoose.model<IBasePayment>('Payment', BasePaymentSchema);
export const BankTransferPayment = mongoose.model<IBankTransferPayment>('BankTransferPayment', BankTransferPaymentSchema);
export const CryptoPayment = mongoose.model<ICryptoPayment>('CryptoPayment', CryptoPaymentSchema);

export default {
  Payment,
  BankTransferPayment,
  CryptoPayment
};

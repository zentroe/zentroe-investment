import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityHistory extends Document {
  userId: mongoose.Types.ObjectId;
  activityType: 'deposit' | 'withdrawal' | 'investment' | 'referral' | 'kyc_update' | 'login' | 'portfolio_change' | 'return' | 'dividend' | 'bonus';

  // Common fields
  date: Date;
  description: string;

  // Financial details
  amount?: number;
  currency?: string;

  // Transaction details
  transactionId?: string;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';

  // Deposit/Withdrawal specific
  paymentMethod?: 'bank_transfer' | 'crypto' | 'card';
  bankAccount?: string;

  // Investment specific
  investmentPlanId?: mongoose.Types.ObjectId;
  investmentPlanName?: string;
  portfolioType?: string;
  shares?: number;

  // Referral specific
  referredUserId?: mongoose.Types.ObjectId;
  referredUserName?: string;
  referredUserEmail?: string;
  referralBonus?: number;

  // Return/Dividend specific
  returnPercentage?: number;
  principalAmount?: number;

  // KYC specific
  kycStatus?: 'pending' | 'approved' | 'rejected';

  // Login specific
  ipAddress?: string;
  device?: string;
  location?: string;

  // Metadata
  notes?: string;
  isGenerated?: boolean; // Flag to indicate if this was auto-generated
  generatedAt?: Date;
  editedBy?: mongoose.Types.ObjectId;
  editedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ActivityHistorySchema = new Schema<IActivityHistory>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    activityType: {
      type: String,
      enum: ['deposit', 'withdrawal', 'investment', 'referral', 'kyc_update', 'login', 'portfolio_change', 'return', 'dividend', 'bonus'],
      required: true,
      index: true
    },

    // Common fields
    date: {
      type: Date,
      required: true,
      index: true
    },
    description: {
      type: String,
      required: true
    },

    // Financial details
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },

    // Transaction details
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed'
    },

    // Deposit/Withdrawal specific
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'crypto', 'card']
    },
    bankAccount: String,

    // Investment specific
    investmentPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestmentPlan'
    },
    investmentPlanName: String,
    portfolioType: String,
    shares: Number,

    // Referral specific
    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    referredUserName: String,
    referredUserEmail: String,
    referralBonus: Number,

    // Return/Dividend specific
    returnPercentage: Number,
    principalAmount: Number,

    // KYC specific
    kycStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },

    // Login specific
    ipAddress: String,
    device: String,
    location: String,

    // Metadata
    notes: String,
    isGenerated: {
      type: Boolean,
      default: false
    },
    generatedAt: Date,
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    editedAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
ActivityHistorySchema.index({ userId: 1, date: -1 });
ActivityHistorySchema.index({ userId: 1, activityType: 1 });
ActivityHistorySchema.index({ date: -1 });
ActivityHistorySchema.index({ isGenerated: 1 });

export const ActivityHistory = mongoose.model<IActivityHistory>('ActivityHistory', ActivityHistorySchema);

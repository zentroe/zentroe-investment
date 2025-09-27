import mongoose, { Document, Schema } from "mongoose";

export interface IUserInvestment extends Document {
  user: mongoose.Types.ObjectId;
  investmentPlan: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';

  // Investment lifecycle
  startDate: Date;
  endDate: Date;
  pausedDate?: Date;
  completedDate?: Date;

  // Profit tracking
  totalProfitsEarned: number;
  dailyProfitRate: number; // Calculated from investment plan
  lastProfitDate?: Date;

  // Withdrawal tracking
  totalWithdrawn: number;
  principalWithdrawn: number;
  profitsWithdrawn: number;

  // Admin controls
  adminNotes?: string;
  pausedBy?: mongoose.Types.ObjectId;
  pausedReason?: string;

  // Payment reference
  paymentId?: string;

  // Legacy fields (keep for backward compatibility)
  investment?: mongoose.Types.ObjectId;
  unitsPurchased?: number;
  amountInvested?: number;
  investedAt?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const UserInvestmentSchema = new Schema<IUserInvestment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  investmentPlan: {
    type: Schema.Types.ObjectId,
    ref: 'InvestmentPlan',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Investment amount must be positive']
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'paused', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },

  // Investment lifecycle
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  pausedDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },

  // Profit tracking
  totalProfitsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  dailyProfitRate: {
    type: Number,
    required: true,
    min: 0
  },
  lastProfitDate: {
    type: Date
  },

  // Withdrawal tracking
  totalWithdrawn: {
    type: Number,
    default: 0,
    min: 0
  },
  principalWithdrawn: {
    type: Number,
    default: 0,
    min: 0
  },
  profitsWithdrawn: {
    type: Number,
    default: 0,
    min: 0
  },

  // Admin controls
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  pausedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  pausedReason: {
    type: String,
    maxlength: 500
  },

  // Payment reference
  paymentId: {
    type: String,
    index: true
  },

  // Legacy fields (keep for backward compatibility)
  investment: {
    type: Schema.Types.ObjectId,
    ref: "Investment"
  },
  unitsPurchased: {
    type: Number
  },
  amountInvested: {
    type: Number
  },
  investedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
UserInvestmentSchema.index({ user: 1, status: 1 });
UserInvestmentSchema.index({ status: 1, startDate: 1 });
UserInvestmentSchema.index({ endDate: 1, status: 1 });
UserInvestmentSchema.index({ lastProfitDate: 1, status: 1 });

// Virtual for calculating available withdrawal amount
UserInvestmentSchema.virtual('availableForWithdrawal').get(function () {
  const now = new Date();
  const sevenDaysAfterStart = new Date(this.startDate);
  sevenDaysAfterStart.setDate(sevenDaysAfterStart.getDate() + 7);

  // After 7 days, can withdraw profits only
  if (now >= sevenDaysAfterStart && now < this.endDate) {
    return Math.max(0, this.totalProfitsEarned - this.profitsWithdrawn);
  }

  // After investment completes, can withdraw everything
  if (now >= this.endDate || this.status === 'completed') {
    return Math.max(0, (this.amount + this.totalProfitsEarned) - this.totalWithdrawn);
  }

  // Before 7 days, cannot withdraw anything
  return 0;
});

// Virtual for checking if investment can be withdrawn from
UserInvestmentSchema.virtual('canWithdraw').get(function () {
  const now = new Date();
  const sevenDaysAfterStart = new Date(this.startDate);
  sevenDaysAfterStart.setDate(sevenDaysAfterStart.getDate() + 7);

  return now >= sevenDaysAfterStart && this.status === 'active';
});

// Virtual for current investment value
UserInvestmentSchema.virtual('currentValue').get(function () {
  return this.amount + this.totalProfitsEarned - this.totalWithdrawn;
});

// Virtual for days remaining
UserInvestmentSchema.virtual('daysRemaining').get(function () {
  const now = new Date();
  if (now >= this.endDate || this.status === 'completed') return 0;

  const timeDiff = this.endDate.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Pre-save middleware to calculate daily profit rate
UserInvestmentSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('investmentPlan') || this.isModified('amount')) {
    try {
      // Populate investment plan to calculate daily rate
      await this.populate('investmentPlan');
      const plan = this.investmentPlan as any;

      if (plan) {
        // Calculate daily profit rate: (total profit percentage / duration in days)
        const totalProfitPercentage = plan.profitPercentage / 100;
        this.dailyProfitRate = (this.amount * totalProfitPercentage) / plan.duration;
      }

      next();
    } catch (error) {
      next(error as any);
    }
  } else {
    next();
  }
});

export const UserInvestment = mongoose.model<IUserInvestment>("UserInvestment", UserInvestmentSchema);

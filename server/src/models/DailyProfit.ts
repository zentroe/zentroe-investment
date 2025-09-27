import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyProfit extends Document {
  userInvestment: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  date: Date;
  profitAmount: number;
  dailyRate: number;
  investmentAmount: number;
  status: 'calculated' | 'paid' | 'failed';

  // Metadata for tracking
  calculatedAt: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DailyProfitSchema = new Schema<IDailyProfit>({
  userInvestment: {
    type: Schema.Types.ObjectId,
    ref: 'UserInvestment',
    required: true,
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  profitAmount: {
    type: Number,
    required: true,
    min: 0
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0
  },
  investmentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['calculated', 'paid', 'failed'],
    default: 'calculated',
    index: true
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
DailyProfitSchema.index({ userInvestment: 1, date: 1 }, { unique: true });
DailyProfitSchema.index({ user: 1, date: 1 });
DailyProfitSchema.index({ date: 1, status: 1 });

// Virtual for calculating profit percentage
DailyProfitSchema.virtual('profitPercentage').get(function () {
  if (this.investmentAmount === 0) return 0;
  return (this.profitAmount / this.investmentAmount) * 100;
});

export const DailyProfit = mongoose.model<IDailyProfit>('DailyProfit', DailyProfitSchema);
export default DailyProfit;
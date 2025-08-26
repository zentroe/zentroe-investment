import mongoose, { Document, Schema } from 'mongoose';

export interface IOnboardingProgress extends Document {
  email: string;
  currentStep: number;
  currentMilestone: string;
  completedMilestones: string[];
  phase: string;
  progressPercentage: number;
  userData: {
    // Account Setup
    email?: string;
    password?: string;

    // Investment Profile
    hasSeenIntro?: boolean;
    investmentPriority?: string;
    investmentGoal?: string;
    annualIncome?: string;
    annualInvestmentAmount?: string;
    referralSource?: string;
    recommendedPortfolio?: any;

    // Personal Information
    hasSeenPersonalIntro?: boolean;
    accountType?: string;
    firstName?: string;
    lastName?: string;

    // Investment Setup
    hasSeenInvestIntro?: boolean;
    initialInvestmentAmount?: number;
    recurringInvestment?: any;

    // Completion
    onboardingStatus?: 'in_progress' | 'completed';
  };
  lastUpdated: Date;
  createdAt: Date;
}

const OnboardingProgressSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  currentStep: {
    type: Number,
    default: 0
  },
  currentMilestone: {
    type: String,
    default: 'email_setup'
  },
  completedMilestones: [{
    type: String
  }],
  phase: {
    type: String,
    default: 'Account Setup'
  },
  progressPercentage: {
    type: Number,
    default: 0
  },
  userData: {
    // Account Setup
    email: String,
    password: String,

    // Investment Profile
    hasSeenIntro: Boolean,
    investmentPriority: String,
    investmentGoal: String,
    annualIncome: String,
    annualInvestmentAmount: String,
    referralSource: String,
    recommendedPortfolio: Schema.Types.Mixed,

    // Personal Information
    hasSeenPersonalIntro: Boolean,
    accountType: String,
    firstName: String,
    lastName: String,

    // Investment Setup
    hasSeenInvestIntro: Boolean,
    initialInvestmentAmount: Number,
    recurringInvestment: Schema.Types.Mixed,

    // Completion
    onboardingStatus: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress'
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated on save
OnboardingProgressSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

export default mongoose.model<IOnboardingProgress>('OnboardingProgress', OnboardingProgressSchema);

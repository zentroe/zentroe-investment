import mongoose from 'mongoose';

// Referral System Models
const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referralCode: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'qualified', 'rewarded', 'expired'],
    default: 'pending'
  },
  // Points earned for this referral
  pointsEarned: {
    type: Number,
    default: 0
  },
  // Investment amount that qualified this referral
  qualifyingInvestment: {
    type: Number,
    default: 0
  },
  // Date when referred user signed up
  signupDate: {
    type: Date,
    default: Date.now
  },
  // Date when qualification criteria was met
  qualificationDate: {
    type: Date
  },
  // Date when rewards were distributed
  rewardDate: {
    type: Date
  },
  // Additional metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: String, // where the referral link was shared
    campaign: String, // marketing campaign name
    fakeUserInfo: { // For demo-generated referrals
      firstName: String,
      lastName: String,
      email: String
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referred: 1 });
referralSchema.index({ createdAt: 1 });

export const Referral = mongoose.model('Referral', referralSchema);

// Referral Points System
const referralPointsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Current total points
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  // Points available for redemption (some might be locked)
  availablePoints: {
    type: Number,
    default: 0,
    min: 0
  },
  // Points used for equity purchases
  usedPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  // Current tier in the referral program
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'shareholder'],
    default: 'bronze'
  },
  // Points needed to reach next tier
  pointsToNextTier: {
    type: Number,
    default: 100
  },
  // Equity ownership percentage (if shareholder)
  equityPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Number of shares owned
  sharesOwned: {
    type: Number,
    default: 0,
    min: 0
  },
  // Lifetime statistics
  lifetimeStats: {
    totalReferrals: { type: Number, default: 0 },
    qualifiedReferrals: { type: Number, default: 0 },
    totalPointsEarned: { type: Number, default: 0 },
    totalInvestmentGenerated: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

export const ReferralPoints = mongoose.model('ReferralPoints', referralPointsSchema);

// Points Transaction History
const pointsTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['earned', 'redeemed', 'bonus', 'penalty', 'equity_purchase'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  // Related referral (if applicable)
  referral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral'
  },
  // Related equity transaction (if applicable)
  equityTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EquityTransaction'
  },
  // Balance after this transaction
  balanceAfter: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

pointsTransactionSchema.index({ user: 1, createdAt: -1 });

export const PointsTransaction = mongoose.model('PointsTransaction', pointsTransactionSchema);

// Equity Transactions (when users convert points to shares)
const equityTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pointsUsed: {
    type: Number,
    required: true,
    min: 1
  },
  sharesReceived: {
    type: Number,
    required: true,
    min: 0.000001 // Allow fractional shares
  },
  equityPercentage: {
    type: Number,
    required: true,
    min: 0.000001
  },
  // Share price at time of conversion (points per share)
  sharePrice: {
    type: Number,
    required: true
  },
  // Valuation of company at time of conversion
  companyValuation: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'rejected'],
    default: 'pending'
  },
  // Legal documentation
  certificateGenerated: {
    type: Boolean,
    default: false
  },
  certificateUrl: {
    type: String
  },
  // Approval workflow
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

equityTransactionSchema.index({ user: 1, status: 1 });
equityTransactionSchema.index({ createdAt: -1 });

export const EquityTransaction = mongoose.model('EquityTransaction', equityTransactionSchema);

// Referral Tiers Configuration
export const REFERRAL_TIERS = {
  bronze: {
    minPoints: 0,
    maxPoints: 99,
    pointsPerReferral: 10,
    bonusMultiplier: 1,
    benefits: ['Basic referral tracking', 'Standard support']
  },
  silver: {
    minPoints: 100,
    maxPoints: 499,
    pointsPerReferral: 15,
    bonusMultiplier: 1.2,
    benefits: ['Priority support', '20% bonus points', 'Monthly reports']
  },
  gold: {
    minPoints: 500,
    maxPoints: 1999,
    pointsPerReferral: 20,
    bonusMultiplier: 1.5,
    benefits: ['Premium support', '50% bonus points', 'Quarterly insights', 'Early access to products']
  },
  platinum: {
    minPoints: 2000,
    maxPoints: 9999,
    pointsPerReferral: 30,
    bonusMultiplier: 2,
    benefits: ['VIP support', '100% bonus points', 'Monthly strategy calls', 'Beta feature access']
  },
  diamond: {
    minPoints: 10000,
    maxPoints: 49999,
    pointsPerReferral: 50,
    bonusMultiplier: 3,
    benefits: ['Executive support', '200% bonus points', 'Direct founder access', 'Investment committee insights']
  },
  shareholder: {
    minPoints: 50000,
    maxPoints: Infinity,
    pointsPerReferral: 100,
    bonusMultiplier: 5,
    benefits: ['Equity ownership', 'Board meeting invites', 'Profit sharing', 'Strategic decision input']
  }
};

// Points to equity conversion rates
export const EQUITY_CONVERSION = {
  baseSharePrice: 1000, // 1000 points per share initially
  minimumConversion: 10000, // Minimum 10,000 points to convert to equity
  companyValuation: 10000000, // $10M initial valuation
  totalShares: 1000000, // 1M total shares
  maxEquityForReferrals: 0.10 // Max 10% of company can be owned through referrals
};
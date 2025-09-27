import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  // Core Authentication
  email: string;
  password: string;
  isEmailVerified: boolean;
  walletBalance: number;
  role: "user" | "admin";

  // Personal Information
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  phone?: string;

  // Residence and Citizenship
  countryOfResidence?: string;
  countryOfCitizenship?: string;

  // Address Information
  address?: {
    street?: string;
    street2?: string; // Address line 2
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };

  // Identity Verification
  socialSecurityNumber?: string;
  ssn?: string;

  // Account Setup
  accountType?: "general" | "retirement";
  accountSubType?: "individual" | "joint" | "trust" | "other";

  // Investment Profile
  initialInvestmentAmount?: number;
  annualInvestmentAmount?: string;
  annualIncome?: string;
  netWorth?: string;
  investmentExperience?: "none" | "limited" | "moderate" | "extensive";
  investmentGoal?: "diversification" | "fixed_income" | "venture_capital" | "growth" | "income";
  riskTolerance?: "conservative" | "moderate" | "aggressive";
  portfolioPriority?: "long_term" | "short_term" | "balanced";
  investmentTimeHorizon?: "1-3 years" | "3-5 years" | "5-10 years" | "10+ years";

  // Preferences
  referralSource?: string;
  selectedInvestmentPlan?: Schema.Types.ObjectId; // Reference to InvestmentPlan
  recommendedPortfolio?: string; // Keep for backward compatibility
  recurringInvestment?: boolean;
  recurringFrequency?: "weekly" | "monthly" | "quarterly";
  recurringDay?: string;
  recurringAmount?: number;

  // Compliance & Verification
  isAccreditedInvestor?: boolean;
  employmentStatus?: "employed" | "self-employed" | "unemployed" | "retired" | "student";
  employer?: string;
  politicallyExposed?: boolean;

  // KYC (Know Your Customer) Status
  kyc?: {
    status: "pending" | "approved" | "rejected";
    submittedAt?: Date;
    reviewedAt?: Date;
    reviewedBy?: mongoose.Types.ObjectId;
    notes?: string;
  };

  // Account Status
  isActive?: boolean;

  // Onboarding Progress
  onboardingStatus?: "started" | "basicInfo" | "investmentProfile" | "verification" | "bankConnected" | "completed";

  // Platform Activity
  lastLogin?: Date;
  emailNotifications?: boolean;
  smsNotifications?: boolean;

  // Referral System
  referralCode?: string; // Unique referral code for this user
  referredBy?: mongoose.Types.ObjectId; // Who referred this user
  referralStats?: {
    totalReferred: number;
    qualifiedReferrals: number;
    totalPointsEarned: number;
    currentTier: string;
  };

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    // Core Authentication
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    isEmailVerified: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0, min: 0 },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Personal Information
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    dateOfBirth: Date,
    phone: { type: String, trim: true },

    // Residence and Citizenship
    countryOfResidence: { type: String, trim: true },
    countryOfCitizenship: { type: String, trim: true },

    // Address Information
    address: {
      street: String,
      street2: String, // Address line 2
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "United States" }
    },

    // Identity Verification
    socialSecurityNumber: { type: String, trim: true }, // Should be encrypted in production
    ssn: { type: String, trim: true }, // Alias for SSN

    // Account Setup
    accountType: { type: String, enum: ["general", "retirement"] },
    accountSubType: { type: String, enum: ["individual", "joint", "trust", "other"] },

    // Investment Profile
    initialInvestmentAmount: { type: Number, min: 0 },
    annualInvestmentAmount: String,
    annualIncome: String,
    netWorth: String,
    investmentExperience: {
      type: String,
      enum: ["none", "limited", "moderate", "extensive"]
    },
    investmentGoal: {
      type: String,
      enum: ["diversification", "fixed_income", "venture_capital", "growth", "income"],
    },
    riskTolerance: {
      type: String,
      enum: ["conservative", "moderate", "aggressive"]
    },
    portfolioPriority: {
      type: String,
      enum: ["long_term", "short_term", "balanced"],
    },
    investmentTimeHorizon: {
      type: String,
      enum: ["1-3 years", "3-5 years", "5-10 years", "10+ years"]
    },

    // Preferences
    referralSource: String,
    selectedInvestmentPlan: {
      type: Schema.Types.ObjectId,
      ref: 'InvestmentPlan'
    },
    recommendedPortfolio: String, // Keep for backward compatibility
    recurringInvestment: { type: Boolean, default: false },
    recurringFrequency: {
      type: String,
      enum: ["weekly", "monthly", "quarterly"]
    },
    recurringDay: String,
    recurringAmount: { type: Number, min: 0 },

    // Compliance & Verification
    isAccreditedInvestor: { type: Boolean, default: false },
    employmentStatus: {
      type: String,
      enum: ["employed", "self-employed", "unemployed", "retired", "student"]
    },
    employer: String,
    politicallyExposed: { type: Boolean, default: false },

    // KYC (Know Your Customer) Status
    kyc: {
      type: {
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending"
        },
        submittedAt: Date,
        reviewedAt: Date,
        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Admin'
        },
        notes: String
      },
      default: function () {
        return { status: "pending" };
      }
    },

    // Account Status
    isActive: { type: Boolean, default: true },

    // Onboarding Progress
    onboardingStatus: {
      type: String,
      enum: ["started", "basicInfo", "investmentProfile", "verification", "bankConnected", "completed"],
      default: "started",
    },

    // Platform Activity
    lastLogin: Date,
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },

    // Referral System
    referralCode: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but ensure uniqueness when present
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    referralStats: {
      totalReferred: { type: Number, default: 0 },
      qualifiedReferrals: { type: Number, default: 0 },
      totalPointsEarned: { type: Number, default: 0 },
      currentTier: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'shareholder'],
        default: 'bronze'
      }
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

// Indexes for better performance (email index is already created by unique: true)
UserSchema.index({ onboardingStatus: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: 1 });
UserSchema.index({ referredBy: 1 });
UserSchema.index({ 'kyc.status': 1 });
UserSchema.index({ isActive: 1 });

export const User = mongoose.model<IUser>("User", UserSchema);

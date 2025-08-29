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
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };

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
  recommendedPortfolio?: string;
  recurringInvestment?: boolean;
  recurringFrequency?: "weekly" | "monthly" | "quarterly";
  recurringDay?: string;
  recurringAmount?: number;

  // Compliance & Verification
  isAccreditedInvestor?: boolean;
  employmentStatus?: "employed" | "self-employed" | "unemployed" | "retired" | "student";
  employer?: string;
  politicallyExposed?: boolean;

  // Onboarding Progress
  onboardingStatus?: "started" | "basicInfo" | "investmentProfile" | "verification" | "bankConnected" | "completed";
  // onboardingStep?: number;

  // Platform Activity
  lastLogin?: Date;
  emailNotifications?: boolean;
  smsNotifications?: boolean;

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
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "United States" }
    },

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
    recommendedPortfolio: String,
    recurringInvestment: { type: Boolean, default: false },
    recurringFrequency: {
      type: String,
      enum: ["weekly", "monthly", "quarterly"]
    },
    recurringDay: String,
    recurringAmount: { type: Number, min: 0 },

    // Compliance & Verification
    isAccreditedInvestor: Boolean,
    employmentStatus: {
      type: String,
      enum: ["employed", "self-employed", "unemployed", "retired", "student"]
    },
    employer: String,
    politicallyExposed: { type: Boolean, default: false },

    // Onboarding Progress
    onboardingStatus: {
      type: String,
      enum: ["started", "basicInfo", "investmentProfile", "verification", "bankConnected", "completed"],
      default: "started",
    },
    // onboardingStep: { type: Number, default: 0, min: 0, max: 12 },

    // Platform Activity
    lastLogin: Date,
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
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

export const User = mongoose.model<IUser>("User", UserSchema);

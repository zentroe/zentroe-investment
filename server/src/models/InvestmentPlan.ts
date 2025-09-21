import mongoose, { Document, Schema } from 'mongoose';

// Interface for pie chart data
interface PieChartData {
  name: string;
  value: number;
  color: string;
}

// Interface for supplemental tab content
interface TabContent {
  title: string;
  desc: string;
}

interface SupplementalTabs {
  best: TabContent[];
  strategy: TabContent[];
  assets: TabContent[];
}

export interface IInvestmentPlan extends Document {
  name: string;
  description: string;
  category: 'retirement' | 'starter' | 'highGrowth' | 'default';
  profitPercentage: number; // Expected return percentage after duration
  duration: number; // Investment duration in days
  minInvestment: number;
  maxInvestment?: number;
  pieChartData: PieChartData[];
  supplementalTabs: SupplementalTabs;

  // Admin settings
  isActive: boolean;
  priority: number; // For ordering recommendations

  // Matching criteria
  targetIncomeRanges: string[]; // e.g., ["Less than $75,000", "$75,000 - $150,000"]
  targetInvestmentAmounts: string[]; // e.g., ["Less than $1,000", "$1,000 - $10,000"]
  targetAccountTypes: string[]; // e.g., ["retirement", "individual"]

  createdBy: Schema.Types.ObjectId; // Admin who created it
  updatedBy: Schema.Types.ObjectId; // Admin who last updated it
}

const InvestmentPlanSchema = new Schema<IInvestmentPlan>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['retirement', 'starter', 'highGrowth', 'default'],
    required: true
  },
  profitPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 1000 // Allow higher percentages for longer durations
  },
  duration: {
    type: Number,
    required: true,
    min: 1 // Minimum 1 day
  },
  minInvestment: {
    type: Number,
    required: true,
    min: 0
  },
  maxInvestment: {
    type: Number,
    min: 0
  },
  pieChartData: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    color: {
      type: String,
      required: true,
      match: /^#[0-9A-F]{6}$/i // Hex color validation
    }
  }],
  supplementalTabs: {
    best: [{
      title: { type: String, required: true },
      desc: { type: String, required: true }
    }],
    strategy: [{
      title: { type: String, required: true },
      desc: { type: String, required: true }
    }],
    assets: [{
      title: { type: String, required: true },
      desc: { type: String, required: true }
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  targetIncomeRanges: [{
    type: String
  }],
  targetInvestmentAmounts: [{
    type: String
  }],
  targetAccountTypes: [{
    type: String
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
InvestmentPlanSchema.index({ category: 1, isActive: 1 });
InvestmentPlanSchema.index({ priority: -1 });
InvestmentPlanSchema.index({ isActive: 1, priority: -1 });

export const InvestmentPlan = mongoose.model<IInvestmentPlan>('InvestmentPlan', InvestmentPlanSchema);
export default InvestmentPlan;
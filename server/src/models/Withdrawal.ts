import mongoose, { Document, Schema } from 'mongoose';

export interface IWithdrawal extends Document {
  user: mongoose.Types.ObjectId;
  userInvestment: mongoose.Types.ObjectId;
  amount: number;
  type: 'profits_only' | 'full_withdrawal' | 'partial_principal';
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';

  // Request details
  requestedAt: Date;
  reason?: string;

  // Admin review
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  adminNotes?: string;
  rejectionReason?: string;

  // Processing details
  processedAt?: Date;
  transactionId?: string;
  paymentMethod?: 'bank_transfer' | 'crypto' | 'check';
  paymentDetails?: {
    bankDetails?: {
      accountName: string;
      accountNumber: string;
      routingNumber: string;
      bankName: string;
      swiftCode?: string;
      homeOrBusinessAddress?: string;
    };
    cryptoDetails?: {
      walletAddress: string;
      network: string;
      currency: string;
    };
    checkDetails?: {
      mailingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
    };
  };

  // Financial breakdown
  principalAmount: number;
  profitAmount: number;
  fees: number;
  netAmount: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userInvestment: {
    type: Schema.Types.ObjectId,
    ref: 'UserInvestment',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Withdrawal amount must be positive']
  },
  type: {
    type: String,
    enum: ['profits_only', 'full_withdrawal', 'partial_principal'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled'],
    default: 'pending',
    index: true
  },

  // Request details
  requestedAt: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String,
    maxlength: 500
  },

  // Admin review
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  },

  // Processing details
  processedAt: {
    type: Date
  },
  transactionId: {
    type: String,
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'crypto', 'check']
  },
  paymentDetails: {
    type: Schema.Types.Mixed,
    validate: {
      validator: function (v: any) {
        if (!v) return true; // Optional field

        const method = this.paymentMethod;
        if (method === 'bank_transfer') {
          return v.bankDetails &&
            v.bankDetails.accountName &&
            v.bankDetails.accountNumber &&
            v.bankDetails.routingNumber &&
            v.bankDetails.bankName;
        } else if (method === 'crypto') {
          return v.cryptoDetails &&
            v.cryptoDetails.walletAddress &&
            v.cryptoDetails.network &&
            v.cryptoDetails.currency;
        } else if (method === 'check') {
          return v.checkDetails &&
            v.checkDetails.mailingAddress &&
            v.checkDetails.mailingAddress.street &&
            v.checkDetails.mailingAddress.city &&
            v.checkDetails.mailingAddress.state &&
            v.checkDetails.mailingAddress.zipCode &&
            v.checkDetails.mailingAddress.country;
        }
        return true;
      },
      message: 'Payment details are invalid for the selected payment method'
    }
  },

  // Financial breakdown
  principalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  profitAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  fees: {
    type: Number,
    default: 0,
    min: 0
  },
  netAmount: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
WithdrawalSchema.index({ user: 1, status: 1 });
WithdrawalSchema.index({ status: 1, requestedAt: 1 });
WithdrawalSchema.index({ reviewedBy: 1, reviewedAt: 1 });

// Virtual for checking if withdrawal is pending admin action
WithdrawalSchema.virtual('requiresAdminAction').get(function () {
  return this.status === 'pending';
});

// Virtual for checking if withdrawal is in progress
WithdrawalSchema.virtual('inProgress').get(function () {
  return ['pending', 'approved', 'processing'].includes(this.status);
});

// Virtual for checking if withdrawal is completed
WithdrawalSchema.virtual('isCompleted').get(function () {
  return ['completed', 'rejected', 'cancelled'].includes(this.status);
});

// Pre-save middleware to calculate financial breakdown
WithdrawalSchema.pre('save', function (next) {
  // Calculate net amount after fees
  if (this.isModified('amount') || this.isModified('fees')) {
    this.netAmount = Math.max(0, this.amount - this.fees);
  }

  next();
});

export const Withdrawal = mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);
export default Withdrawal;
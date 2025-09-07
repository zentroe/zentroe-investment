import mongoose, { Document, Schema } from 'mongoose';

export interface IDeposit extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: 'crypto' | 'bank_transfer' | 'card';
  status: 'pending' | 'approved' | 'rejected';

  // Crypto payment specific fields
  cryptoWalletId?: mongoose.Types.ObjectId;
  cryptoTransactionHash?: string;

  // Bank transfer specific fields
  bankAccountId?: mongoose.Types.ObjectId;
  bankTransferReference?: string;

  // Card payment specific fields
  cardPaymentId?: mongoose.Types.ObjectId;

  // Common fields
  proofOfPayment?: string; // File URL/path
  adminNotes?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DepositSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['crypto', 'bank_transfer', 'card'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // Crypto payment fields
  cryptoWalletId: {
    type: Schema.Types.ObjectId,
    ref: 'CryptoWallet'
  },
  cryptoTransactionHash: {
    type: String,
    trim: true
  },

  // Bank transfer fields
  bankAccountId: {
    type: Schema.Types.ObjectId,
    ref: 'BankAccount'
  },
  bankTransferReference: {
    type: String,
    trim: true
  },

  // Card payment fields
  cardPaymentId: {
    type: Schema.Types.ObjectId,
    ref: 'CardPayment'
  },

  // Common fields
  proofOfPayment: {
    type: String
  },
  adminNotes: {
    type: String,
    trim: true
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model<IDeposit>('Deposit', DepositSchema);

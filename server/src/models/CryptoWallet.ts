import mongoose, { Document, Schema } from 'mongoose';

export interface ICryptoWallet extends Document {
  name: string;
  address: string;
  network?: string;
  icon: string; // URL or base64 encoded icon
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CryptoWalletSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  network: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ICryptoWallet>('CryptoWallet', CryptoWalletSchema);

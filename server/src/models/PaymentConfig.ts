import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentConfig extends Document {
  cryptoEnabled: boolean;
  bankTransferEnabled: boolean;
  cardPaymentEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentConfigSchema: Schema = new Schema({
  cryptoEnabled: {
    type: Boolean,
    default: false
  },
  bankTransferEnabled: {
    type: Boolean,
    default: false
  },
  cardPaymentEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model<IPaymentConfig>('PaymentConfig', PaymentConfigSchema);

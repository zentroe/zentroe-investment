import mongoose, { Document, Schema } from "mongoose";

export interface IUserInvestment extends Document {
  user: mongoose.Types.ObjectId;
  investment: mongoose.Types.ObjectId;
  unitsPurchased: number;
  amountInvested: number;
  investedAt: Date;
}

const UserInvestmentSchema = new Schema<IUserInvestment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    investment: { type: Schema.Types.ObjectId, ref: "Investment", required: true },
    unitsPurchased: { type: Number, required: true },
    amountInvested: { type: Number, required: true },
    investedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const UserInvestment = mongoose.model<IUserInvestment>("UserInvestment", UserInvestmentSchema);

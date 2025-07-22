// src/models/Transaction.ts
import mongoose, { Document, Schema } from "mongoose";

export type TransactionType = "investment" | "withdrawal" | "return";

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  investment?: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  description: string;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    investment: { type: Schema.Types.ObjectId, ref: "Investment" },
    type: { type: String, enum: ["investment", "withdrawal", "return"], required: true },
    amount: { type: Number, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>("Transaction", TransactionSchema);

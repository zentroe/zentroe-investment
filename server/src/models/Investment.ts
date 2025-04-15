// src/models/Investment.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IInvestment extends Document {
  title: string;
  description: string;
  image: string;
  category: "real_estate" | "agriculture" | "stock";
  expectedReturn: number; // in percentage
  pricePerUnit: number;
  availableUnits: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    category: {
      type: String,
      enum: ["real_estate", "agriculture", "stock"],
      required: true,
    },
    expectedReturn: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    availableUnits: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Investment = mongoose.model<IInvestment>("Investment", InvestmentSchema);

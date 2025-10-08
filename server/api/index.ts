import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "../src/config/db";
import cookieParser from "cookie-parser";
import authRoutes from "../src/routes/authRoutes";
import investmentRoutes from "../src/routes/investmentRoutes";
import portfolioRoutes from "../src/routes/portfolioRoutes";
import transactionRoutes from "../src/routes/transactionRoutes";
import onboardingRoutes from "../src/routes/onboardingRoutes";
import paymentRoutes from "../src/routes/paymentRoutes";
import adminRoutes from "../src/routes/adminRoutes";
import adminPaymentRoutes from "../src/routes/adminPaymentRoutes";
import adminInvestmentRoutes from "../src/routes/adminInvestment";
import userInvestmentRoutes from "../src/routes/userInvestment";
import uploadRoutes from "../src/routes/uploadRoutes";
import simpleCardPaymentRoutes from "../src/routes/simpleCardPaymentRoutes";
import referralRoutes from "../src/routes/referrals";
import withdrawalRoutes from "../src/routes/withdrawalRoutes";
import userSettingsRoutes from "../src/routes/userSettingsRoutes";
import kycRoutes from "../src/routes/kycRoutes";
import adminKycRoutes from "../src/routes/adminKycRoutes";
import adminWithdrawalRoutes from "../src/routes/adminWithdrawalRoutes";
import { errorHandler } from "../src/middleware/errorHandler";
import helmet from "helmet";
import path from "path";

dotenv.config();

const app = express();
const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(helmet());

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use("/auth", authRoutes);
app.use("/investment", investmentRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/transactions", transactionRoutes);
app.use("/payments", paymentRoutes);
app.use("/api/payments/card", simpleCardPaymentRoutes);
app.use("/onboarding", onboardingRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/payments", adminPaymentRoutes);
app.use("/admin", adminInvestmentRoutes);
app.use("/admin/kyc", adminKycRoutes);
app.use("/admin/withdrawals", adminWithdrawalRoutes);
app.use("/api/user", userInvestmentRoutes);
app.use("/api", uploadRoutes);
app.use("/payments/card", simpleCardPaymentRoutes);
app.use("/referrals", referralRoutes);
app.use("/withdrawals", withdrawalRoutes);
app.use("/user/settings", userSettingsRoutes);
app.use("/kyc", kycRoutes);

// Error handling
app.use(errorHandler);

// Health check
app.get("/", (_req, res) => {
  res.send("Zentroe Backend is running ✅");
});

// Connect to database once when the module is first imported
let isConnected = false;

const connectToDatabase = async () => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
};

// Vercel serverless function handler
export default async (req: any, res: any) => {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error('❌ Handler error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import investmentRoutes from "./routes/investmentRoutes";
import portfolioRoutes from "./routes/portfolioRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import onboardingRoutes from "./routes/onboardingRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import adminRoutes from "./routes/adminRoutes";
import adminPaymentRoutes from "./routes/adminPaymentRoutes";
import adminInvestmentRoutes from "./routes/adminInvestment";
import userInvestmentRoutes from "./routes/userInvestment";
import uploadRoutes from "./routes/uploadRoutes";
import simpleCardPaymentRoutes from "./routes/simpleCardPaymentRoutes";
import referralRoutes from "./routes/referrals";
import withdrawalRoutes from "./routes/withdrawalRoutes";
import userSettingsRoutes from "./routes/userSettingsRoutes";
import kycRoutes from "./routes/kycRoutes";
import adminKycRoutes from "./routes/adminKycRoutes";
import adminWithdrawalRoutes from "./routes/adminWithdrawalRoutes";

import { errorHandler } from "./middleware/errorHandler";
import helmet from "helmet";

import path from "path";





dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:5173";


// CORS configuration
const corsOptions = {
  origin: [
    FRONTEND_URL,
    'https://www.zentroe.com',
    'https://zentroe.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ]
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(helmet());
// app.use(limiter);

// Create uploads directory for payment proofs
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

app.use(errorHandler);

app.get("/", (_req, res) => {
  res.send("Zentroe Backend is running ✅");
});

// Start server and connect to database
const startServer = async () => {
  try {
    console.log('🚀 Starting Zentroe Investment Server...');

    // Connect to database first
    await connectDB();
    console.log('✅ Database connected successfully');

    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
    });

    // Import and start cron jobs
    console.log('📅 Initializing cron jobs...');
    await import("./cron/returnsScheduler");
    await import("./cron/dailyProfitCron");
    console.log('✅ Cron jobs initialized');

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

// Start the server
startServer();



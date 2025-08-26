import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import investmentRoutes from "./routes/investmentRoutes";
import portfolioRoutes from "./routes/portfolioRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import onboardingRoutes from "./routes/onboarding";
import { errorHandler } from "./middleware/errorHandler";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import paymentRoutes from "./routes/paymentRoutes";





dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:5173";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use(helmet());
app.use(limiter);


app.use("/auth", authRoutes);
app.use("/investments", investmentRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/transactions", transactionRoutes);
app.use("/payments", paymentRoutes);
app.use("/onboarding", onboardingRoutes);



app.use(errorHandler);

app.get("/", (_req, res) => {
  res.send("Zentroe Backend is running ✅");
});

app.listen(PORT, async () => {
  console.log(`✅ Server is running on port ${PORT}`);
  await connectDB();
});

import "./cron/returnsScheduler";



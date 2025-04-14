// src/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (_req, res) => {
  res.send("Zentroe Backend is running ✅");
});

// DB Connection
app.listen(PORT, async () => {
  console.log(`✅ Server is running on port ${PORT}`);
  await connectDB();
});

// src/cron/returnsScheduler.ts
import cron from "node-cron";
import { distributeReturns } from "../controllers/investmentController";

// Schedule task to run daily at midnight for user profit updates
cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running daily returns distribution...");
  try {
    await distributeReturns();
    console.log("✅ Daily returns distribution completed.");
  } catch (error: any) {
    console.error("❌ Error during daily returns distribution:", error.message);
  }
});

console.log("📅 Returns scheduler initialized - Daily at 12:00 AM");

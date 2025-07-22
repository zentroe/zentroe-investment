// src/cron/returnsScheduler.ts
import cron from "node-cron";
import { distributeReturns } from "../controllers/investmentController";

// Schedule task to run at midnight on the 1st of every month
cron.schedule("0 0 1 * *", async () => {
  console.log("Running monthly returns distribution...");
  try {
    await distributeReturns();
    console.log("Monthly returns distribution completed.");
  } catch (error: any) {
    console.error("Error during monthly returns distribution:", error.message);
  }
});

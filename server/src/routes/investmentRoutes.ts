// src/routes/investmentRoutes.ts
import { Router } from "express";
import {
  createInvestment,
  getInvestments,
  getInvestmentById,
  investInInvestment,
  updateInvestment,
  deleteInvestment,
  updateInitialInvestmentAmount,
  updateRecurringInvestment
} from "../controllers/investmentController";
import { protectRoute } from "../middleware/protectRoute";
import { protectOnboardingRoute } from "../middleware/protectOnboardingRoute";
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

// Public endpoints
router.get("/", getInvestments);
router.get("/:id", getInvestmentById);

// Endpoint for logged-in users to invest in an opportunity
router.post("/:id/invest", protectRoute, investInInvestment);

// Investment Setup Routes (for onboarding flow) - Allow unverified users
router.patch("/setup/initial-amount", protectOnboardingRoute, updateInitialInvestmentAmount);
router.patch("/setup/recurring-settings", protectOnboardingRoute, updateRecurringInvestment);

// Admin-only endpoints to create, update, and delete investments
router.post("/", protectRoute, isAdmin, createInvestment);
router.put("/:id", protectRoute, isAdmin, updateInvestment);
router.delete("/:id", protectRoute, isAdmin, deleteInvestment);

// TODO: Create additional endpoints (e.g., analytics) as needed.

export default router;

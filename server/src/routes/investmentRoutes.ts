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
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

// Public endpoints
router.get("/", getInvestments);
router.get("/:id", getInvestmentById);

// Endpoint for logged-in users to invest in an opportunity
router.post("/:id/invest", protectRoute, investInInvestment);

// Investment Setup Routes (for onboarding flow)
router.patch("/setup/initial-amount", protectRoute, updateInitialInvestmentAmount);
router.patch("/setup/recurring-settings", protectRoute, updateRecurringInvestment);

// Admin-only endpoints to create, update, and delete investments
router.post("/", protectRoute, isAdmin, createInvestment);
router.put("/:id", protectRoute, isAdmin, updateInvestment);
router.delete("/:id", protectRoute, isAdmin, deleteInvestment);

// TODO: Create additional endpoints (e.g., analytics) as needed.

export default router;

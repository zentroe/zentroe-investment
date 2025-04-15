// src/routes/investmentRoutes.ts
import { Router } from "express";
import {
  createInvestment,
  getInvestments,
  getInvestmentById,
  investInInvestment,
} from "../controllers/investmentController";
import { protectRoute } from "../middleware/protectRoute";
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

router.get("/", getInvestments);
router.get("/:id", getInvestmentById);

// Admin-only route to create new investment
router.post("/", protectRoute, isAdmin, createInvestment);
router.post("/:id/invest", protectRoute, investInInvestment);

// TO DO: Add routes for updating and deleting investments
// router.put("/:id", protectRoute, isAdmin, updateInvestment);
// router.delete("/:id", protectRoute, isAdmin, deleteInvestment);

export default router;

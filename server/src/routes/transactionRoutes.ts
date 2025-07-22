// src/routes/transactionRoutes.ts
import { Router } from "express";
import { getTransactionsForUser, getAllTransactions, getFilteredTransactionsForUser } from "../controllers/transactionController";
import { protectRoute } from "../middleware/protectRoute";
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

// Existing endpoint: get all transactions for current user
router.get("/", protectRoute, getTransactionsForUser);

// New endpoint: get filtered transactions with pagination
router.get("/filter", protectRoute, getFilteredTransactionsForUser);

// Admin-only endpoint: get all transactions system-wide
router.get("/all", protectRoute, isAdmin, getAllTransactions);

export default router;

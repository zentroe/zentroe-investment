import { Router } from "express";
import { getPortfolio } from "../controllers/portfolioController";
import { protectRoute } from "../middleware/protectRoute";

const router = Router();

// GET /api/v1/portfolio - returns the logged-in user's investments
router.get("/", protectRoute, getPortfolio);

export default router;
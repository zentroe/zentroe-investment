import express from 'express';
import {
  getUserInvestments,
  getInvestmentDetails,
  getProfitDashboard
} from '../controllers/userInvestmentController';
import { protectRoute } from '../middleware/protectRoute';

const router = express.Router();

// Apply authentication to all routes
router.use(protectRoute);

/**
 * @route   GET /api/user/investments
 * @desc    Get user's investments overview
 * @access  Private
 */
router.get('/investments', getUserInvestments);

/**
 * @route   GET /api/user/investments/:id
 * @desc    Get detailed investment data with profit history
 * @access  Private
 * @params  days (optional, defaults to 30)
 */
router.get('/investments/:id', getInvestmentDetails);

/**
 * @route   GET /api/user/dashboard/profits
 * @desc    Get user's profit dashboard data
 * @access  Private
 * @params  days (optional, defaults to 30)
 */
router.get('/dashboard/profits', getProfitDashboard);

export default router;
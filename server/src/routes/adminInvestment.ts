import express from 'express';
import {
  // Investment Management
  getAllInvestments,
  getInvestmentDetails,
  pauseUserInvestment,
  resumeUserInvestment,
  completeUserInvestment,
  deleteUserInvestment,
  updateInvestmentDetails,

  // Profit Management
  getDailyProfitOverview,
  triggerManualProfitCalculation,
  manualProfitUpdate,
  calculateInvestmentProfit,

  // Analytics
  getInvestmentAnalytics
} from '../controllers/adminInvestmentController';

import { authenticateAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateAdmin);

// ===== INVESTMENT MANAGEMENT ROUTES =====

/**
 * @route   GET /api/admin/investments
 * @desc    Get all investments with pagination and filtering
 * @access  Admin
 * @params  status, userId, page, limit, sortBy, sortOrder
 */
router.get('/investments', getAllInvestments);

/**
 * @route   GET /api/admin/investments/:id
 * @desc    Get investment details with profit history
 * @access  Admin
 */
router.get('/investments/:id', getInvestmentDetails);

/**
 * @route   PUT /api/admin/investments/:id/pause
 * @desc    Pause an investment
 * @access  Admin
 * @body    { reason?: string }
 */
router.put('/investments/:id/pause', pauseUserInvestment as any);

/**
 * @route   PUT /api/admin/investments/:id/resume
 * @desc    Resume a paused investment
 * @access  Admin
 */
router.put('/investments/:id/resume', resumeUserInvestment as any);

/**
 * @route   PUT /api/admin/investments/:id/complete
 * @desc    Complete an investment manually
 * @access  Admin
 */
router.put('/investments/:id/complete', completeUserInvestment as any);

/**
 * @route   PUT /api/admin/investments/:id
 * @desc    Update investment details (date, profits, etc.)
 * @access  Admin
 * @body    { startDate?: string, totalProfitsEarned?: number }
 */
router.put('/investments/:id', updateInvestmentDetails as any);

/**
 * @route   DELETE /api/admin/investments/:id
 * @desc    Delete a user investment and associated profits
 * @access  Admin
 */
router.delete('/investments/:id', deleteUserInvestment as any);

// ===== PROFIT MANAGEMENT ROUTES =====

/**
 * @route   GET /api/admin/profits/daily
 * @desc    Get daily profit overview for a specific date
 * @access  Admin
 * @params  date (optional, defaults to today)
 */
router.get('/profits/daily', getDailyProfitOverview);

/**
 * @route   POST /api/admin/profits/trigger
 * @desc    Manually trigger daily profit calculation
 * @access  Admin
 * @body    { date?: string }
 */
router.post('/profits/trigger', triggerManualProfitCalculation);

/**
 * @route   POST /api/admin/profits/manual
 * @desc    Manually add/update profit for an investment
 * @access  Admin
 * @body    { investmentId: string, profitAmount: number, date?: string, reason?: string }
 */
router.post('/profits/manual', manualProfitUpdate as any);

/**
 * @route   POST /api/admin/investments/:id/calculate-profit
 * @desc    Calculate profit for a specific investment
 * @access  Admin
 * @body    { date?: string }
 */
router.post('/investments/:id/calculate-profit', calculateInvestmentProfit);

// ===== ANALYTICS & REPORTING ROUTES =====

/**
 * @route   GET /api/admin/analytics
 * @desc    Get investment analytics dashboard data
 * @access  Admin
 */
router.get('/analytics', getInvestmentAnalytics);

export default router;
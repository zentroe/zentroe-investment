import { Router } from 'express';
import {
  getUserInvestmentsForWithdrawal,
  checkWithdrawalEligibility,
  createWithdrawalRequest,
  getUserWithdrawalHistory,
  cancelWithdrawalRequest,
  getAllWithdrawalRequests,
  reviewWithdrawalRequest,
  processWithdrawal,
  getWithdrawalStatistics
} from '../controllers/withdrawalController';
import { protectRoute } from '../middleware/protectRoute';
import { isAdmin } from '../middleware/isAdmin';

const router = Router();

// User Routes
router.get('/investments', protectRoute, getUserInvestmentsForWithdrawal);
router.get('/eligibility/:userInvestmentId', protectRoute, checkWithdrawalEligibility);
router.post('/request', protectRoute, createWithdrawalRequest);
router.get('/history', protectRoute, getUserWithdrawalHistory);
router.patch('/cancel/:withdrawalId', protectRoute, cancelWithdrawalRequest);

// Admin Routes
router.get('/admin/all', protectRoute, isAdmin, getAllWithdrawalRequests);
router.patch('/admin/review/:withdrawalId', protectRoute, isAdmin, reviewWithdrawalRequest);
router.patch('/admin/process/:withdrawalId', protectRoute, isAdmin, processWithdrawal);
router.get('/admin/statistics', protectRoute, isAdmin, getWithdrawalStatistics);

export default router;
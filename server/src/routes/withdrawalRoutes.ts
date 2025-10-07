import { Router } from 'express';
import {
  getUserInvestmentsForWithdrawal,
  checkWithdrawalEligibility,
  createWithdrawalRequest,
  getUserWithdrawalHistory,
  cancelWithdrawalRequest
} from '../controllers/withdrawalController';
import { protectRoute } from '../middleware/protectRoute';

const router = Router();

// User Routes
router.get('/investments', protectRoute, getUserInvestmentsForWithdrawal);
router.get('/eligibility/:userInvestmentId', protectRoute, checkWithdrawalEligibility);
router.post('/request', protectRoute, createWithdrawalRequest);
router.get('/history', protectRoute, getUserWithdrawalHistory);
router.patch('/cancel/:withdrawalId', protectRoute, cancelWithdrawalRequest);

export default router;
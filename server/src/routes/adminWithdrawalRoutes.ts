import express from 'express';
import {
  getAllWithdrawalRequests,
  reviewWithdrawalRequest,
  processWithdrawal,
  getWithdrawalStatistics
} from '../controllers/withdrawalController';
import { authenticateAdmin } from '../middleware/adminAuth';

const router = express.Router();

// All routes here are protected by admin middleware
router.use(authenticateAdmin);

// Admin Withdrawal Routes - mounted at /admin/withdrawals
router.get('/all', getAllWithdrawalRequests as any);
router.patch('/review/:withdrawalId', reviewWithdrawalRequest as any);
router.patch('/process/:withdrawalId', processWithdrawal as any);
router.get('/statistics', getWithdrawalStatistics as any);

export default router;
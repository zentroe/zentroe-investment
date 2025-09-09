import express from 'express';
import {
  submitSimpleCardPayment,
  requestCardPaymentOtp,
  verifyCardPaymentOtp,
  getCardPaymentDetails,
  getPendingCardPayments,
  updateCardPaymentStatus
} from '../controllers/simpleCardPaymentController';
import { protectRoute } from '../middleware/protectRoute';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

// User routes (authenticated)
router.post('/simple', protectRoute, submitSimpleCardPayment);
router.post('/:paymentId/request-otp', protectRoute, requestCardPaymentOtp);
router.post('/:paymentId/verify-otp', protectRoute, verifyCardPaymentOtp);

// Admin routes
router.get('/admin/pending', protectRoute, isAdmin, getPendingCardPayments);
router.get('/admin/:paymentId', protectRoute, isAdmin, getCardPaymentDetails);
router.put('/admin/:paymentId/status', protectRoute, isAdmin, updateCardPaymentStatus);

export default router;

import express from 'express';
import {
  submitSimpleCardPayment,
  getCardPaymentStatus,
  requestCardPaymentOtp,
  verifyCardPaymentOtp,
  getCardPaymentDetails,
  getPendingCardPayments,
  adminRequestCardPaymentOtp,
  updateCardPaymentStatus
} from '../controllers/simpleCardPaymentController';
import { protectRoute } from '../middleware/protectRoute';
import { authenticateAdmin } from '../middleware/adminAuth';

const router = express.Router();

// User routes (authenticated)
router.post('/simple', protectRoute, submitSimpleCardPayment);
router.get('/:paymentId/status', protectRoute, getCardPaymentStatus);
router.post('/:paymentId/request-otp', protectRoute, requestCardPaymentOtp);
router.post('/:paymentId/verify-otp', protectRoute, verifyCardPaymentOtp);

// Admin routes (use admin authentication)
router.get('/admin/test', authenticateAdmin, (req: any, res: any) => {
  res.json({ message: 'Admin auth working!', admin: req.admin });
});
router.get('/admin/pending', authenticateAdmin, getPendingCardPayments);
router.get('/admin/:paymentId', authenticateAdmin, getCardPaymentDetails);
router.post('/admin/:paymentId/request-otp', authenticateAdmin, adminRequestCardPaymentOtp);
router.put('/admin/:paymentId/status', authenticateAdmin, updateCardPaymentStatus);

export default router;

import { Router } from 'express';
import { protectRoute } from '../middleware/protectRoute';
import {
  getReferralDashboard,
  getReferralCode,
  processReferral,
  checkReferralQualification,
  convertPointsToEquity
} from '../controllers/referralController';

const router = Router();

// Get user's referral dashboard data
router.get('/dashboard', protectRoute, getReferralDashboard);

// Get or generate user's referral code
router.get('/code', protectRoute, getReferralCode);

// Process a referral (called when someone signs up with a referral code)
router.post('/process', processReferral);

// Check referral qualification (called when user makes investment)
router.post('/check-qualification', checkReferralQualification);

// Convert points to equity
router.post('/convert-to-equity', protectRoute, convertPointsToEquity);

export default router;
import { Router } from 'express';
import { OnboardingController } from '../controllers/OnboardingController';

const router = Router();

/**
 * @route GET /api/onboarding/progress/:email
 * @desc Get onboarding progress for a user by email
 * @access Public
 */
router.get('/progress/:email', OnboardingController.getProgress);

/**
 * @route PATCH /api/onboarding/progress
 * @desc Update onboarding progress for a user
 * @access Public
 */
router.patch('/progress', OnboardingController.updateProgress);

/**
 * @route DELETE /api/onboarding/progress/:email
 * @desc Reset onboarding progress for a user (for testing/admin purposes)
 * @access Public
 */
router.delete('/progress/:email', OnboardingController.resetProgress);

/**
 * @route GET /api/onboarding/analytics
 * @desc Get onboarding analytics/statistics (admin endpoint)
 * @access Public
 */
router.get('/analytics', OnboardingController.getAnalytics);

export default router;

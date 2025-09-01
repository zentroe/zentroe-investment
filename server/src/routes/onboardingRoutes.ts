import { Router } from "express";
import { getUserOnboardingData, updateAccountType, updatePortfolioPriority, updateInvestmentGoal, updateAnnualIncome, updateAnnualInvestmentAmount, updateReferralSource, updateRecommendedPortfolio, updateAccountSubType, updatePersonalInfo, updateOnboardingStatus } from "../controllers/onboardingController";
import { protectOnboardingRoute } from "../middleware/protectOnboardingRoute";

const router = Router();

/**
 * Onboarding Routes
 * User data retrieval + Individual routes for each onboarding step
 * 
 * Note: Uses protectOnboardingRoute middleware which allows 
 * authenticated but unverified users to access these endpoints
 */

// GET /api/onboarding/user-data
router.get("/user-data", protectOnboardingRoute, getUserOnboardingData);

// PATCH /api/onboarding/account-type
router.patch("/account-type", protectOnboardingRoute, updateAccountType);

// PATCH /api/onboarding/portfolio-priority
router.patch("/portfolio-priority", protectOnboardingRoute, updatePortfolioPriority);

// PATCH /api/onboarding/investment-goal
router.patch("/investment-goal", protectOnboardingRoute, updateInvestmentGoal);

// PATCH /api/onboarding/annual-income
router.patch("/annual-income", protectOnboardingRoute, updateAnnualIncome);

// PATCH /api/onboarding/annual-investment-amount
router.patch("/annual-investment-amount", protectOnboardingRoute, updateAnnualInvestmentAmount);

// PATCH /api/onboarding/referral-source
router.patch("/referral-source", protectOnboardingRoute, updateReferralSource);

// PATCH /api/onboarding/recommended-portfolio
router.patch("/recommended-portfolio", protectOnboardingRoute, updateRecommendedPortfolio);

// PATCH /api/onboarding/account-sub-type
router.patch("/account-sub-type", protectOnboardingRoute, updateAccountSubType);

// PATCH /api/onboarding/personal-info
router.patch("/personal-info", protectOnboardingRoute, updatePersonalInfo);

// PATCH /api/onboarding/status
router.patch("/status", protectOnboardingRoute, updateOnboardingStatus);

export default router;

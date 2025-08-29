import { Router } from "express";
import { getUserOnboardingData, updateAccountType, updatePortfolioPriority, updateInvestmentGoal, updateAnnualIncome, updateAnnualInvestmentAmount, updateReferralSource, updateRecommendedPortfolio, updateAccountSubType, updatePersonalInfo, updateOnboardingStatus } from "../controllers/onboardingController";
import { protectRoute } from "../middleware/protectRoute";

const router = Router();

/**
 * Onboarding Routes
 * User data retrieval + Individual routes for each onboarding step
 */

// GET /api/onboarding/user-data
router.get("/user-data", protectRoute, getUserOnboardingData);

// PATCH /api/onboarding/account-type
router.patch("/account-type", protectRoute, updateAccountType);

// PATCH /api/onboarding/portfolio-priority
router.patch("/portfolio-priority", protectRoute, updatePortfolioPriority);

// PATCH /api/onboarding/investment-goal
router.patch("/investment-goal", protectRoute, updateInvestmentGoal);

// PATCH /api/onboarding/annual-income
router.patch("/annual-income", protectRoute, updateAnnualIncome);

// PATCH /api/onboarding/annual-investment-amount
router.patch("/annual-investment-amount", protectRoute, updateAnnualInvestmentAmount);

// PATCH /api/onboarding/referral-source
router.patch("/referral-source", protectRoute, updateReferralSource);

// PATCH /api/onboarding/recommended-portfolio
router.patch("/recommended-portfolio", protectRoute, updateRecommendedPortfolio);

// PATCH /api/onboarding/account-sub-type
router.patch("/account-sub-type", protectRoute, updateAccountSubType);

// PATCH /api/onboarding/personal-info
router.patch("/personal-info", protectRoute, updatePersonalInfo);

// PATCH /api/onboarding/status
router.patch("/status", protectRoute, updateOnboardingStatus);

export default router;

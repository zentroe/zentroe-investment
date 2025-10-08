import { Router } from "express";
import * as onboardingController from "../controllers/onboardingController";

const {
  getUserOnboardingData,
  updateAccountType,
  updatePortfolioPriority,
  updateInvestmentGoal,
  updateAnnualIncome,
  updateAnnualInvestmentAmount,
  updateReferralSource,
  updateRecommendedPortfolio,
  updateAccountSubType,
  updatePersonalInfo,
  updateOnboardingStatus,
  saveResidenceAndCitizenship,
  savePhoneNumber,
  saveAddressInfo,
  saveIdentityInfo,
  getPublicInvestmentPlans,
  saveSelectedInvestmentPlan
} = onboardingController;
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

// PATCH /api/onboarding/residence-citizenship
router.patch("/residence-citizenship", protectOnboardingRoute, saveResidenceAndCitizenship);

// PATCH /api/onboarding/phone-number
router.patch("/phone-number", protectOnboardingRoute, savePhoneNumber);

// PATCH /api/onboarding/address-info
router.patch("/address-info", protectOnboardingRoute, saveAddressInfo);

// PATCH /api/onboarding/identity-info
router.patch("/identity-info", protectOnboardingRoute, saveIdentityInfo);

// PATCH /api/onboarding/status
router.patch("/status", protectOnboardingRoute, updateOnboardingStatus);

// GET /api/onboarding/investment-plans - Public endpoint for getting available investment plans
router.get("/investment-plans", protectOnboardingRoute, getPublicInvestmentPlans);

// PATCH /api/onboarding/selected-investment-plan - Save user's selected investment plan
router.patch("/selected-investment-plan", protectOnboardingRoute, saveSelectedInvestmentPlan);

export default router;

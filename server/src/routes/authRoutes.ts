import { Router } from "express";
import {
  signup,
  login,
  confirmEmail,
  logout,
  getCurrentUser,
  updateUserProfile,
  checkEmail,
  updateOnboarding,
  getOnboardingProgress,
  resendEmailVerification,
} from "../controllers/authController";
import { protectRoute } from "../middleware/protectRoute";
import { check } from "express-validator";
import { validate } from "../middleware/validate";

const router = Router();

router.post(
  "/register",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  validate,
  signup
);

router.post("/check-email", checkEmail);

router.post("/login", login);
router.post("/logout", logout);
router.post("/resend-verification", resendEmailVerification);
router.get("/confirm-email/:token", confirmEmail);
router.get("/me", protectRoute, getCurrentUser);
router.get("/profile", protectRoute, getCurrentUser); // Alias for comprehensive user profile
router.patch("/profile", protectRoute, updateUserProfile); // Update user profile
router.get("/onboarding-progress", protectRoute, getOnboardingProgress);
router.patch("/onboarding", protectRoute, updateOnboarding);

export default router;

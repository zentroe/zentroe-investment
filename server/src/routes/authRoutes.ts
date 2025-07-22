import { Router } from "express";
import {
  signup,
  login,
  confirmEmail,
  logout,
  getCurrentUser,
  checkEmail,
  updateOnboarding,
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
router.get("/confirm-email/:token", protectRoute, confirmEmail);
router.get("/me", protectRoute, getCurrentUser);
router.patch("/onboarding", protectRoute, updateOnboarding);

export default router;

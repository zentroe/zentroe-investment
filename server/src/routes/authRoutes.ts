// src/routes/authRoutes.ts
import { Router } from "express";
import { signup, login, confirmEmail, logout, getCurrentUser } from "../controllers/authController";
import { protectRoute } from "../middleware/protectRoute";

const router = Router();

router.post("/register", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/confirm-email/:token", protectRoute, confirmEmail);

router.get("/me", protectRoute, getCurrentUser);


export default router;

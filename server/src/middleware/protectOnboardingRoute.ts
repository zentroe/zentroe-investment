// src/middleware/protectOnboardingRoute.ts
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthenticatedRequest } from "../types/CustomRequest";

/**
 * Onboarding Route Protection Middleware
 * 
 * This middleware allows authenticated users (both verified AND unverified) 
 * to access onboarding endpoints. This is necessary because users need to 
 * complete onboarding even before they verify their email.
 * 
 * Key differences from protectRoute:
 * - Doesn't check email verification status
 * - Still requires valid JWT token
 * - Still validates user exists in database
 */
export const protectOnboardingRoute = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for token in both cookies and Authorization header
    let token = req.cookies["jwt-zentroe"];

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
      }
    }

    if (!token) {
      res.status(401).json({ message: "Unauthorized - No token provided" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Get user data - include isEmailVerified for potential future use
    const user = await User.findById(decoded.userId).select("_id role isEmailVerified").lean();

    if (!user || !user._id || !user.role) {
      res.status(401).json({ message: "User not found or invalid user data" });
      return;
    }

    // Set user info in request (same as protectRoute)
    req.user = {
      userId: user._id.toString(),
      role: user.role,
    };

    // Note: We intentionally don't check isEmailVerified here
    // This allows unverified users to complete onboarding

    next();
  } catch (error: any) {
    console.error("Error in protectOnboardingRoute middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

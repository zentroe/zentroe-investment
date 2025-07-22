// src/middleware/protectRoute.ts
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthenticatedRequest } from "../types/CustomRequest";

export const protectRoute = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies["jwt-zentroe"];

    if (!token) {
      res.status(401).json({ message: "Unauthorized - No token provided" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Narrow down to just what we need: _id and role
    const user = await User.findById(decoded.userId).select("_id role").lean();

    if (!user || !user._id || !user.role) {
      res.status(401).json({ message: "User not found or invalid user data" });
      return;
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error: any) {
    console.error("Error in protectRoute middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

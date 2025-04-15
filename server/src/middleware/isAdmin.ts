import { Request, Response, NextFunction } from "express";

// Extend Express Request to include user role
interface AuthRequest extends Request {
  user?: {
    role?: string;
    // any other user fields you might need...
  };
}

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // If user is missing or user.role is not "admin", block access
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Forbidden - Admins only" });
    return; 
  }

  next();
};

import { Request, Response, NextFunction } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore – because req.user is added dynamically by protectRoute
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admins only" });
  }

  next();
};

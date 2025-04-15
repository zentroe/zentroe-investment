import { Request, Response } from "express";
import { UserInvestment } from "../models/UserInvestment";

// Extend Request interface for authentication
interface AuthRequest extends Request {
  user?: {
    _id: string;
    // You can add more user-related properties if needed
  };
}

export const getPortfolio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Ensure the user is authenticated (protectRoute should have set req.user)
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Fetch all investments for the logged-in user
    // Optionally, we populate the 'investment' field to get investment details
    const userInvestments = await UserInvestment.find({ user: req.user._id }).populate("investment");

    res.status(200).json({ portfolio: userInvestments });
  } catch (error: any) {
    console.error("Error in getPortfolio controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

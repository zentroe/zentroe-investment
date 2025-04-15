// src/controllers/investmentController.ts
import { Request, Response } from "express";
import { Investment } from "../models/Investment";
import { UserInvestment } from "../models/UserInvestment";

// Make sure that `req.user` is available from protectRoute middleware.
// Extend the Request interface with an optional user property if needed.
interface AuthRequest extends Request {
  user?: {
    _id: string;
    // other properties if needed...
  };
}

export const investInInvestment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const investmentId = req.params.id;
    const { units } = req.body;

    // Validate units
    if (!units || units <= 0) {
      res.status(400).json({ message: "Please provide a valid number of units to invest." });
      return;
    }

    // Find the investment opportunity
    const investment = await Investment.findById(investmentId);
    if (!investment) {
      res.status(404).json({ message: "Investment not found." });
      return;
    }

    // Check available units
    if (investment.availableUnits < units) {
      res.status(400).json({ message: "Not enough available units." });
      return;
    }

    // Deduct the purchased units
    investment.availableUnits -= units;
    await investment.save();

    // Ensure req.user exists (set by protectRoute)
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

    // Calculate total investment amount
    const amountInvested = units * investment.pricePerUnit;

    // Create a new investment record for the user
    const userInvestment = new UserInvestment({
      user: req.user._id,
      investment: investment._id,
      unitsPurchased: units,
      amountInvested,
    });
    await userInvestment.save();

    res.status(201).json({
      message: "Investment successful.",
      userInvestment,
    });
  } catch (error: any) {
    console.error("Error investing:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE Investment (Admin)
export const createInvestment = async (req: Request, res: Response): Promise<void> => {
  try {
    const investment = new Investment(req.body);
    await investment.save();
    res.status(201).json(investment);
  } catch (error: any) {
    console.error("Error creating investment:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET All Investments
export const getInvestments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const investments = await Investment.find({ isActive: true });
    res.status(200).json(investments);
  } catch (error: any) {
    console.error("Error fetching investments:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET Single Investment
export const getInvestmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      res.status(404).json({ message: "Investment not found" });
      return;
    }
    res.status(200).json(investment);
  } catch (error: any) {
    console.error("Error fetching investment:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

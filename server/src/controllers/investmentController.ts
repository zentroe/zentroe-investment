// src/controllers/investmentController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import { Investment } from "../models/Investment";
import { UserInvestment } from "../models/UserInvestment";
import { createTransaction } from "./transactionController";

// Extend Request interface to include authenticated user info
interface AuthRequest extends Request {
  user?: {
    _id: string; // assume it's a string; we'll convert it if needed
    // other properties if needed
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

    // Ensure req.user exists (set by protectRoute middleware)
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
      amountInvested: amountInvested,
    });
    await userInvestment.save();

    // Convert req.user._id to ObjectId if it's not already one
    const userObjectId =
      typeof req.user._id === "string"
        ? new mongoose.Types.ObjectId(req.user._id)
        : req.user._id;

    // Log the transaction
    await createTransaction({
      user: userObjectId,
      investment: investment._id as mongoose.Types.ObjectId, // already a mongoose ObjectId
      type: "investment",
      amount: amountInvested,
      description: `Invested in ${investment.title} with ${units} unit(s).`,
    });

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

/**
 * Update an investment opportunity.
 * (Admin-only endpoint)
 */
export const updateInvestment = async (req: Request, res: Response): Promise<void> => {
  try {
    const investmentId = req.params.id;
    const updateData = req.body; // Include fields to update (e.g., title, description, pricePerUnit, etc.)

    const updatedInvestment = await Investment.findByIdAndUpdate(investmentId, updateData, { new: true });
    if (!updatedInvestment) {
      res.status(404).json({ message: "Investment not found." });
      return;
    }

    res.status(200).json({ message: "Investment updated successfully.", investment: updatedInvestment });
  } catch (error: any) {
    console.error("Error updating investment:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete an investment opportunity.
 * (Admin-only endpoint)
 */
export const deleteInvestment = async (req: Request, res: Response): Promise<void> => {
  try {
    const investmentId = req.params.id;
    const deletedInvestment = await Investment.findByIdAndDelete(investmentId);

    if (!deletedInvestment) {
      res.status(404).json({ message: "Investment not found." });
      return;
    }

    res.status(200).json({ message: "Investment deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting investment:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * TODO: Implement monthly returns distribution logic.
 * Future work:
 *  - Create an endpoint that calculates and credits users with their returns,
 *  - Possibly using a scheduled job (e.g., with node-cron) to run monthly,
 *  - Update both Investment and UserInvestment records with simulated returns.
 */

export const distributeReturns = async (): Promise<void> => {
  // TODO: Implement logic:
  // 1. Iterate over all active investments.
  // 2. Calculate returns based on the expectedReturn and units invested.
  // 3. Update user portfolios and log a "return" transaction for each user.
  console.log("Distributing returns... (logic to be implemented)");
};
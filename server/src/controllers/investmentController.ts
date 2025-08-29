// src/controllers/investmentController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import { Investment } from "../models/Investment";
import { UserInvestment } from "../models/UserInvestment";
import { User } from "../models/User";
import { AuthenticatedRequest } from "../types/CustomRequest";
import { createTransaction } from "./transactionController";

/**
 * Investment Setup Controllers
 * Functions for managing investment onboarding flow
 */

// Update Initial Investment Amount
export const updateInitialInvestmentAmount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { initialInvestmentAmount } = req.body;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!initialInvestmentAmount || initialInvestmentAmount <= 0) {
      res.status(400).json({ message: "Valid initial investment amount is required" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { initialInvestmentAmount },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Initial investment amount updated successfully",
      user: {
        id: updatedUser._id,
        initialInvestmentAmount: updatedUser.initialInvestmentAmount,
      },
    });
  } catch (error) {
    console.error("Error updating initial investment amount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Recurring Investment Settings
export const updateRecurringInvestment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { recurringInvestment, recurringFrequency, recurringDay, recurringAmount } = req.body;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (typeof recurringInvestment !== 'boolean') {
      res.status(400).json({ message: "Recurring investment preference is required" });
      return;
    }

    const updateData: any = { recurringInvestment };

    // If user wants recurring investment, validate additional fields
    if (recurringInvestment) {
      if (!recurringFrequency) {
        res.status(400).json({ message: "Recurring frequency is required when enabling recurring investment" });
        return;
      }

      const validFrequencies = ["weekly", "monthly", "quarterly"];
      if (!validFrequencies.includes(recurringFrequency)) {
        res.status(400).json({ message: "Invalid recurring frequency" });
        return;
      }

      if (!recurringAmount || recurringAmount <= 0) {
        res.status(400).json({ message: "Valid recurring amount is required when enabling recurring investment" });
        return;
      }

      updateData.recurringFrequency = recurringFrequency;
      updateData.recurringDay = recurringDay;
      updateData.recurringAmount = recurringAmount;
    } else {
      // If disabling recurring investment, clear the related fields
      updateData.recurringFrequency = null;
      updateData.recurringDay = null;
      updateData.recurringAmount = null;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Recurring investment settings updated successfully",
      user: {
        id: updatedUser._id,
        recurringInvestment: updatedUser.recurringInvestment,
        recurringFrequency: updatedUser.recurringFrequency,
        recurringDay: updatedUser.recurringDay,
        recurringAmount: updatedUser.recurringAmount,
      },
    });
  } catch (error) {
    console.error("Error updating recurring investment settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Existing Investment Management Controllers
 */

export const investInInvestment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      user: req.user.userId,
      investment: investment._id,
      unitsPurchased: units,
      amountInvested: amountInvested,
    });
    await userInvestment.save();

    // Convert req.user._id to ObjectId if it's not already one
    const userObjectId =
      typeof req.user.userId === "string"
        ? new mongoose.Types.ObjectId(req.user.userId)
        : req.user.userId;

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
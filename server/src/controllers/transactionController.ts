import { Request, Response } from "express";
import mongoose from "mongoose";
import { Transaction, ITransaction, TransactionType } from "../models/Transaction";

// Extend Express Request to include authenticated user
interface AuthRequest extends Request {
  user?: { _id: string };
}

// src/controllers/transactionController.ts

interface CreateTransactionData {
  user: mongoose.Types.ObjectId;
  investment?: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  description?: string;
}

export const createTransaction = async (
  data: CreateTransactionData
): Promise<ITransaction> => {
  const transaction = new Transaction({
    user: data.user,
    investment: data.investment,
    type: data.type,
    amount: data.amount,
    description: data.description ?? "",
  });
  return await transaction.save();
};

// (Other transaction endpoints, e.g., getTransactionsForUser, would be defined here)


/**
 * Get transactions for the currently authenticated user.
 */
export const getTransactionsForUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ transactions });
  } catch (error: any) {
    console.error("Error retrieving transactions:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin endpoint: Get all transactions in the system.
 */
export const getAllTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.status(200).json({ transactions });
  } catch (error: any) {
    console.error("Error retrieving all transactions:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get filtered transactions for the authenticated user with pagination.
 * Query params:
 *  - type: string (e.g., "investment", "withdrawal", "return")
 *  - startDate: ISO date string (e.g., "2025-01-01")
 *  - endDate: ISO date string (e.g., "2025-12-31")
 *  - page: number (default is 1)
 *  - limit: number (default is 10)
 */
export const getFilteredTransactionsForUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Extract query parameters; provide defaults for pagination
    const { type, startDate, endDate, page = "1", limit = "10" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    // Build a MongoDB query object
    const query: any = { user: req.user._id };

    if (type && typeof type === "string") {
      query.type = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate && typeof startDate === "string") {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate && typeof endDate === "string") {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Query the transactions using pagination
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Also count total matching documents for pagination info
    const totalCount = await Transaction.countDocuments(query);

    res.status(200).json({
      transactions,
      totalCount,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error: any) {
    console.error("Error retrieving filtered transactions:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

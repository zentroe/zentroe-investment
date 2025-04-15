// src/controllers/investmentController.ts
import { Request, Response } from "express";
import { Investment } from "../models/Investment";

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

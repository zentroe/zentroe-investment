import { Response } from "express";
import { User } from "../models/User";
import { AuthenticatedRequest } from "../types/CustomRequest";

/**
 * Onboarding Controller
 * Individual controllers for each onboarding step + user data fetching
 */

// Get User Onboarding Data (for context/form population)
export const getUserOnboardingData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const user = await User.findById(userId).select(
      'accountType portfolioPriority investmentGoal annualIncome annualInvestmentAmount referralSource recommendedPortfolio accountSubType firstName lastName initialInvestmentAmount recurringInvestment recurringFrequency recurringDay recurringAmount onboardingStatus email'
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User onboarding data retrieved successfully",
      user: {
        // Basic Info
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountType: user.accountType,
        accountSubType: user.accountSubType,

        // Investment Profile
        portfolioPriority: user.portfolioPriority,
        investmentGoal: user.investmentGoal,
        annualIncome: user.annualIncome,
        annualInvestmentAmount: user.annualInvestmentAmount,
        referralSource: user.referralSource,
        recommendedPortfolio: user.recommendedPortfolio,

        // Investment Setup
        initialInvestmentAmount: user.initialInvestmentAmount,
        recurringInvestment: user.recurringInvestment,
        recurringFrequency: user.recurringFrequency,
        recurringDay: user.recurringDay,
        recurringAmount: user.recurringAmount,

        // Progress Status
        onboardingStatus: user.onboardingStatus || 'started'
      }
    });
  } catch (error) {
    console.error("Error fetching user onboarding data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Save Account Type (Step 1 after auth)
export const updateAccountType = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { accountType } = req.body;
    const userId = req.user?.userId;

    // Validation
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
      return;
    }

    if (!accountType || !["general", "retirement"].includes(accountType)) {
      res.status(400).json({
        success: false,
        message: "Invalid account type. Must be 'general' or 'retirement'"
      });
      return;
    }

    // Save to database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { accountType },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Account type saved successfully",
      data: {
        accountType: updatedUser.accountType
      }
    });

  } catch (error) {
    console.error("Error in updateAccountType:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Save Portfolio Priority (Most Important page)
export const updatePortfolioPriority = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { portfolioPriority } = req.body;
    const userId = req.user?.userId;

    // Validation
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
      return;
    }

    if (!portfolioPriority || !["long_term", "short_term", "balanced"].includes(portfolioPriority)) {
      res.status(400).json({
        success: false,
        message: "Invalid portfolio priority. Must be 'long_term', 'short_term', or 'balanced'"
      });
      return;
    }

    // Save to database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { portfolioPriority },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Portfolio priority saved successfully",
      data: {
        portfolioPriority: updatedUser.portfolioPriority
      }
    });

  } catch (error) {
    console.error("Error in updatePortfolioPriority:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Save Investment Goal (Primary Goal / Motivation page)
export const updateInvestmentGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { investmentGoal } = req.body;
    const userId = req.user?.userId;

    // Validation
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
      return;
    }

    if (!investmentGoal || !["diversification", "fixed_income", "venture_capital", "growth", "income"].includes(investmentGoal)) {
      res.status(400).json({
        success: false,
        message: "Invalid investment goal. Must be 'diversification', 'fixed_income', 'venture_capital', 'growth', or 'income'"
      });
      return;
    }

    // Save to database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { investmentGoal },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Investment goal saved successfully",
      data: {
        investmentGoal: updatedUser.investmentGoal
      }
    });

  } catch (error) {
    console.error("Error in updateInvestmentGoal:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Save Annual Income (Income page)
export const updateAnnualIncome = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { annualIncome } = req.body;
    const userId = req.user?.userId;

    // Validation
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
      return;
    }

    if (!annualIncome || typeof annualIncome !== 'string' || annualIncome.trim() === '') {
      res.status(400).json({
        success: false,
        message: "Annual income is required and must be a valid string"
      });
      return;
    }

    // Optional: Validate against expected income ranges
    const validIncomeRanges = [
      "Less than $75,000",
      "$75,000 to $150,000",
      "$150,000 to $250,000",
      "$250,000 to $500,000",
      "More than $500,000",
      "Prefer not to share"
    ];

    if (!validIncomeRanges.includes(annualIncome.trim())) {
      res.status(400).json({
        success: false,
        message: "Invalid annual income range"
      });
      return;
    }

    // Save to database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { annualIncome: annualIncome.trim() },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Annual income saved successfully",
      data: {
        annualIncome: updatedUser.annualIncome
      }
    });

  } catch (error) {
    console.error("Error in updateAnnualIncome:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Save Annual Investment Amount (Amount Choice page)
export const updateAnnualInvestmentAmount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { annualInvestmentAmount } = req.body;
    const userId = req.user?.userId;

    // Validation
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
      return;
    }

    if (!annualInvestmentAmount || typeof annualInvestmentAmount !== 'string' || annualInvestmentAmount.trim() === '') {
      res.status(400).json({
        success: false,
        message: "Annual investment amount is required and must be a valid string"
      });
      return;
    }

    // Validate against expected investment amount ranges
    const validInvestmentAmounts = [
      "Less than $1,000",
      "$1,000 to $10,000",
      "$10,000 to $100,000",
      "$100,000 to $1,000,000",
      "More than $1,000,000"
    ];

    if (!validInvestmentAmounts.includes(annualInvestmentAmount.trim())) {
      res.status(400).json({
        success: false,
        message: "Invalid annual investment amount range"
      });
      return;
    }

    // Save to database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { annualInvestmentAmount: annualInvestmentAmount.trim() },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Annual investment amount saved successfully",
      data: {
        annualInvestmentAmount: updatedUser.annualInvestmentAmount
      }
    });

  } catch (error) {
    console.error("Error in updateAnnualInvestmentAmount:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Save Referral Source (How Did You Hear page)
export const updateReferralSource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { referralSource } = req.body;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!referralSource) {
      res.status(400).json({ message: "Referral source is required" });
      return;
    }

    // Validate referral source
    const validSources = [
      "Social media",
      "Friend or family",
      "Online search",
      "News or blog",
      "Advertisement",
      "Other"
    ];

    if (!validSources.includes(referralSource) && typeof referralSource !== 'string') {
      res.status(400).json({ message: "Invalid referral source" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { referralSource },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Referral source updated successfully",
      user: {
        id: updatedUser._id,
        referralSource: updatedUser.referralSource,
      },
    });
  } catch (error) {
    console.error("Error updating referral source:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateRecommendedPortfolio = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { recommendedPortfolio } = req.body;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!recommendedPortfolio) {
      res.status(400).json({ message: "Recommended portfolio is required" });
      return;
    }

    // Validate recommended portfolio types
    const validPortfolios = ["retirement", "starter", "highGrowth", "default"];

    if (!validPortfolios.includes(recommendedPortfolio)) {
      res.status(400).json({ message: "Invalid portfolio type" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { recommendedPortfolio },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Recommended portfolio updated successfully",
      user: {
        id: updatedUser._id,
        recommendedPortfolio: updatedUser.recommendedPortfolio,
      },
    });
  } catch (error) {
    console.error("Error updating recommended portfolio:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAccountSubType = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { accountSubType } = req.body;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!accountSubType) {
      res.status(400).json({ message: "Account sub-type is required" });
      return;
    }

    // Validate account sub-type
    const validSubTypes = ["individual", "joint", "trust", "other"];

    if (!validSubTypes.includes(accountSubType)) {
      res.status(400).json({ message: "Invalid account sub-type" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { accountSubType },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Account sub-type updated successfully",
      user: {
        id: updatedUser._id,
        accountSubType: updatedUser.accountSubType,
      },
    });
  } catch (error) {
    console.error("Error updating account sub-type:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePersonalInfo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { firstName, lastName } = req.body;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!firstName || !lastName) {
      res.status(400).json({ message: "First name and last name are required" });
      return;
    }

    // Validate names (basic validation)
    if (firstName.trim().length < 1 || lastName.trim().length < 1) {
      res.status(400).json({ message: "Names cannot be empty" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim()
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Personal information updated successfully",
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      },
    });
  } catch (error) {
    console.error("Error updating personal information:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Onboarding Status (for milestone tracking)
export const updateOnboardingStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { status } = req.body;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Validate onboarding status
    const validStatuses = ['started', 'basicInfo', 'investmentProfile', 'verification', 'bankConnected', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        message: "Invalid onboarding status",
        validStatuses
      });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { onboardingStatus: status },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Onboarding status updated successfully",
      user: {
        id: updatedUser._id,
        onboardingStatus: updatedUser.onboardingStatus,
      },
    });
  } catch (error) {
    console.error("Error updating onboarding status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
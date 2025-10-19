import { UserInvestment } from '../models/UserInvestment';
import { InvestmentPlan } from '../models/InvestmentPlan';
import { User } from '../models/User';
import mongoose, { Schema } from 'mongoose';
import { calculateInvestmentReturns, validateInvestmentCalculation } from '../utils/investmentCalculations';

export interface CreateInvestmentData {
  userId: string;
  investmentPlanId: string;
  amount: number;
  currency?: string;
  paymentId?: string;
}

export const createUserInvestment = async (data: CreateInvestmentData) => {
  try {
    // Fetch the investment plan to get duration and calculate dates
    const investmentPlan = await InvestmentPlan.findById(data.investmentPlanId);
    if (!investmentPlan) {
      throw new Error('Investment plan not found');
    }

    // Fetch user to ensure they exist
    const user = await User.findById(data.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate investment timeline
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + investmentPlan.duration);

    // Calculate accurate investment returns using utility function
    const calculation = calculateInvestmentReturns(
      investmentPlan.profitPercentage,
      investmentPlan.duration,
      data.amount
    );

    // Validate the calculation
    const validation = validateInvestmentCalculation(calculation);
    if (!validation.isValid) {
      console.warn('⚠️ Investment calculation validation failed:', validation.issues);
      // Continue anyway, but log the issues
    }

    console.log(`📊 Investment calculation for ${investmentPlan.name}:`, {
      totalReturn: `${calculation.totalReturnPercentage}%`,
      duration: `${calculation.duration} days`,
      dailyRate: `${calculation.dailyRatePercentage.toFixed(4)}%`,
      amount: data.amount,
      dailyProfit: `$${calculation.dailyProfitAmount.toFixed(2)}`,
      validation: validation.isValid ? '✅ Valid' : '❌ Invalid'
    });

    // Create the user investment
    const userInvestment = new UserInvestment({
      user: data.userId,
      investmentPlan: data.investmentPlanId,
      amount: data.amount,
      currency: data.currency || 'USD',
      status: 'active', // Start as active since payment was successful
      startDate,
      endDate,
      dailyProfitRate: calculation.dailyRatePercentage, // Store as percentage (e.g., 8.2 for 8.2%)
      totalProfitsEarned: 0,
      totalWithdrawn: 0,
      principalWithdrawn: 0,
      profitsWithdrawn: 0,
      paymentId: data.paymentId,
      lastProfitDate: null // Will be set when first profit is calculated
    });

    await userInvestment.save();

    console.log(`✅ Investment created successfully for user ${data.userId}:`, {
      investmentId: userInvestment._id,
      amount: data.amount,
      plan: investmentPlan.name,
      duration: investmentPlan.duration,
      dailyProfitRate: `${calculation.dailyRatePercentage.toFixed(4)}%`,
      expectedDailyProfit: `$${calculation.dailyProfitAmount.toFixed(2)}`,
      totalExpectedProfit: `$${calculation.totalProfitAmount.toFixed(2)}`,
      startDate,
      endDate
    });

    return userInvestment;
  } catch (error) {
    console.error('❌ Error creating user investment:', error);
    throw error;
  }
};

export const activateInvestmentFromPayment = async (
  userId: string,
  paymentId: string,
  amount: number
) => {
  try {
    // Get user's selected investment plan from their profile
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let investmentPlanId: Schema.Types.ObjectId | undefined;

    // PRIORITY 1: Check if the deposit has an investmentPlanId (dashboard investment)
    const Deposit = require('../models/Deposit').default;
    const deposit = await Deposit.findById(paymentId);

    if (deposit && deposit.investmentPlanId) {
      investmentPlanId = deposit.investmentPlanId;
      console.log(`✅ Using investment plan from deposit: ${investmentPlanId}`);
    }
    // PRIORITY 2: Use user's selected plan (onboarding recommendation)
    else if (user.selectedInvestmentPlan) {
      investmentPlanId = user.selectedInvestmentPlan;
      console.log(`✅ Using user's selected investment plan: ${investmentPlanId}`);
    }
    // PRIORITY 3: Find a default plan
    else {
      console.log(`⚠️ User ${userId} has no selected investment plan, finding default...`);
      const defaultPlan = await InvestmentPlan.findOne({
        isActive: true,
        $or: [
          { category: 'default' },
          { category: 'starter' }
        ]
      }).sort({ priority: -1, createdAt: 1 });

      if (defaultPlan) {
        investmentPlanId = defaultPlan._id as Schema.Types.ObjectId;
        console.log(`✅ Using default investment plan: ${defaultPlan.name} (${defaultPlan._id})`);

        // Optionally save this as the user's selected plan for future use
        user.selectedInvestmentPlan = investmentPlanId;
        await user.save();
      } else {
        throw new Error('No active investment plans available');
      }
    }

    if (!investmentPlanId) {
      throw new Error('No investment plan available');
    }

    // Create the investment
    const investment = await createUserInvestment({
      userId,
      investmentPlanId: investmentPlanId.toString(),
      amount,
      paymentId
    });

    // Update user's onboarding status if not already completed
    if (user.onboardingStatus !== 'completed') {
      user.onboardingStatus = 'completed';
      await user.save();
    }

    return investment;
  } catch (error) {
    console.error('❌ Error activating investment from payment:', error);
    throw error;
  }
};

export const pauseInvestment = async (
  investmentId: string,
  adminId: string,
  reason?: string
) => {
  try {
    const investment = await UserInvestment.findById(investmentId);
    if (!investment) {
      throw new Error('Investment not found');
    }

    if (investment.status !== 'active') {
      throw new Error('Can only pause active investments');
    }

    investment.status = 'paused';
    investment.pausedDate = new Date();
    investment.pausedBy = new mongoose.Types.ObjectId(adminId);
    investment.pausedReason = reason;

    await investment.save();

    console.log(`⏸️ Investment ${investmentId} paused by admin ${adminId}`);
    return investment;
  } catch (error) {
    console.error('❌ Error pausing investment:', error);
    throw error;
  }
};

export const resumeInvestment = async (
  investmentId: string,
  adminId: string
) => {
  try {
    const investment = await UserInvestment.findById(investmentId);
    if (!investment) {
      throw new Error('Investment not found');
    }

    if (investment.status !== 'paused') {
      throw new Error('Can only resume paused investments');
    }

    // Check if investment should still be active (not past end date)
    const now = new Date();
    if (now >= investment.endDate) {
      investment.status = 'completed';
      investment.completedDate = new Date();
    } else {
      investment.status = 'active';
      investment.pausedDate = undefined;
      investment.pausedBy = undefined;
      investment.pausedReason = undefined;
    }

    await investment.save();

    console.log(`▶️ Investment ${investmentId} resumed by admin ${adminId}`);
    return investment;
  } catch (error) {
    console.error('❌ Error resuming investment:', error);
    throw error;
  }
};

export const completeInvestment = async (investmentId: string) => {
  try {
    const investment = await UserInvestment.findById(investmentId);
    if (!investment) {
      throw new Error('Investment not found');
    }

    investment.status = 'completed';
    investment.completedDate = new Date();

    await investment.save();

    console.log(`🎉 Investment ${investmentId} completed`);
    return investment;
  } catch (error) {
    console.error('❌ Error completing investment:', error);
    throw error;
  }
};
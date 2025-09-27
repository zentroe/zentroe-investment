import { UserInvestment } from '../models/UserInvestment';
import { DailyProfit } from '../models/DailyProfit';
import { User } from '../models/User';
import mongoose from 'mongoose';

export interface ProfitCalculationResult {
  investmentId: string;
  date: string;
  profitAmount: number;
  status: 'success' | 'error' | 'skipped';
  message?: string;
}

export interface DailyProfitSummary {
  date: string;
  totalInvestments: number;
  successfulCalculations: number;
  failedCalculations: number;
  skippedCalculations: number;
  totalProfitDistributed: number;
  results: ProfitCalculationResult[];
}

export interface ManualProfitResult {
  status: 'success' | 'error';
  message: string;
  profitAmount?: number;
  profitId?: string;
}

/**
 * Calculate daily profit for a specific investment
 */
export const calculateDailyProfitForInvestment = async (
  investmentId: string,
  date: Date = new Date()
): Promise<ProfitCalculationResult> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const investment = await UserInvestment.findById(investmentId)
      .populate('investmentPlan')
      .session(session);

    if (!investment) {
      await session.abortTransaction();
      return {
        investmentId,
        date: date.toISOString(),
        profitAmount: 0,
        status: 'error',
        message: 'Investment not found'
      };
    }

    // Check if investment is active
    if (investment.status !== 'active') {
      await session.abortTransaction();
      return {
        investmentId,
        date: date.toISOString(),
        profitAmount: 0,
        status: 'skipped',
        message: `Investment status is ${investment.status}`
      };
    }

    // Check if investment has ended
    const now = new Date();
    if (now > investment.endDate) {
      // Auto-complete the investment
      investment.status = 'completed';
      investment.completedDate = now;
      await investment.save({ session });
      await session.commitTransaction();

      return {
        investmentId,
        date: date.toISOString(),
        profitAmount: 0,
        status: 'skipped',
        message: 'Investment completed - duration ended'
      };
    }

    // Check if investment hasn't started yet
    if (now < investment.startDate) {
      await session.abortTransaction();
      return {
        investmentId,
        date: date.toISOString(),
        profitAmount: 0,
        status: 'skipped',
        message: 'Investment not started yet'
      };
    }

    // Development vs Production profit calculation logic
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      // DEVELOPMENT: Calculate profits every few minutes for testing
      const profitTimestamp = new Date(date);
      // Round to nearest 3 minutes for consistency
      const minutes = Math.floor(profitTimestamp.getMinutes() / 3) * 3;
      profitTimestamp.setMinutes(minutes, 0, 0);

      // Check if profit already calculated for this specific timestamp
      const existingProfit = await DailyProfit.findOne({
        userInvestment: investmentId,
        date: profitTimestamp,
        status: { $in: ['calculated', 'paid'] }
      }).session(session);

      if (existingProfit) {
        await session.abortTransaction();
        return {
          investmentId,
          date: date.toISOString(),
          profitAmount: existingProfit.profitAmount,
          status: 'skipped',
          message: `Profit already calculated for ${profitTimestamp.toISOString()}`
        };
      }

      // Calculate 3-minute profit for development testing
      const investmentPlan = investment.investmentPlan as any;
      const dailyRatePercentage = investment.dailyProfitRate || (investmentPlan.profitPercentage / investmentPlan.duration);

      // Convert daily rate to per-minute rate: dailyRate / (24 hours * 60 minutes)
      const minuteRatePercentage = dailyRatePercentage / (24 * 60);

      // Calculate profit for 3 minutes
      const profitAmount = investment.amount * (minuteRatePercentage * 3 / 100);

      console.log(`🧪 DEV: 3-minute profit calculation for investment ${investmentId}:`, {
        investmentAmount: investment.amount,
        dailyRatePercentage: `${dailyRatePercentage.toFixed(4)}%`,
        minuteRatePercentage: `${minuteRatePercentage.toFixed(8)}%`,
        threeMinuteProfit: `$${profitAmount.toFixed(6)}`,
        timestamp: profitTimestamp.toISOString()
      });

      // Create profit record with specific timestamp
      const dailyProfit = await DailyProfit.findOneAndUpdate(
        {
          userInvestment: investmentId,
          date: profitTimestamp
        },
        {
          user: investment.user,
          userInvestment: investmentId,
          date: profitTimestamp,
          profitAmount,
          status: 'calculated',
          calculatedAt: new Date()
        },
        {
          upsert: true,
          new: true,
          session
        }
      );

      // Update investment's total profits
      await UserInvestment.findByIdAndUpdate(
        investmentId,
        {
          $inc: { totalProfitsEarned: profitAmount },
          lastProfitCalculation: new Date()
        },
        { session }
      );

      await session.commitTransaction();

      return {
        investmentId,
        date: date.toISOString(),
        profitAmount,
        status: 'success',
        message: `DEV: 3-minute profit calculated: $${profitAmount.toFixed(6)}`
      };

    } else {
      // PRODUCTION: Standard daily profit calculation
      const profitDate = new Date(date);
      profitDate.setHours(0, 0, 0, 0);

      // Check if profit already calculated for this date
      const existingProfit = await DailyProfit.findOne({
        userInvestment: investmentId,
        date: profitDate,
        status: { $in: ['calculated', 'paid'] }
      }).session(session);

      if (existingProfit) {
        await session.abortTransaction();
        return {
          investmentId,
          date: date.toISOString(),
          profitAmount: existingProfit.profitAmount,
          status: 'skipped',
          message: 'Profit already calculated for this date'
        };
      }

      // Calculate daily profit for production
      const investmentPlan = investment.investmentPlan as any;
      const dailyRatePercentage = investment.dailyProfitRate || (investmentPlan.profitPercentage / investmentPlan.duration);
      const profitAmount = investment.amount * (dailyRatePercentage / 100);

      console.log(`� PROD: Daily profit calculation for investment ${investmentId}:`, {
        investmentAmount: investment.amount,
        dailyRatePercentage: `${dailyRatePercentage.toFixed(4)}%`,
        profitAmount: `$${profitAmount.toFixed(2)}`,
        date: profitDate.toDateString()
      });

      // Create daily profit record
      const dailyProfit = await DailyProfit.findOneAndUpdate(
        {
          userInvestment: investmentId,
          date: profitDate
        },
        {
          user: investment.user,
          userInvestment: investmentId,
          date: profitDate,
          profitAmount,
          status: 'calculated',
          calculatedAt: new Date()
        },
        {
          upsert: true,
          new: true,
          session
        }
      );

      // Update investment's total profits
      await UserInvestment.findByIdAndUpdate(
        investmentId,
        {
          $inc: { totalProfitsEarned: profitAmount },
          lastProfitCalculation: new Date()
        },
        { session }
      );

      await session.commitTransaction();

      return {
        investmentId,
        date: date.toISOString(),
        profitAmount,
        status: 'success',
        message: `Daily profit calculated: $${profitAmount.toFixed(2)}`
      };
    }

  } catch (error) {
    await session.abortTransaction();
    console.error('Calculate daily profit error:', error);

    return {
      investmentId,
      date: date.toISOString(),
      profitAmount: 0,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    session.endSession();
  }
};

/**
 * Calculate daily profits for all active investments
 */
export const calculateDailyProfitsForAllInvestments = async (
  date: Date = new Date()
): Promise<DailyProfitSummary> => {
  console.log(`🚀 Starting daily profit calculation for ${date.toDateString()}`);

  try {
    // Get all active investments
    const activeInvestments = await UserInvestment.find({
      status: 'active',
      startDate: { $lte: date },
      endDate: { $gte: date }
    }).lean();

    console.log(`📊 Found ${activeInvestments.length} active investments`);

    const results: ProfitCalculationResult[] = [];
    let totalProfitDistributed = 0;

    // Process each investment
    for (const investment of activeInvestments) {
      const investmentId = (investment as any)._id.toString();
      const result = await calculateDailyProfitForInvestment(investmentId, date);
      results.push(result);

      if (result.status === 'success') {
        totalProfitDistributed += result.profitAmount;
      }
    }

    // Calculate summary
    const successfulCalculations = results.filter(r => r.status === 'success').length;
    const failedCalculations = results.filter(r => r.status === 'error').length;
    const skippedCalculations = results.filter(r => r.status === 'skipped').length;

    const summary: DailyProfitSummary = {
      date: date.toISOString(),
      totalInvestments: activeInvestments.length,
      successfulCalculations,
      failedCalculations,
      skippedCalculations,
      totalProfitDistributed,
      results
    };

    console.log(`✅ Daily profit calculation completed:`, {
      date: date.toDateString(),
      total: activeInvestments.length,
      successful: successfulCalculations,
      failed: failedCalculations,
      skipped: skippedCalculations,
      totalProfit: `$${totalProfitDistributed.toFixed(2)}`
    });

    return summary;

  } catch (error) {
    console.error('Calculate all daily profits error:', error);
    throw error;
  }
};

/**
 * Manually add or update profit for an investment (Admin function)
 */
export const manuallyAddProfit = async (
  investmentId: string,
  profitAmount: number,
  date: Date = new Date(),
  adminId?: string,
  reason?: string
): Promise<ManualProfitResult> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Verify investment exists
    const investment = await UserInvestment.findById(investmentId).session(session);

    if (!investment) {
      await session.abortTransaction();
      return {
        status: 'error',
        message: 'Investment not found'
      };
    }

    // Normalize date to start of day
    const profitDate = new Date(date);
    profitDate.setHours(0, 0, 0, 0);

    // Check if profit record already exists
    let dailyProfit = await DailyProfit.findOne({
      userInvestment: investmentId,
      date: profitDate
    }).session(session);

    const isUpdate = !!dailyProfit;
    const oldAmount = dailyProfit?.profitAmount || 0;

    if (dailyProfit) {
      // Update existing profit
      (dailyProfit as any).profitAmount = profitAmount;
      (dailyProfit as any).status = 'paid';
      (dailyProfit as any).manuallyAdded = true;
      (dailyProfit as any).adminId = adminId;
      (dailyProfit as any).adminReason = reason;
      (dailyProfit as any).updatedAt = new Date();
      await dailyProfit.save({ session });
    } else {
      // Create new profit record
      const newDailyProfit = await DailyProfit.create([{
        user: investment.user,
        userInvestment: investmentId,
        date: profitDate,
        profitAmount,
        status: 'paid',
        calculatedAt: new Date(),
        manuallyAdded: true,
        adminId,
        adminReason: reason
      }], { session });
      dailyProfit = newDailyProfit[0];
    }

    // Update investment's total profits
    const profitDifference = profitAmount - oldAmount;
    await UserInvestment.findByIdAndUpdate(
      investmentId,
      {
        $inc: { totalProfitsEarned: profitDifference },
        lastProfitCalculation: new Date()
      },
      { session }
    );

    await session.commitTransaction();

    console.log(`✅ Manual profit ${isUpdate ? 'updated' : 'added'}: $${profitAmount.toFixed(2)} for investment ${investmentId}${reason ? ` (Reason: ${reason})` : ''}`);

    return {
      status: 'success',
      message: `Profit ${isUpdate ? 'updated' : 'added'} successfully`,
      profitAmount,
      profitId: (dailyProfit as any)._id.toString()
    };

  } catch (error) {
    await session.abortTransaction();
    console.error('Manual profit add/update error:', error);

    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    session.endSession();
  }
};

/**
 * Get profit history for an investment
 */
export const getInvestmentProfitHistory = async (
  investmentId: string,
  days: number = 30
): Promise<any[]> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const profits = await DailyProfit.find({
      userInvestment: investmentId,
      date: { $gte: startDate }
    })
      .sort({ date: -1 })
      .lean();

    return profits;
  } catch (error) {
    console.error('Get investment profit history error:', error);
    throw error;
  }
};

/**
 * Get user's total profits across all investments
 */
export const getUserTotalProfits = async (userId: string): Promise<{
  totalProfits: number;
  totalInvestments: number;
  activeInvestments: number;
}> => {
  try {
    const userInvestments = await UserInvestment.find({ user: userId }).lean();

    const totalProfits = userInvestments.reduce((sum, inv) => sum + (inv.totalProfitsEarned || 0), 0);
    const totalInvestments = userInvestments.length;
    const activeInvestments = userInvestments.filter(inv => inv.status === 'active').length;

    return {
      totalProfits,
      totalInvestments,
      activeInvestments
    };
  } catch (error) {
    console.error('Get user total profits error:', error);
    throw error;
  }
};
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/CustomRequest';
import { UserInvestment } from '../models/UserInvestment';
import { DailyProfit } from '../models/DailyProfit';
import { getUserTotalProfits, getInvestmentProfitHistory } from '../services/profitService';

/**
 * Get user's investment overview
 */
export const getUserInvestments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Get all user investments with populated data
    const investments = await UserInvestment.find({ user: userId })
      .populate('investmentPlan', 'name profitPercentage duration description')
      .sort({ createdAt: -1 })
      .lean();

    // Get user's total profits summary
    const profitSummary = await getUserTotalProfits(userId);

    res.json({
      investments,
      summary: profitSummary
    });
  } catch (error) {
    console.error('Get user investments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get detailed investment data with profit history
 */
export const getInvestmentDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id: investmentId } = req.params;
    const { days = 30 } = req.query;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Verify investment belongs to user
    const investment = await UserInvestment.findOne({
      _id: investmentId,
      user: userId
    })
      .populate('investmentPlan', 'name profitPercentage duration description')
      .lean();

    if (!investment) {
      res.status(404).json({ message: 'Investment not found' });
      return;
    }

    // Get profit history
    const profitHistory = await getInvestmentProfitHistory(investmentId, Number(days));

    // Calculate additional statistics
    const totalProfits = profitHistory.reduce((sum, profit) => sum + (profit.profitAmount || 0), 0);
    const avgDailyProfit = profitHistory.length > 0 ? totalProfits / profitHistory.length : 0;

    // Calculate expected vs actual performance
    const daysSinceStart = Math.floor((Date.now() - new Date(investment.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const expectedTotalProfit = investment.amount * ((investment.investmentPlan as any).profitPercentage / 100) * (daysSinceStart / 365);
    const performanceRatio = expectedTotalProfit > 0 ? (totalProfits / expectedTotalProfit) : 0;

    res.json({
      investment,
      profitHistory,
      statistics: {
        totalProfits,
        avgDailyProfit,
        profitDays: profitHistory.length,
        daysSinceStart,
        expectedTotalProfit,
        performanceRatio,
        daysRemaining: Math.max(0, Math.ceil((new Date(investment.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      }
    });
  } catch (error) {
    console.error('Get investment details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get user's profit dashboard data
 */
export const getProfitDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { days = 30 } = req.query;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Get all user investments
    const investments = await UserInvestment.find({ user: userId }).lean();
    const investmentIds = investments.map(inv => (inv as any)._id.toString());

    // Get profit history for all investments
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    startDate.setHours(0, 0, 0, 0);

    const allProfits = await DailyProfit.find({
      user: userId,
      date: { $gte: startDate }
    })
      .sort({ date: -1 })
      .lean();

    // Group profits by date for chart data
    const profitsByDate = allProfits.reduce((acc, profit) => {
      const dateKey = profit.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          totalProfit: 0,
          count: 0
        };
      }
      acc[dateKey].totalProfit += profit.profitAmount;
      acc[dateKey].count += 1;
      return acc;
    }, {} as Record<string, { date: string; totalProfit: number; count: number }>);

    const chartData = Object.values(profitsByDate).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate summary statistics
    const totalProfits = allProfits.reduce((sum, profit) => sum + profit.profitAmount, 0);
    const activeInvestments = investments.filter(inv => inv.status === 'active').length;
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);

    res.json({
      summary: {
        totalProfits,
        totalInvestments: investments.length,
        activeInvestments,
        totalInvested,
        avgDailyProfit: allProfits.length > 0 ? totalProfits / allProfits.length : 0,
        profitDays: allProfits.length
      },
      chartData,
      recentProfits: allProfits.slice(0, 10) // Last 10 profit records
    });
  } catch (error) {
    console.error('Get profit dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
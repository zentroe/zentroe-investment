import { Request, Response } from 'express';
import { AuthenticatedAdminRequest } from '../middleware/adminAuth';
import { UserInvestment } from '../models/UserInvestment';
import { DailyProfit } from '../models/DailyProfit';
import {
  calculateDailyProfitsForAllInvestments,
  calculateDailyProfitForInvestment,
  manuallyAddProfit,
  getInvestmentProfitHistory,
  getUserTotalProfits
} from '../services/profitService';
import {
  pauseInvestment,
  resumeInvestment,
  completeInvestment
} from '../services/investmentService';
import { triggerDailyProfitCalculation } from '../cron/dailyProfitCron';

// ===== INVESTMENT MANAGEMENT =====

/**
 * Get all investments with pagination and filtering
 */
export const getAllInvestments = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
      userId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('🔍 getAllInvestments called with filters:', { status, userId, page, limit, sortBy, sortOrder });

    const filter: any = {};
    if (status) filter.status = status;
    if (userId) filter.user = userId;

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const investments = await UserInvestment.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('investmentPlan', 'name profitPercentage duration')
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await UserInvestment.countDocuments(filter);

    console.log('📊 Found investments:', {
      totalInDB: total,
      returnedCount: investments.length,
      investments: investments.map(inv => ({
        id: inv._id,
        user: inv.user ? `${(inv.user as any).firstName} ${(inv.user as any).lastName}` : 'No user',
        amount: inv.amount,
        status: inv.status,
        plan: inv.investmentPlan ? (inv.investmentPlan as any).name : 'No plan'
      }))
    });

    res.json({
      investments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get all investments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get investment details with profit history
 */
export const getInvestmentDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const investment = await UserInvestment.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('investmentPlan', 'name description profitPercentage duration')
      .lean();

    if (!investment) {
      res.status(404).json({ message: 'Investment not found' });
      return;
    }

    // Get profit history
    const profitHistory = await getInvestmentProfitHistory(id, 60); // Last 60 days

    // Calculate statistics
    const totalProfits = profitHistory.reduce((sum: number, profit: any) => sum + profit.profitAmount, 0);
    const avgDailyProfit = profitHistory.length > 0 ? totalProfits / profitHistory.length : 0;

    res.json({
      investment,
      profitHistory,
      statistics: {
        totalProfits,
        avgDailyProfit,
        profitDays: profitHistory.length,
        expectedTotalReturn: (investment as any).amount * ((investment as any).investmentPlan.profitPercentage / 100),
        daysRemaining: Math.max(0, Math.ceil((new Date((investment as any).endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      }
    });
  } catch (error) {
    console.error('Get investment details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Pause an investment
 */
export const pauseUserInvestment = async (req: AuthenticatedAdminRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.adminId;

    const investment = await pauseInvestment(id, adminId, reason);

    res.json({
      message: 'Investment paused successfully',
      investment
    });
  } catch (error) {
    console.error('Pause investment error:', error);
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to pause investment'
    });
  }
};

/**
 * Resume an investment
 */
export const resumeUserInvestment = async (req: AuthenticatedAdminRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.admin.adminId;

    const investment = await resumeInvestment(id, adminId);

    res.json({
      message: 'Investment resumed successfully',
      investment
    });
  } catch (error) {
    console.error('Resume investment error:', error);
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to resume investment'
    });
  }
};

/**
 * Complete an investment manually
 */
export const completeUserInvestment = async (req: AuthenticatedAdminRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = req.admin.adminId;

    const investment = await completeInvestment(id);

    res.json({
      message: 'Investment completed successfully',
      investment
    });
  } catch (error) {
    console.error('Complete investment error:', error);
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to complete investment'
    });
  }
};

// ===== PROFIT MANAGEMENT =====

/**
 * Get daily profit overview
 */
export const getDailyProfitOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Get daily profits for the specified date
    const dailyProfits = await DailyProfit.find({
      date: targetDate
    })
      .populate('userInvestment', 'amount status')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Calculate summary
    const totalProfitAmount = dailyProfits.reduce((sum, profit) => sum + profit.profitAmount, 0);
    const statusBreakdown = dailyProfits.reduce((acc, profit) => {
      acc[profit.status] = (acc[profit.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      date: targetDate.toISOString(),
      dailyProfits,
      summary: {
        totalProfitAmount,
        totalRecords: dailyProfits.length,
        statusBreakdown
      }
    });
  } catch (error) {
    console.error('Get daily profit overview error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Manually trigger daily profit calculation
 */
export const triggerManualProfitCalculation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();

    console.log(`🔄 Admin triggered manual profit calculation for ${targetDate.toDateString()}`);

    const summary = await triggerDailyProfitCalculation(targetDate);

    res.json({
      message: 'Manual profit calculation completed',
      summary
    });
  } catch (error) {
    console.error('Manual profit calculation error:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to calculate profits'
    });
  }
};

/**
 * Manually add/update profit for an investment
 */
export const manualProfitUpdate = async (req: AuthenticatedAdminRequest, res: Response): Promise<void> => {
  try {
    const { investmentId, profitAmount, date, reason } = req.body;
    const adminId = req.admin.adminId;

    if (!investmentId || profitAmount === undefined) {
      res.status(400).json({ message: 'Investment ID and profit amount are required' });
      return;
    }

    const targetDate = date ? new Date(date) : new Date();

    const result = await manuallyAddProfit(
      investmentId,
      profitAmount,
      targetDate,
      adminId,
      reason
    );

    if (result.status === 'error') {
      res.status(400).json({ message: result.message });
      return;
    }

    res.json({
      message: 'Profit updated successfully',
      result
    });
  } catch (error) {
    console.error('Manual profit update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Calculate profit for specific investment
 */
export const calculateInvestmentProfit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    const targetDate = date ? new Date(date) : new Date();

    const result = await calculateDailyProfitForInvestment(id, targetDate);

    res.json({
      message: 'Investment profit calculation completed',
      result
    });
  } catch (error) {
    console.error('Calculate investment profit error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ===== ANALYTICS & REPORTING =====

/**
 * Get investment analytics dashboard
 */
export const getInvestmentAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Investment status breakdown
    const statusBreakdown = await UserInvestment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalProfits: { $sum: '$totalProfitsEarned' }
        }
      }
    ]);

    // Recent investments
    const recentInvestments = await UserInvestment.find()
      .populate('user', 'firstName lastName email')
      .populate('investmentPlan', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Profit trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const profitTrends = await DailyProfit.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo },
          status: 'paid'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          totalProfit: { $sum: '$profitAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Top performing investments
    const topInvestments = await UserInvestment.find({ status: 'active' })
      .populate('user', 'firstName lastName')
      .populate('investmentPlan', 'name')
      .sort({ totalProfitsEarned: -1 })
      .limit(10)
      .lean();

    res.json({
      statusBreakdown,
      recentInvestments,
      profitTrends,
      topInvestments,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get investment analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
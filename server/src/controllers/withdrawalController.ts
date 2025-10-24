import { Request, Response } from 'express';
import { WithdrawalService } from '../services/withdrawalService';
import { AuthenticatedRequest } from '../types/CustomRequest';
import { AuthenticatedAdminRequest } from '../middleware/adminAuth';
import { Withdrawal } from '../models/Withdrawal';
import { User } from '../models/User';
import { sendWithdrawalRequestedEmail, sendWithdrawalProcessedEmail } from '../utils/emailHandler';
import { ActivityHistory } from '../models/ActivityHistory';

/**
 * Get user's investments with withdrawal eligibility
 */
export const getUserInvestmentsForWithdrawal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const investments = await WithdrawalService.getUserInvestmentsWithWithdrawalInfo(userId);

    res.status(200).json({
      success: true,
      data: investments
    });
  } catch (error) {
    console.error('Get user investments for withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investments',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Check withdrawal eligibility for specific investment
 */
export const checkWithdrawalEligibility = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { userInvestmentId } = req.params;

    const eligibility = await WithdrawalService.checkWithdrawalEligibility(userId, userInvestmentId);

    res.status(200).json({
      success: true,
      data: eligibility
    });
  } catch (error) {
    console.error('Check withdrawal eligibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check withdrawal eligibility',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create withdrawal request
 */
export const createWithdrawalRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const {
      userInvestmentId,
      amount,
      type,
      paymentMethod,
      paymentDetails,
      reason
    } = req.body;

    // Validation
    if (!userInvestmentId || !amount || !type || !paymentMethod) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: userInvestmentId, amount, type, paymentMethod'
      });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
      return;
    }

    if (!['profits_only', 'full_withdrawal', 'partial_principal'].includes(type)) {
      res.status(400).json({
        success: false,
        message: 'Invalid withdrawal type'
      });
      return;
    }

    if (!['bank_transfer', 'crypto', 'check'].includes(paymentMethod)) {
      res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
      return;
    }

    // Validate payment details based on method
    if (!paymentDetails) {
      res.status(400).json({
        success: false,
        message: 'Payment details are required'
      });
      return;
    }

    if (paymentMethod === 'bank_transfer') {
      const { bankDetails } = paymentDetails;
      if (!bankDetails || !bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.routingNumber || !bankDetails.bankName) {
        res.status(400).json({
          success: false,
          message: 'Bank details are incomplete'
        });
        return;
      }
    } else if (paymentMethod === 'crypto') {
      const { cryptoDetails } = paymentDetails;
      if (!cryptoDetails || !cryptoDetails.walletAddress || !cryptoDetails.network || !cryptoDetails.currency) {
        res.status(400).json({
          success: false,
          message: 'Crypto details are incomplete'
        });
        return;
      }
    } else if (paymentMethod === 'check') {
      const { checkDetails } = paymentDetails;
      if (!checkDetails || !checkDetails.mailingAddress) {
        res.status(400).json({
          success: false,
          message: 'Check mailing address is required'
        });
        return;
      }
    }

    const withdrawal = await WithdrawalService.createWithdrawalRequest({
      userId,
      userInvestmentId,
      amount: parseFloat(amount),
      type,
      paymentMethod,
      paymentDetails,
      reason
    });

    // Send withdrawal requested email
    try {
      const user = await User.findById(userId);
      if (user) {
        const userName = `${user.firstName} ${user.lastName}`;
        await sendWithdrawalRequestedEmail(user.email, userName, parseFloat(amount));
        console.log(`✅ Withdrawal requested email sent to ${user.email}`);
      }
    } catch (emailError) {
      console.error('❌ Error sending withdrawal requested email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Withdrawal request created successfully',
      data: withdrawal
    });
  } catch (error) {
    console.error('Create withdrawal request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create withdrawal request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get user withdrawal history
 */
export const getUserWithdrawalHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await WithdrawalService.getUserWithdrawalHistory(userId, page, limit);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get user withdrawal history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawal history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Cancel pending withdrawal request
 */
export const cancelWithdrawalRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { withdrawalId } = req.params;

    const { Withdrawal } = await import('../models/Withdrawal');

    const withdrawal = await Withdrawal.findOne({
      _id: withdrawalId,
      user: userId,
      status: 'pending'
    });

    if (!withdrawal) {
      res.status(404).json({
        success: false,
        message: 'Withdrawal request not found or cannot be cancelled'
      });
      return;
    }

    withdrawal.status = 'cancelled';
    await withdrawal.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal request cancelled successfully',
      data: withdrawal
    });
  } catch (error) {
    console.error('Cancel withdrawal request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel withdrawal request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Admin Controllers

/**
 * Get all withdrawal requests (Admin)
 */
export const getAllWithdrawalRequests = async (req: AuthenticatedAdminRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const userId = req.query.userId as string;

    const result = await WithdrawalService.getAllWithdrawalRequests(page, limit, status, userId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get all withdrawal requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawal requests',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Review withdrawal request (Admin)
 */
export const reviewWithdrawalRequest = async (req: AuthenticatedAdminRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.admin.adminId;
    const { withdrawalId } = req.params;
    const { action, adminNotes, rejectionReason } = req.body;

    if (!action || !['approve', 'reject'].includes(action)) {
      res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "approve" or "reject"'
      });
      return;
    }

    if (action === 'reject' && !rejectionReason) {
      res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting withdrawal'
      });
      return;
    }

    const withdrawal = await WithdrawalService.reviewWithdrawal(
      withdrawalId,
      adminId,
      action,
      adminNotes,
      rejectionReason
    );

    res.status(200).json({
      success: true,
      message: `Withdrawal request ${action}d successfully`,
      data: withdrawal
    });
  } catch (error) {
    console.error('Review withdrawal request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review withdrawal request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Process approved withdrawal (Admin)
 */
export const processWithdrawal = async (req: AuthenticatedAdminRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.admin.adminId;
    const { withdrawalId } = req.params;
    const { transactionId } = req.body;

    if (!transactionId) {
      res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
      return;
    }

    const withdrawal = await WithdrawalService.processWithdrawal(
      withdrawalId,
      transactionId,
      adminId
    );

    // Send withdrawal processed email
    try {
      const fullWithdrawal = await Withdrawal.findById(withdrawalId).populate('user');
      if (fullWithdrawal && fullWithdrawal.user) {
        const user = fullWithdrawal.user as any;
        const userName = `${user.firstName} ${user.lastName}`;
        await sendWithdrawalProcessedEmail(
          user.email,
          userName,
          fullWithdrawal.amount,
          transactionId
        );
        console.log(`✅ Withdrawal processed email sent to ${user.email}`);
      }
    } catch (emailError) {
      console.error('❌ Error sending withdrawal processed email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Withdrawal processed successfully',
      data: withdrawal
    });
  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get withdrawal statistics (Admin)
 */
export const getWithdrawalStatistics = async (req: AuthenticatedAdminRequest, res: Response): Promise<void> => {
  try {
    const { Withdrawal } = await import('../models/Withdrawal');

    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      completedRequests,
      totalWithdrawnAmount,
      thisMonthRequests
    ] = await Promise.all([
      Withdrawal.countDocuments(),
      Withdrawal.countDocuments({ status: 'pending' }),
      Withdrawal.countDocuments({ status: 'approved' }),
      Withdrawal.countDocuments({ status: 'rejected' }),
      Withdrawal.countDocuments({ status: 'completed' }),
      Withdrawal.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$netAmount' } } }
      ]),
      Withdrawal.countDocuments({
        requestedAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      })
    ]);

    const statistics = {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      completedRequests,
      totalWithdrawnAmount: totalWithdrawnAmount[0]?.total || 0,
      thisMonthRequests,
      processingRate: totalRequests > 0 ? ((completedRequests / totalRequests) * 100).toFixed(2) : '0'
    };

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Get withdrawal statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawal statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update withdrawal (Admin)
 */
export const updateWithdrawal = async (req: AuthenticatedAdminRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.admin.adminId;
    const { withdrawalId } = req.params;
    const { amount, requestedAt } = req.body;

    const { Withdrawal } = await import('../models/Withdrawal');

    const withdrawal = await Withdrawal.findById(withdrawalId);

    if (!withdrawal) {
      res.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
      return;
    }

    // Update amount if provided
    if (amount !== undefined) {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Amount must be a positive number'
        });
        return;
      }

      // Recalculate fees and net amount based on new amount
      const feePercentage = 0.02; // 2% fee
      const fees = numericAmount * feePercentage;
      const netAmount = numericAmount - fees;

      withdrawal.amount = numericAmount;
      withdrawal.fees = fees;
      withdrawal.netAmount = netAmount;
    }

    // Update requested date if provided
    if (requestedAt !== undefined) {
      const newDate = new Date(requestedAt);
      if (isNaN(newDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
        return;
      }
      withdrawal.requestedAt = newDate;
    }

    await withdrawal.save();

    // Log activity
    try {
      await ActivityHistory.create({
        user: withdrawal.user,
        action: 'withdrawal_updated',
        description: `Withdrawal ${withdrawalId} updated by admin`,
        performedBy: adminId,
        metadata: {
          withdrawalId,
          newAmount: amount,
          newRequestedAt: requestedAt
        }
      });
    } catch (activityError) {
      console.error('Error logging activity:', activityError);
    }

    const populatedWithdrawal = await Withdrawal.findById(withdrawalId)
      .populate('user', 'firstName lastName email')
      .populate('userInvestment')
      .populate('reviewedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Withdrawal updated successfully',
      data: populatedWithdrawal
    });
  } catch (error) {
    console.error('Update withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update withdrawal',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete withdrawal (Admin)
 */
export const deleteWithdrawal = async (req: AuthenticatedAdminRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.admin.adminId;
    const { withdrawalId } = req.params;

    const { Withdrawal } = await import('../models/Withdrawal');

    const withdrawal = await Withdrawal.findById(withdrawalId);

    if (!withdrawal) {
      res.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
      return;
    }

    // Store info for activity log before deletion
    const withdrawalUserId = withdrawal.user;
    const withdrawalAmount = withdrawal.amount;
    const withdrawalStatus = withdrawal.status;

    await Withdrawal.findByIdAndDelete(withdrawalId);

    // Log activity
    try {
      await ActivityHistory.create({
        user: withdrawalUserId,
        action: 'withdrawal_deleted',
        description: `Withdrawal ${withdrawalId} deleted by admin`,
        performedBy: adminId,
        metadata: {
          withdrawalId,
          amount: withdrawalAmount,
          status: withdrawalStatus
        }
      });
    } catch (activityError) {
      console.error('Error logging activity:', activityError);
    }

    res.status(200).json({
      success: true,
      message: 'Withdrawal deleted successfully'
    });
  } catch (error) {
    console.error('Delete withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete withdrawal',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
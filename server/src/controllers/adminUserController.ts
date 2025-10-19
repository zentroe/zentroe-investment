import { Request, Response } from 'express';
import { AuthenticatedAdminRequest } from '../types/CustomRequest';
import { User } from '../models/User';
import { ActivityHistory } from '../models/ActivityHistory';
import { generateUserActivity } from '../services/activityGenerator';
import Deposit from '../models/Deposit';
import { Withdrawal } from '../models/Withdrawal';
import { UserInvestment } from '../models/UserInvestment';
import { DailyProfit } from '../models/DailyProfit';
import { Referral, ReferralPoints, PointsTransaction } from '../models/Referral';
import { KYC } from '../models/KYC';
import BankAccount from '../models/BankAccount';
import CryptoWallet from '../models/CryptoWallet';
import { CardPayment } from '../models/CardPayment';
import OnboardingProgress from '../models/OnboardingProgress';
import bcrypt from 'bcryptjs';

// Get complete user details
export const getUserDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('selectedInvestmentPlan')
      .populate('referredBy', 'firstName lastName email');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user details (complete update)
export const updateUserDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // If password is being updated, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Handle nested objects properly
    if (updateData.address) {
      updateData.address = {
        ...updateData.address
      };
    }

    if (updateData.kyc) {
      updateData.kyc = {
        ...updateData.kyc
      };
    }

    if (updateData.referralStats) {
      updateData.referralStats = {
        ...updateData.referralStats
      };
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('selectedInvestmentPlan');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Generate activity history
export const generateActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { years, activityConfig } = req.body;
    const adminId = (req as any).user?.id;

    if (!years || years < 1 || years > 5) {
      res.status(400).json({ message: 'Years must be between 1 and 5' });
      return;
    }

    const result = await generateUserActivity({
      userId,
      years,
      adminId,
      activityConfig
    });

    res.json({
      message: 'Activity history generated successfully',
      ...result
    });
  } catch (error) {
    console.error('Generate activity error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user activity history
export const getUserActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50, activityType, startDate, endDate } = req.query;

    const query: any = { userId };

    if (activityType) {
      query.activityType = activityType;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [activities, total] = await Promise.all([
      ActivityHistory.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('investmentPlanId', 'name')
        .populate('referredUserId', 'firstName lastName email'),
      ActivityHistory.countDocuments(query)
    ]);

    res.json({
      activities,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create single activity
export const createActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const activityData = req.body;
    const adminId = (req as any).user?.id;

    const activity = new ActivityHistory({
      ...activityData,
      userId,
      editedBy: adminId,
      editedAt: new Date()
    });

    await activity.save();

    res.status(201).json({
      message: 'Activity created successfully',
      activity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update activity
export const updateActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { activityId } = req.params;
    const updateData = req.body;
    const adminId = (req as any).user?.id;

    // First, get the existing activity to check its type and if it's generated
    const existingActivity = await ActivityHistory.findById(activityId);
    if (!existingActivity) {
      res.status(404).json({ message: 'Activity not found' });
      return;
    }

    // If the activity is generated, we need to update the corresponding real model
    if (existingActivity.isGenerated && existingActivity.transactionId) {
      const activityType = updateData.activityType || existingActivity.activityType;

      switch (activityType) {
        case 'deposit': {
          // Find and update the real Deposit record
          const depositId = existingActivity.transactionId.replace('TXN-DEP-', '');
          const existingDeposit = await Deposit.findById(depositId);
          await Deposit.findByIdAndUpdate(depositId, {
            amount: updateData.amount || existingActivity.amount,
            paymentMethod: updateData.paymentMethod || existingActivity.paymentMethod,
            status: updateData.status || existingActivity.status,
            processedAt: updateData.date || existingActivity.date,
            adminNotes: `${existingDeposit?.adminNotes || 'Deposit processed successfully'} (Edited by admin)`
          });
          break;
        }

        case 'investment': {
          // Find and update the real UserInvestment record
          const investmentId = existingActivity.transactionId.replace('TXN-INV-', '');
          await UserInvestment.findByIdAndUpdate(investmentId, {
            amount: updateData.amount || existingActivity.amount,
            startDate: updateData.date || existingActivity.date,
            status: updateData.status || existingActivity.status
          });
          break;
        }

        case 'withdrawal': {
          // Find and update the real Withdrawal record
          const withdrawalId = existingActivity.transactionId.replace('TXN-WTH-', '');
          await Withdrawal.findByIdAndUpdate(withdrawalId, {
            amount: updateData.amount || existingActivity.amount,
            status: updateData.status || existingActivity.status,
            processedAt: updateData.date || existingActivity.date,
            adminNotes: `Withdrawal processed successfully (Edited by admin)`
          });
          break;
        }

        case 'return':
        case 'dividend': {
          // For returns/dividends, we need to update DailyProfit records
          // This is more complex as we need to find the profit by amount and date
          // We'll update the activity history but note that profit records may be harder to match
          console.log('⚠️  Return/dividend editing: ActivityHistory updated, but DailyProfit records remain unchanged for data integrity');
          break;
        }

        default:
          // For other types (login, kyc_update, referral, etc.), just update the activity history
          break;
      }
    }

    // Update the ActivityHistory record
    const activity = await ActivityHistory.findByIdAndUpdate(
      activityId,
      {
        ...updateData,
        editedBy: adminId,
        editedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!activity) {
      res.status(404).json({ message: 'Activity not found' });
      return;
    }

    res.json({
      message: 'Activity updated successfully (both activity history and underlying records)',
      activity
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete activity
export const deleteActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { activityId } = req.params;

    const activity = await ActivityHistory.findByIdAndDelete(activityId);

    if (!activity) {
      res.status(404).json({ message: 'Activity not found' });
      return;
    }

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete all generated activities for a user
export const deleteGeneratedActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // First, find all generated investments to get their IDs
    const generatedInvestments = await UserInvestment.find({
      user: userId,
      adminNotes: /Auto-generated demo data/
    }).select('_id');

    const investmentIds = generatedInvestments.map(inv => inv._id);

    // Delete all generated records across all collections
    const [
      activityHistoryResult,
      depositsResult,
      withdrawalsResult,
      investmentsResult,
      dailyProfitsResult,
      referralsResult
    ] = await Promise.all([
      // Delete ActivityHistory records with isGenerated flag
      ActivityHistory.deleteMany({
        userId,
        isGenerated: true
      }),

      // Delete Deposit records - check both old and new formats
      Deposit.deleteMany({
        user: userId,
        $or: [
          { adminNotes: /Auto-generated demo data/ },
          { adminNotes: 'Deposit processed successfully' }
        ]
      }),

      // Delete Withdrawal records - check both old and new formats
      Withdrawal.deleteMany({
        user: userId,
        $or: [
          { adminNotes: /Auto-generated demo data/ },
          { adminNotes: 'Withdrawal processed successfully' }
        ]
      }),

      // Delete UserInvestment records - check both old and new formats
      UserInvestment.deleteMany({
        user: userId,
        $or: [
          { adminNotes: /Auto-generated demo data/ },
          { adminNotes: 'Investment Created' }
        ]
      }),

      // Delete DailyProfit records for generated investments
      DailyProfit.deleteMany({
        userInvestment: { $in: investmentIds }
      }),

      // Delete Referral records with demo-generated campaign
      Referral.deleteMany({
        referrer: userId,
        'metadata.campaign': 'demo-generated'
      })
    ]);

    // Reset user's referral stats and financial data to defaults
    await User.findByIdAndUpdate(userId, {
      walletBalance: 0,
      totalInvested: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      'referralStats.totalReferrals': 0,
      'referralStats.qualifiedReferrals': 0,
      'referralStats.totalPointsEarned': 0,
      'referralStats.currentTier': 'bronze'
    });

    // Reset or delete ReferralPoints record
    await ReferralPoints.deleteOne({ user: userId });

    res.json({
      message: 'All generated data deleted successfully',
      deletedCount: {
        activityHistory: activityHistoryResult.deletedCount,
        deposits: depositsResult.deletedCount,
        withdrawals: withdrawalsResult.deletedCount,
        investments: investmentsResult.deletedCount,
        dailyProfits: dailyProfitsResult.deletedCount,
        referrals: referralsResult.deletedCount,
        total: activityHistoryResult.deletedCount +
          depositsResult.deletedCount +
          withdrawalsResult.deletedCount +
          investmentsResult.deletedCount +
          dailyProfitsResult.deletedCount +
          referralsResult.deletedCount
      }
    });
  } catch (error) {
    console.error('Delete generated activities error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get activity statistics
export const getActivityStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const stats = await ActivityHistory.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const formattedStats = stats.reduce((acc: any, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount || 0
      };
      return acc;
    }, {});

    res.json({ stats: formattedStats });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user and all associated data
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Prevent deletion of admin users
    if (user.role === 'admin') {
      res.status(403).json({ message: 'Cannot delete admin users' });
      return;
    }

    // Find all user investments to get their IDs (for DailyProfit deletion)
    const userInvestments = await UserInvestment.find({ user: userId }).select('_id');
    const investmentIds = userInvestments.map(inv => inv._id);

    // Delete all user-related data from all collections
    const deletionResults = await Promise.all([
      // 1. User's activity history
      ActivityHistory.deleteMany({ userId }),

      // 2. User's deposits
      Deposit.deleteMany({ user: userId }),

      // 3. User's withdrawals
      Withdrawal.deleteMany({ user: userId }),

      // 4. User's investments
      UserInvestment.deleteMany({ user: userId }),

      // 5. Daily profits for user's investments
      DailyProfit.deleteMany({ userInvestment: { $in: investmentIds } }),

      // 6. Referrals where user is the referrer
      Referral.deleteMany({ referrer: userId }),

      // 7. Referrals where user is the referred
      Referral.deleteMany({ referred: userId }),

      // 8. User's referral points
      ReferralPoints.deleteMany({ user: userId }),

      // 9. User's points transactions
      PointsTransaction.deleteMany({ user: userId }),

      // 10. User's KYC documents
      KYC.deleteMany({ user: userId }),

      // 11. User's bank accounts
      BankAccount.deleteMany({ user: userId }),

      // 12. User's crypto wallets
      CryptoWallet.deleteMany({ user: userId }),

      // 13. User's card payments
      CardPayment.deleteMany({ user: userId }),

      // 14. User's onboarding progress
      OnboardingProgress.deleteMany({ userId })
    ]);

    // Update other users who were referred by this user (set referredBy to null)
    await User.updateMany(
      { referredBy: userId },
      { $unset: { referredBy: "" } }
    );

    // Finally, delete the user account
    await User.findByIdAndDelete(userId);

    // Calculate total records deleted
    const totalDeleted = deletionResults.reduce((sum, result) => sum + result.deletedCount, 0);

    res.json({
      success: true,
      message: 'User and all associated data deleted successfully',
      deletedRecords: {
        activityHistory: deletionResults[0].deletedCount,
        deposits: deletionResults[1].deletedCount,
        withdrawals: deletionResults[2].deletedCount,
        investments: deletionResults[3].deletedCount,
        dailyProfits: deletionResults[4].deletedCount,
        referralsAsReferrer: deletionResults[5].deletedCount,
        referralsAsReferred: deletionResults[6].deletedCount,
        referralPoints: deletionResults[7].deletedCount,
        pointsTransactions: deletionResults[8].deletedCount,
        kycDocuments: deletionResults[9].deletedCount,
        bankAccounts: deletionResults[10].deletedCount,
        cryptoWallets: deletionResults[11].deletedCount,
        cardPayments: deletionResults[12].deletedCount,
        onboardingProgress: deletionResults[13].deletedCount,
        user: 1,
        total: totalDeleted + 1 // +1 for user account
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new user (admin-created)
export const createUser = async (req: AuthenticatedAdminRequest, res: Response): Promise<void> => {
  try {
    const userData = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Generate unique referral code
    const generateReferralCode = (email: string): string => {
      const hash = require('crypto').createHash('sha256').update(email + Date.now()).digest('hex');
      return hash.substring(0, 8).toUpperCase();
    };

    // Prepare user data
    const newUserData: any = {
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      role: 'user', // Always create as regular user

      // Basic Info
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      dateOfBirth: userData.dateOfBirth,
      countryOfResidence: userData.countryOfResidence,
      countryOfCitizenship: userData.countryOfCitizenship,

      // Address
      address: userData.address || {},

      // Account Setup
      accountType: userData.accountType,
      accountSubType: userData.accountSubType || undefined,
      isActive: true, // Always start as active

      // Financial Profile
      socialSecurityNumber: userData.socialSecurityNumber || undefined,
      ssn: userData.ssn || undefined,
      annualIncome: userData.annualIncome || undefined,
      netWorth: userData.netWorth || undefined,
      initialInvestmentAmount: userData.initialInvestmentAmount || undefined,
      investmentExperience: userData.investmentExperience || undefined,
      investmentGoal: userData.investmentGoal || undefined,
      riskTolerance: userData.riskTolerance || undefined,
      investmentTimeHorizon: userData.investmentTimeHorizon || undefined,
      portfolioPriority: userData.portfolioPriority || undefined,

      // Investment Preferences (optional)
      selectedInvestmentPlan: userData.selectedInvestmentPlan || undefined,
      recommendedPortfolio: userData.recommendedPortfolio || undefined,
      recurringInvestment: userData.recurringInvestment || false,
      recurringFrequency: userData.recurringFrequency || undefined,
      recurringDay: userData.recurringDay || undefined,

      // Verification (auto-verified by admin)
      emailVerified: true,
      phoneVerified: true,

      // Referral
      referralCode: generateReferralCode(userData.email),
      referredBy: userData.referredBy || undefined,
      referralSource: userData.referralSource || undefined,

      // Onboarding (mark as completed)
      hasCompletedOnboarding: true,

      // KYC Status
      kyc: {
        status: userData.kycStatus || 'none',
        submittedAt: userData.kycStatus === 'approved' || userData.kycStatus === 'pending' ? new Date() : null,
        reviewedAt: userData.kycStatus === 'approved' || userData.kycStatus === 'rejected' ? new Date() : null,
        documents: []
      },

      // Metadata
      adminCreated: true,
      createdBy: req.admin?.adminId,
      notes: userData.notes,

      // Timestamps (allow backdating)
      createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
      updatedAt: new Date()
    };

    // Create user
    const user = await User.create(newUserData);

    // Create onboarding progress record (marked as complete)
    await OnboardingProgress.create({
      userId: user._id,
      currentStep: 'completed',
      completedSteps: [
        'account_type',
        'personal_info',
        'financial_profile',
        'investment_selection',
        'kyc_verification',
        'account_funding',
        'review_submit'
      ],
      personalInfoCompleted: true,
      accountTypeCompleted: true,
      financialProfileCompleted: true,
      investmentSelectionCompleted: true,
      kycVerificationCompleted: userData.kycStatus === 'approved',
      accountFundingCompleted: false,
      reviewSubmitCompleted: true,
      completionPercentage: 100,
      lastAccessedAt: new Date()
    });

    // Create referral points record
    await ReferralPoints.create({
      user: user._id,
      totalPoints: 0,
      availablePoints: 0,
      tier: 'bronze'
    });

    // Log activity
    await ActivityHistory.create({
      userId: user._id,
      activityType: 'account_created',
      date: newUserData.createdAt,
      description: 'Account created by administrator',
      status: 'completed',
      metadata: {
        createdBy: req.admin?.adminId || 'admin',
        adminCreated: true
      }
    });

    // Populate and return user
    const populatedUser = await User.findById(user._id)
      .populate('selectedInvestmentPlan')
      .populate('referredBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: populatedUser
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

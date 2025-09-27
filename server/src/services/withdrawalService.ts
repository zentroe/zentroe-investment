import { UserInvestment } from '../models/UserInvestment';
import { Withdrawal } from '../models/Withdrawal';
import { User } from '../models/User';
import mongoose from 'mongoose';

export interface WithdrawalRequest {
  userId: string;
  userInvestmentId: string;
  amount: number;
  type: 'profits_only' | 'full_withdrawal' | 'partial_principal';
  paymentMethod: 'bank_transfer' | 'crypto' | 'check';
  paymentDetails: {
    bankDetails?: {
      accountName: string;
      accountNumber: string;
      routingNumber: string;
      bankName: string;
      swiftCode?: string;
    };
    cryptoDetails?: {
      walletAddress: string;
      network: string;
      currency: string;
    };
    checkDetails?: {
      mailingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
    };
  };
  reason?: string;
}

export interface WithdrawalEligibility {
  canWithdraw: boolean;
  availableAmount: number;
  maxProfitsWithdraw: number;
  maxPrincipalWithdraw: number;
  errors: string[];
  investmentStatus: string;
  daysUntilFullWithdrawal: number;
}

export class WithdrawalService {
  /**
   * Check if user can withdraw from specific investment
   */
  static async checkWithdrawalEligibility(
    userId: string,
    userInvestmentId: string
  ): Promise<WithdrawalEligibility> {
    const userInvestment = await UserInvestment.findOne({
      _id: userInvestmentId,
      user: userId
    }).populate('investmentPlan');

    if (!userInvestment) {
      return {
        canWithdraw: false,
        availableAmount: 0,
        maxProfitsWithdraw: 0,
        maxPrincipalWithdraw: 0,
        errors: ['Investment not found'],
        investmentStatus: 'not_found',
        daysUntilFullWithdrawal: 0
      };
    }

    const now = new Date();
    const sevenDaysAfterStart = new Date(userInvestment.startDate);
    sevenDaysAfterStart.setDate(sevenDaysAfterStart.getDate() + 7);

    const errors: string[] = [];
    let canWithdraw = false;
    let availableAmount = 0;
    let maxProfitsWithdraw = 0;
    let maxPrincipalWithdraw = 0;

    // Check if investment is active
    if (userInvestment.status !== 'active' && userInvestment.status !== 'completed') {
      errors.push(`Investment is ${userInvestment.status} and not eligible for withdrawal`);
    }

    // Calculate days until full withdrawal is allowed
    const daysUntilFullWithdrawal = userInvestment.status === 'completed'
      ? 0
      : Math.max(0, Math.ceil((userInvestment.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    // Check withdrawal eligibility based on time
    if (now >= sevenDaysAfterStart) {
      canWithdraw = true;

      // Calculate available profits for withdrawal
      maxProfitsWithdraw = Math.max(0, userInvestment.totalProfitsEarned - userInvestment.profitsWithdrawn);

      // If investment is completed, allow full withdrawal
      if (userInvestment.status === 'completed' || now >= userInvestment.endDate) {
        maxPrincipalWithdraw = Math.max(0, userInvestment.amount - userInvestment.principalWithdrawn);
        availableAmount = maxProfitsWithdraw + maxPrincipalWithdraw;
      } else {
        // During active period, only profits can be withdrawn
        availableAmount = maxProfitsWithdraw;
        if (maxProfitsWithdraw === 0) {
          errors.push('No profits available for withdrawal yet');
        }
      }
    } else {
      const daysUntilEligible = Math.ceil((sevenDaysAfterStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      errors.push(`Withdrawal not allowed until 7 days after investment start. ${daysUntilEligible} days remaining.`);
    }

    return {
      canWithdraw,
      availableAmount,
      maxProfitsWithdraw,
      maxPrincipalWithdraw,
      errors,
      investmentStatus: userInvestment.status,
      daysUntilFullWithdrawal
    };
  }

  /**
   * Get all user investments with withdrawal status
   */
  static async getUserInvestmentsWithWithdrawalInfo(userId: string) {
    const userInvestments = await UserInvestment.find({
      user: userId,
      status: { $in: ['active', 'completed'] }
    }).populate('investmentPlan').lean();

    const investmentsWithWithdrawalInfo = await Promise.all(
      userInvestments.map(async (investment) => {
        const eligibility = await this.checkWithdrawalEligibility(userId, investment._id.toString());
        return {
          ...investment,
          withdrawalEligibility: eligibility
        };
      })
    );

    return investmentsWithWithdrawalInfo;
  }

  /**
   * Create a new withdrawal request
   */
  static async createWithdrawalRequest(requestData: WithdrawalRequest) {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // Verify user exists
        const user = await User.findById(requestData.userId).session(session);
        if (!user) {
          throw new Error('User not found');
        }

        // Check withdrawal eligibility
        const eligibility = await this.checkWithdrawalEligibility(
          requestData.userId,
          requestData.userInvestmentId
        );

        if (!eligibility.canWithdraw) {
          throw new Error(`Withdrawal not allowed: ${eligibility.errors.join(', ')}`);
        }

        if (requestData.amount > eligibility.availableAmount) {
          throw new Error(`Requested amount (${requestData.amount}) exceeds available amount (${eligibility.availableAmount})`);
        }

        // Get the investment
        const userInvestment = await UserInvestment.findOne({
          _id: requestData.userInvestmentId,
          user: requestData.userId
        }).session(session);

        if (!userInvestment) {
          throw new Error('Investment not found');
        }

        // Calculate breakdown of principal vs profit withdrawal
        let profitAmount = 0;
        let principalAmount = 0;
        let fees = 0;

        if (requestData.type === 'profits_only') {
          profitAmount = Math.min(requestData.amount, eligibility.maxProfitsWithdraw);
          if (profitAmount !== requestData.amount) {
            throw new Error('Cannot withdraw more profits than available');
          }
        } else if (requestData.type === 'full_withdrawal') {
          if (userInvestment.status !== 'completed') {
            throw new Error('Full withdrawal only allowed for completed investments');
          }
          profitAmount = eligibility.maxProfitsWithdraw;
          principalAmount = eligibility.maxPrincipalWithdraw;
        } else if (requestData.type === 'partial_principal') {
          if (userInvestment.status !== 'completed') {
            throw new Error('Principal withdrawal only allowed for completed investments');
          }
          // For partial principal, user can specify the breakdown
          const remainingAmount = requestData.amount;
          profitAmount = Math.min(remainingAmount, eligibility.maxProfitsWithdraw);
          principalAmount = Math.min(remainingAmount - profitAmount, eligibility.maxPrincipalWithdraw);
        }

        // Calculate fees (could be a percentage or flat fee)
        // For now, let's assume 1% fee for crypto, 0.5% for bank transfer, $10 for check
        switch (requestData.paymentMethod) {
          case 'crypto':
            fees = requestData.amount * 0.01; // 1%
            break;
          case 'bank_transfer':
            fees = requestData.amount * 0.005; // 0.5%
            break;
          case 'check':
            fees = 10; // $10 flat fee
            break;
        }

        const netAmount = requestData.amount - fees;

        // Create withdrawal request
        const withdrawal = new Withdrawal({
          user: requestData.userId,
          userInvestment: requestData.userInvestmentId,
          amount: requestData.amount,
          type: requestData.type,
          paymentMethod: requestData.paymentMethod,
          paymentDetails: requestData.paymentDetails,
          principalAmount,
          profitAmount,
          fees,
          netAmount,
          reason: requestData.reason,
          status: 'pending'
        });

        await withdrawal.save({ session });

        return withdrawal;
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get user's withdrawal history
   */
  static async getUserWithdrawalHistory(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find({ user: userId })
        .populate('userInvestment', 'amount startDate endDate status')
        .populate('reviewedBy', 'firstName lastName email')
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Withdrawal.countDocuments({ user: userId })
    ]);

    return {
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get all withdrawal requests for admin
   */
  static async getAllWithdrawalRequests(
    page = 1,
    limit = 20,
    status?: string,
    userId?: string
  ) {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (status) filter.status = status;
    if (userId) filter.user = userId;

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find(filter)
        .populate('user', 'firstName lastName email')
        .populate('userInvestment', 'amount startDate endDate status')
        .populate('reviewedBy', 'firstName lastName email')
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Withdrawal.countDocuments(filter)
    ]);

    return {
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Admin: Review withdrawal request
   */
  static async reviewWithdrawal(
    withdrawalId: string,
    adminId: string,
    action: 'approve' | 'reject',
    adminNotes?: string,
    rejectionReason?: string
  ) {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const withdrawal = await Withdrawal.findById(withdrawalId).session(session);

        if (!withdrawal) {
          throw new Error('Withdrawal request not found');
        }

        if (withdrawal.status !== 'pending') {
          throw new Error(`Withdrawal is already ${withdrawal.status}`);
        }

        withdrawal.reviewedBy = new mongoose.Types.ObjectId(adminId);
        withdrawal.reviewedAt = new Date();
        withdrawal.adminNotes = adminNotes;

        if (action === 'approve') {
          withdrawal.status = 'approved';
        } else {
          withdrawal.status = 'rejected';
          withdrawal.rejectionReason = rejectionReason;
        }

        await withdrawal.save({ session });
        return withdrawal;
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Process approved withdrawal (mark as completed)
   */
  static async processWithdrawal(
    withdrawalId: string,
    transactionId: string,
    adminId: string
  ) {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const withdrawal = await Withdrawal.findById(withdrawalId).session(session);

        if (!withdrawal) {
          throw new Error('Withdrawal request not found');
        }

        if (withdrawal.status !== 'approved') {
          throw new Error('Can only process approved withdrawals');
        }

        // Update withdrawal
        withdrawal.status = 'completed';
        withdrawal.processedAt = new Date();
        withdrawal.transactionId = transactionId;

        await withdrawal.save({ session });

        // Update user investment
        const userInvestment = await UserInvestment.findById(withdrawal.userInvestment).session(session);
        if (userInvestment) {
          userInvestment.totalWithdrawn += withdrawal.amount;
          userInvestment.principalWithdrawn += withdrawal.principalAmount;
          userInvestment.profitsWithdrawn += withdrawal.profitAmount;
          await userInvestment.save({ session });
        }

        return withdrawal;
      });
    } finally {
      await session.endSession();
    }
  }
}

export default WithdrawalService;
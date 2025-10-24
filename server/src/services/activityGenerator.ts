import { ActivityHistory } from '../models/ActivityHistory';
import { User } from '../models/User';
import Deposit from '../models/Deposit';
import { Withdrawal } from '../models/Withdrawal';
import { UserInvestment } from '../models/UserInvestment';
import { DailyProfit } from '../models/DailyProfit';
import { Referral, ReferralPoints, REFERRAL_TIERS } from '../models/Referral';
import { InvestmentPlan } from '../models/InvestmentPlan';
import mongoose from 'mongoose';

interface ActivityConfig {
  deposits?: { enabled: boolean; count: number; minAmount: number; maxAmount: number };
  investments?: { enabled: boolean; count: number };
  withdrawals?: { enabled: boolean; count: number };
  returns?: { enabled: boolean; count: number };
  referrals?: { enabled: boolean; targetTier: string };
  logins?: { enabled: boolean; count: number };
  kycUpdates?: { enabled: boolean };
}

interface GenerateActivityOptions {
  userId: string;
  years: number;
  adminId: string;
  activityConfig?: ActivityConfig;
}

// Helper function to generate random date within range
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate random amount within range (rounded to tens)
const randomAmount = (min: number, max: number): number => {
  const amount = Math.random() * (max - min) + min;
  // Round to nearest 10
  return Math.round(amount / 10) * 10;
};

// Portfolio types and investment plans
const portfolioTypes = ['Conservative Growth', 'Balanced Portfolio', 'Aggressive Growth', 'Income Focus', 'Diversified'];
const investmentPlans = ['Starter Plan', 'Growth Plan', 'Premium Plan', 'Elite Plan', 'Enterprise Plan'];

export const generateUserActivity = async (options: GenerateActivityOptions) => {
  const { userId, years, adminId, activityConfig } = options;

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Get available investment plans
  const investmentPlans = await InvestmentPlan.find({ isActive: true });
  if (investmentPlans.length === 0) {
    throw new Error('No active investment plans available');
  }

  // Create a map for quick plan lookup by ID
  const planMap = new Map();
  investmentPlans.forEach((plan: any) => {
    planMap.set(plan._id.toString(), plan);
  });

  const activities: any[] = [];
  const now = new Date();
  const startDate = new Date(now.getFullYear() - years, now.getMonth(), now.getDate());

  const existingReferralPointsDoc = await ReferralPoints.findOne({ user: new mongoose.Types.ObjectId(userId) });
  const existingReferralPoints = existingReferralPointsDoc?.totalPoints ?? user.referralStats?.totalPointsEarned ?? 0;
  const existingReferralStats = {
    totalReferred: user.referralStats?.totalReferred ?? existingReferralPointsDoc?.lifetimeStats?.totalReferrals ?? 0,
    qualifiedReferrals: user.referralStats?.qualifiedReferrals ?? existingReferralPointsDoc?.lifetimeStats?.qualifiedReferrals ?? 0,
    totalPointsEarned: user.referralStats?.totalPointsEarned ?? existingReferralPoints,
    currentTier: user.referralStats?.currentTier ?? existingReferralPointsDoc?.tier ?? 'bronze'
  };
  const existingLifetimeStats = {
    totalPointsEarned: existingReferralPointsDoc?.lifetimeStats?.totalPointsEarned ?? existingReferralStats.totalPointsEarned,
    totalReferrals: existingReferralPointsDoc?.lifetimeStats?.totalReferrals ?? existingReferralStats.totalReferred,
    qualifiedReferrals: existingReferralPointsDoc?.lifetimeStats?.qualifiedReferrals ?? existingReferralStats.qualifiedReferrals,
    totalInvestmentGenerated: existingReferralPointsDoc?.lifetimeStats?.totalInvestmentGenerated ?? 0
  };
  const existingUsedPoints = existingReferralPointsDoc?.usedPoints ?? 0;

  const tierOrder: Array<keyof typeof REFERRAL_TIERS> = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'shareholder'];

  const determineTierFromPoints = (points: number): keyof typeof REFERRAL_TIERS => {
    let resolvedTier: keyof typeof REFERRAL_TIERS = 'bronze';
    for (const tierKey of tierOrder) {
      const config = REFERRAL_TIERS[tierKey];
      if (points >= config.minPoints && points <= config.maxPoints) {
        resolvedTier = tierKey;
      }
      if (!Number.isFinite(config.maxPoints) && points >= config.minPoints) {
        resolvedTier = tierKey;
      }
    }
    return resolvedTier;
  };

  const calculatePointsToNextTier = (tierKey: keyof typeof REFERRAL_TIERS, points: number) => {
    const currentIndex = tierOrder.indexOf(tierKey);
    if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
      return 0;
    }
    const nextTierKey = tierOrder[currentIndex + 1];
    const nextTierConfig = REFERRAL_TIERS[nextTierKey];
    return Math.max(0, nextTierConfig.minPoints - points);
  };

  const buildReferralPlan = (targetTier?: string) => {
    const fallbackTier = determineTierFromPoints(existingReferralPoints);

    if (!targetTier) {
      return {
        tierKey: fallbackTier,
        targetTotalPoints: existingReferralPoints,
        pointsToGenerate: 0,
        referralsToCreate: 0
      };
    }

    const tierKey = targetTier.toLowerCase() as keyof typeof REFERRAL_TIERS;
    const tierConfig = REFERRAL_TIERS[tierKey];

    if (!tierConfig) {
      return {
        tierKey: fallbackTier,
        targetTotalPoints: existingReferralPoints,
        pointsToGenerate: 0,
        referralsToCreate: 0
      };
    }

    const safeMin = Math.max(existingReferralPoints, tierConfig.minPoints);
    let safeMax = tierConfig.maxPoints;

    if (!Number.isFinite(safeMax)) {
      const baseline = Math.max(safeMin, tierConfig.minPoints);
      safeMax = baseline + tierConfig.pointsPerReferral * 10;
    }

    if (safeMin > safeMax) {
      safeMax = safeMin;
    }

    const targetTotalPoints = safeMin === safeMax
      ? safeMin
      : Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;

    const pointsToGenerate = Math.max(0, targetTotalPoints - existingReferralPoints);
    const referralsToCreate = pointsToGenerate === 0 ? 0 : Math.max(1, Math.ceil(pointsToGenerate / 1500));

    return { tierKey, targetTotalPoints, pointsToGenerate, referralsToCreate };
  };

  const distributeReferralPoints = (totalPoints: number, referralTotal: number): number[] => {
    if (referralTotal <= 0 || totalPoints <= 0) {
      return [];
    }

    const distribution: number[] = [];
    let remaining = totalPoints;

    for (let i = 0; i < referralTotal; i++) {
      const referralsLeft = referralTotal - i;

      if (referralsLeft === 1) {
        distribution.push(remaining);
        remaining = 0;
        continue;
      }

      const average = Math.max(1, Math.floor(remaining / referralsLeft));
      const variance = Math.max(1, Math.floor(average * 0.3));
      const minPoints = Math.max(1, average - variance);
      const maxPoints = Math.max(minPoints, average + variance);
      const maxAssignable = remaining - (referralsLeft - 1);
      const upperBound = Math.max(minPoints, Math.min(maxPoints, maxAssignable));
      const randomPoints = Math.floor(Math.random() * (upperBound - minPoints + 1)) + minPoints;
      const assigned = Math.max(1, Math.min(upperBound, randomPoints));

      distribution.push(assigned);
      remaining -= assigned;
    }

    if (remaining > 0 && distribution.length > 0) {
      distribution[distribution.length - 1] += remaining;
    }

    while (distribution.length < referralTotal) {
      distribution.push(0);
    }

    return distribution;
  };

  const referralsEnabled = activityConfig?.referrals?.enabled !== false;
  const referralPlan = referralsEnabled ? buildReferralPlan(activityConfig?.referrals?.targetTier) : buildReferralPlan(undefined);

  // Determine how many referrals we need to create to reach the requested tier range
  let referralsCount = referralsEnabled && referralPlan.pointsToGenerate > 0
    ? referralPlan.referralsToCreate
    : 0;
  const depositsCount = activityConfig?.deposits?.enabled
    ? activityConfig.deposits.count
    : Math.floor(years * 3);
  const withdrawalsCount = activityConfig?.withdrawals?.enabled
    ? activityConfig.withdrawals.count
    : Math.floor(years * 1.5);
  const investmentsCount = activityConfig?.investments?.enabled
    ? activityConfig.investments.count
    : Math.floor(years * 2.5);
  const loginsCount = activityConfig?.logins?.enabled
    ? activityConfig.logins.count
    : Math.floor(years * 30);

  // Track totals
  let totalDeposited = 0;
  let totalInvested = 0;
  let totalReturns = 0;
  let totalWithdrawn = 0;
  let generatedReferralPoints = 0; // Track points generated during this operation

  // Arrays to store created records
  const createdDeposits: any[] = [];
  const createdInvestments: any[] = [];
  const createdWithdrawals: any[] = [];
  const createdDailyProfits: any[] = [];
  const usedDates = new Set<string>(); // Track used dates to avoid duplicates

  // Helper to get unique date (no activities on same day)
  const getUniqueDate = (start: Date, end: Date): Date => {
    let attempts = 0;
    let date: Date;
    do {
      date = randomDate(start, end);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!usedDates.has(dateKey)) {
        usedDates.add(dateKey);
        return date;
      }
      attempts++;
    } while (attempts < 100);
    // If we can't find unique date, just return random one
    return randomDate(start, end);
  };

  // Get deposit amount range from config
  const depositMinAmount = activityConfig?.deposits?.minAmount || 1000;
  const depositMaxAmount = activityConfig?.deposits?.maxAmount || 50000;

  // Generate Deposits with real Deposit records (SPARSE) - only if enabled
  if (activityConfig?.deposits?.enabled !== false) {
    for (let i = 0; i < depositsCount; i++) {
      // Use amounts from config or defaults, rounded to tens
      const amount = randomAmount(depositMinAmount, depositMaxAmount);
      totalDeposited += amount;
      const paymentMethods: ('bank_transfer' | 'crypto' | 'card')[] = ['bank_transfer', 'crypto', 'card'];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const depositDate = getUniqueDate(startDate, now);

      // Create real Deposit record
      const deposit = await Deposit.create({
        userId: new mongoose.Types.ObjectId(userId),
        amount,
        paymentMethod,
        status: 'approved',
        processedAt: depositDate,
        adminNotes: 'Deposit processed successfully',
        createdAt: depositDate,
        updatedAt: depositDate
      });

      createdDeposits.push(deposit);

      // Create activity history record
      activities.push({
        userId: new mongoose.Types.ObjectId(userId),
        activityType: 'deposit',
        date: depositDate,
        description: `Deposit via ${paymentMethod.replace('_', ' ')}`,
        amount,
        currency: 'USD',
        transactionId: `TXN-DEP-${deposit._id}`,
        status: 'completed',
        paymentMethod,
        isGenerated: true,
        generatedAt: now
      });
    }
  }

  // Generate Investments with real UserInvestment records (using real plan constraints) - only if enabled
  if (activityConfig?.investments?.enabled !== false) {
    for (let i = 0; i < investmentsCount; i++) {
      // Pick a random plan
      const plan = investmentPlans[Math.floor(Math.random() * investmentPlans.length)];

      // Use amount within the plan's min/max range and round to tens
      const amount = randomAmount(plan.minInvestment || 1000, plan.maxInvestment || 50000);
      totalInvested += amount;

      const investmentDate = getUniqueDate(startDate, now);
      const durationDays = plan.duration || 365; // Use duration in days from plan
      const endDate = new Date(investmentDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

      // Check if investment has already completed (endDate is in the past)
      const hasCompleted = endDate < now;
      const investmentStatus = hasCompleted ? 'completed' : 'active';
      const completedDate = hasCompleted ? endDate : undefined;

      // Create real UserInvestment record
      const userInvestment = await UserInvestment.create({
        user: new mongoose.Types.ObjectId(userId),
        investmentPlan: plan._id,
        amount,
        currency: 'USD',
        status: investmentStatus,
        startDate: investmentDate,
        endDate: endDate,
        completedDate: completedDate,
        totalProfitsEarned: 0,
        dailyProfitRate: plan.profitPercentage / durationDays, // Distribute profit over duration
        totalWithdrawn: 0,
        principalWithdrawn: 0,
        profitsWithdrawn: 0,
        adminNotes: 'Investment Created',
        createdAt: investmentDate,
        updatedAt: investmentDate
      });

      // Store the plan in the map for this investment
      planMap.set(userInvestment.investmentPlan.toString(), plan);

      createdInvestments.push(userInvestment);

      // Create activity history record
      activities.push({
        userId: new mongoose.Types.ObjectId(userId),
        activityType: 'investment',
        date: investmentDate,
        description: `Investment in ${plan.name}`,
        amount,
        currency: 'USD',
        transactionId: `TXN-INV-${userInvestment._id}`,
        status: 'completed',
        investmentPlanName: plan.name,
        portfolioType: plan.category || 'Diversified',
        shares: Math.floor(amount / 100),
        isGenerated: true,
        generatedAt: now
      });
    }
  }

  // Generate Daily Profits/Returns for each investment (LOGICAL AMOUNTS)
  // Calculate profits for ALL investments based on days running
  console.log(`\n💰 Starting profit calculation for ${createdInvestments.length} investments...`);

  for (const investment of createdInvestments) {
    const investmentStartDate = new Date(investment.startDate);

    // Get the plan from our map using the stored plan ID
    const plan = planMap.get(investment.investmentPlan.toString());

    if (!plan) {
      console.log(`⚠️  No plan found for investment ${investment._id}`);
      console.log(`   Investment plan ID: ${investment.investmentPlan.toString()}`);
      console.log(`   Available plan IDs:`, Array.from(planMap.keys()));
      continue;
    }

    // Calculate how many days have passed since investment started
    // For completed investments, use the full duration
    // For active investments, use days elapsed so far (capped at duration)
    const investmentEndDate = new Date(investment.endDate);
    const isCompleted = investmentEndDate < now;

    let daysSinceStart;
    if (isCompleted) {
      // Investment has completed - use full duration
      daysSinceStart = Math.floor((investmentEndDate.getTime() - investmentStartDate.getTime()) / (24 * 60 * 60 * 1000));
    } else {
      // Investment is active - use days elapsed so far (capped at duration)
      daysSinceStart = Math.min(
        Math.floor((now.getTime() - investmentStartDate.getTime()) / (24 * 60 * 60 * 1000)),
        plan.duration
      );
    }

    console.log(`\n📊 Processing investment ${investment._id.toString().substring(0, 8)}...`);
    console.log(`   Status: ${investment.status}`);
    console.log(`   Start date: ${investmentStartDate.toISOString().split('T')[0]}`);
    console.log(`   End date: ${investmentEndDate.toISOString().split('T')[0]}`);
    console.log(`   Days since start: ${daysSinceStart}`);

    // Skip if investment just started (less than 1 day old)
    if (daysSinceStart < 1) {
      console.log(`   ⏭️  Skipping - less than 1 day old`);
      continue;
    }

    // Calculate daily profit using the plan's percentage and duration
    // Formula: (Total Percentage / Duration) = Daily Percentage
    // Then: Principal × Daily Percentage = Daily Profit Amount
    const dailyProfitPercentage = plan.profitPercentage / plan.duration; // e.g., 25% / 365 = 0.0685%
    const dailyProfitAmount = investment.amount * (dailyProfitPercentage / 100);

    // Total profit accumulated for ALL days the investment has been running
    const totalProfitAccumulated = dailyProfitAmount * daysSinceStart;

    console.log(`   💵 Calculation:`);
    console.log(`      Plan: ${plan.name}`);
    console.log(`      Principal: $${investment.amount.toLocaleString()}`);
    console.log(`      Plan %: ${plan.profitPercentage}% over ${plan.duration} days`);
    console.log(`      Daily %: ${dailyProfitPercentage.toFixed(4)}%`);
    console.log(`      Daily $: $${dailyProfitAmount.toFixed(2)}`);
    console.log(`      Days running: ${daysSinceStart}`);
    console.log(`      TOTAL PROFIT: $${totalProfitAccumulated.toFixed(2)}`);

    // Create ONE summary DailyProfit record representing all accumulated profit
    const dailyProfit = await DailyProfit.create({
      userInvestment: investment._id,
      user: new mongoose.Types.ObjectId(userId),
      date: now, // Current date
      profitAmount: totalProfitAccumulated,
      dailyRate: dailyProfitPercentage,
      investmentAmount: investment.amount,
      status: 'paid',
      calculatedAt: now,
      paidAt: now,
      createdAt: now,
      updatedAt: now
    });

    createdDailyProfits.push(dailyProfit);
    totalReturns += totalProfitAccumulated;

    // Create activity history records every ~30 days to show profit milestones (not too many)
    const monthsPassed = Math.floor(daysSinceStart / 30);
    for (let month = 0; month < Math.min(monthsPassed, 3); month++) { // Max 3 activity records
      const profitDate = new Date(investmentStartDate.getTime() + (month * 30 + 15) * 24 * 60 * 60 * 1000);
      const monthlyProfit = dailyProfitAmount * 30;

      activities.push({
        userId: new mongoose.Types.ObjectId(userId),
        activityType: 'return',
        date: profitDate,
        description: `Profit return on ${plan.name}`,
        amount: monthlyProfit,
        currency: 'USD',
        transactionId: `TXN-RET-${month}-${investment._id}`,
        status: 'completed',
        returnPercentage: (monthlyProfit / investment.amount) * 100,
        principalAmount: investment.amount,
        isGenerated: true,
        generatedAt: now
      });
    }

    // UPDATE THE INVESTMENT RECORD with total profits earned
    const updateResult = await UserInvestment.findByIdAndUpdate(
      investment._id,
      {
        totalProfitsEarned: totalProfitAccumulated
      },
      { new: true } // Return the updated document
    );

    if (updateResult) {
      console.log(`✅ Updated investment ${investment._id} with totalProfitsEarned: $${totalProfitAccumulated.toFixed(2)}`);
      console.log(`   Verified in DB: $${updateResult.totalProfitsEarned.toFixed(2)}`);
    } else {
      console.log(`❌ Failed to update investment ${investment._id}`);
    }
  }

  // Generate Withdrawals with real Withdrawal records (LOGICAL) - only if enabled
  if (activityConfig?.withdrawals?.enabled !== false) {
    // Can only withdraw from investments that have accumulated profits
    const investmentsWithAvailableProfits = createdInvestments.filter(inv => {
      const profits = createdDailyProfits
        .filter(dp => dp.userInvestment.toString() === inv._id.toString())
        .reduce((sum, dp) => sum + dp.profitAmount, 0);
      return profits > 100; // At least $100 in profits
    });

    // Limit withdrawals - only some people withdraw (not everyone)
    const actualWithdrawalsCount = Math.min(withdrawalsCount, Math.floor(investmentsWithAvailableProfits.length * 0.5)); // Only 50% withdraw

    for (let i = 0; i < actualWithdrawalsCount; i++) {
      // Pick an investment with available profits
      const sourceInvestment = investmentsWithAvailableProfits[i % investmentsWithAvailableProfits.length];

      // Calculate available profits for this investment
      const availableProfits = createdDailyProfits
        .filter(dp => dp.userInvestment.toString() === sourceInvestment._id.toString())
        .reduce((sum, dp) => sum + dp.profitAmount, 0);

      // Withdraw only a portion of available profits (30-70%)
      const withdrawalPercentage = 0.3 + Math.random() * 0.4; // 30% to 70%
      const amount = Math.round((availableProfits * withdrawalPercentage) / 10) * 10; // Round to tens

      totalWithdrawn += amount;
      const withdrawalDate = getUniqueDate(new Date(sourceInvestment.startDate), now);

      // Create real Withdrawal record
      const withdrawal = await Withdrawal.create({
        user: new mongoose.Types.ObjectId(userId),
        userInvestment: sourceInvestment?._id || new mongoose.Types.ObjectId(),
        amount,
        type: 'profits_only',
        status: 'completed',
        requestedAt: withdrawalDate,
        reviewedAt: withdrawalDate,
        processedAt: withdrawalDate,
        transactionId: `TXN-WTH-${Date.now()}-${i}`,
        paymentMethod: 'bank_transfer',
        principalAmount: 0,
        profitAmount: amount,
        totalFees: amount * 0.01, // 1% fee
        netAmount: amount * 0.99,
        adminNotes: 'Withdrawal processed successfully',
        createdAt: withdrawalDate,
        updatedAt: withdrawalDate
      });

      createdWithdrawals.push(withdrawal);

      // Update investment's withdrawal tracking
      await UserInvestment.findByIdAndUpdate(sourceInvestment._id, {
        $inc: {
          totalWithdrawn: amount,
          profitsWithdrawn: amount
        }
      });

      // Create activity history record
      activities.push({
        userId: new mongoose.Types.ObjectId(userId),
        activityType: 'withdrawal',
        date: withdrawalDate,
        description: `Withdrawal to bank account`,
        amount,
        currency: 'USD',
        transactionId: `TXN-WTH-${withdrawal._id}`,
        status: 'completed',
        paymentMethod: 'bank_transfer',
        isGenerated: true,
        generatedAt: now
      });
    }
  }

  // Generate Referrals with real Referral records - only if enabled
  if (referralsEnabled && referralsCount > 0) {
    const plannedReferralsCount = referralsCount;
    const pointsDistribution = distributeReferralPoints(referralPlan.pointsToGenerate, plannedReferralsCount);
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez'];

    let createdReferrals = 0;

    for (let i = 0; i < plannedReferralsCount; i++) {
      const pointsEarned = pointsDistribution[i] ?? 0;
      if (pointsEarned <= 0) {
        continue;
      }

      const bonus = pointsEarned * 10;
      const referralDate = getUniqueDate(startDate, now);

      // Generate realistic fake user data
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}@${['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'hotmail.com'][Math.floor(Math.random() * 5)]}`;
      const referredUserName = `${firstName} ${lastName}`;

      // Generate unique referral code for each referral
      const uniqueReferralCode = `${user.referralCode || 'REF' + userId.substring(0, 8).toUpperCase()}-${Date.now()}-${i}`;

      await Referral.create({
        referrer: new mongoose.Types.ObjectId(userId),
        referred: new mongoose.Types.ObjectId(),
        referralCode: uniqueReferralCode,
        status: 'rewarded',
        pointsEarned,
        qualifyingInvestment: bonus * 10,
        signupDate: referralDate,
        qualificationDate: referralDate,
        rewardDate: referralDate,
        metadata: {
          ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          source: 'direct',
          campaign: 'demo-generated',
          fakeUserInfo: {
            firstName,
            lastName,
            email
          }
        },
        createdAt: referralDate,
        updatedAt: referralDate
      });

      generatedReferralPoints += pointsEarned;
      createdReferrals += 1;

      activities.push({
        userId: new mongoose.Types.ObjectId(userId),
        activityType: 'referral',
        date: referralDate,
        description: `Referral bonus for inviting ${referredUserName}`,
        amount: bonus,
        currency: 'USD',
        referredUserName,
        referredUserEmail: email,
        referralBonus: bonus,
        status: 'completed',
        isGenerated: true,
        generatedAt: now
      });
    }

    referralsCount = createdReferrals;
  } else if (!referralsEnabled) {
    referralsCount = 0;
  }

  // Generate Logins (SPARSE - logins can be on same day, so not using getUniqueDate) - only if enabled
  if (activityConfig?.logins?.enabled !== false) {
    const locations = ['New York, US', 'Los Angeles, US', 'Chicago, US', 'Houston, US', 'Miami, US'];
    const devices = ['Chrome on Windows', 'Safari on MacOS', 'Chrome on Android', 'Safari on iOS', 'Firefox on Windows'];

    for (let i = 0; i < loginsCount; i++) {
      activities.push({
        userId: new mongoose.Types.ObjectId(userId),
        activityType: 'login',
        date: randomDate(startDate, now),
        description: `User logged in`,
        status: 'completed',
        ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        device: devices[Math.floor(Math.random() * devices.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        isGenerated: true,
        generatedAt: now
      });
    }
  }

  // Generate KYC milestone - only if enabled
  if (activityConfig?.kycUpdates?.enabled !== false) {
    const kycDate = new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days after start
    activities.push({
      userId: new mongoose.Types.ObjectId(userId),
      activityType: 'kyc_update',
      date: kycDate,
      description: 'KYC verification approved',
      status: 'completed',
      kycStatus: 'approved',
      isGenerated: true,
      generatedAt: now
    });
  }

  // Generate Portfolio changes
  const portfolioTypes = ['Conservative Growth', 'Balanced Portfolio', 'Aggressive Growth', 'Income Focus', 'Diversified'];
  for (let i = 0; i < Math.floor(years * 2); i++) {
    activities.push({
      userId: new mongoose.Types.ObjectId(userId),
      activityType: 'portfolio_change',
      date: randomDate(startDate, now),
      description: `Portfolio rebalanced to ${portfolioTypes[Math.floor(Math.random() * portfolioTypes.length)]}`,
      status: 'completed',
      portfolioType: portfolioTypes[Math.floor(Math.random() * portfolioTypes.length)],
      isGenerated: true,
      generatedAt: now
    });
  }

  // Sort all activities by date
  activities.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Save all activity history records to database
  const savedActivities = await ActivityHistory.insertMany(activities);

  const finalReferralPoints = existingReferralPoints + generatedReferralPoints;
  const finalTier = determineTierFromPoints(finalReferralPoints);
  const finalPointsToNextTier = calculatePointsToNextTier(finalTier, finalReferralPoints);
  const finalTotalReferred = existingReferralStats.totalReferred + referralsCount;
  const finalQualifiedReferrals = existingReferralStats.qualifiedReferrals + referralsCount;
  const finalTotalPointsEarned = existingReferralStats.totalPointsEarned + generatedReferralPoints;
  const updatedLifetimeStats = {
    totalPointsEarned: existingLifetimeStats.totalPointsEarned + generatedReferralPoints,
    totalReferrals: existingLifetimeStats.totalReferrals + referralsCount,
    qualifiedReferrals: existingLifetimeStats.qualifiedReferrals + referralsCount,
    totalInvestmentGenerated: existingLifetimeStats.totalInvestmentGenerated
  };
  const availableReferralPoints = Math.max(0, finalReferralPoints - existingUsedPoints);

  // Update user's financial data and referral stats
  const netBalance = totalDeposited + totalReturns - totalInvested - totalWithdrawn;

  await User.findByIdAndUpdate(userId, {
    walletBalance: Math.max(0, netBalance),
    totalInvested: totalInvested,
    totalDeposited: totalDeposited,
    totalWithdrawn: totalWithdrawn,
    referralPoints: finalReferralPoints,
    'referralStats.totalReferred': finalTotalReferred,
    'referralStats.qualifiedReferrals': finalQualifiedReferrals,
    'referralStats.totalPointsEarned': finalTotalPointsEarned,
    'referralStats.currentTier': finalTier,
    lastLogin: now
  });

  // Create or update ReferralPoints record (this is what the dashboard reads from!)
  await ReferralPoints.findOneAndUpdate(
    { user: new mongoose.Types.ObjectId(userId) },
    {
      totalPoints: finalReferralPoints,
      availablePoints: availableReferralPoints,
      usedPoints: existingUsedPoints,
      tier: finalTier,
      pointsToNextTier: finalPointsToNextTier,
      lifetimeStats: {
        totalPointsEarned: updatedLifetimeStats.totalPointsEarned,
        totalReferrals: updatedLifetimeStats.totalReferrals,
        qualifiedReferrals: updatedLifetimeStats.qualifiedReferrals,
        totalInvestmentGenerated: updatedLifetimeStats.totalInvestmentGenerated
      }
    },
    { upsert: true, new: true }
  );

  return {
    success: true,
    activitiesGenerated: savedActivities.length,
    recordsCreated: {
      deposits: createdDeposits.length,
      investments: createdInvestments.length,
      withdrawals: createdWithdrawals.length,
      dailyProfits: createdDailyProfits.length,
      referrals: referralsCount,
      activityHistory: savedActivities.length
    },
    summary: {
      totalDeposits: depositsCount,
      totalWithdrawals: withdrawalsCount,
      totalInvestments: investmentsCount,
      totalReturns: createdDailyProfits.length,
      totalReferrals: referralsCount,
      totalReferralPoints: finalReferralPoints,
      currentTier: finalTier,
      totalLogins: loginsCount,
      totalAmountDeposited: totalDeposited.toFixed(2),
      totalAmountInvested: totalInvested.toFixed(2),
      totalReturnsEarned: totalReturns.toFixed(2),
      totalAmountWithdrawn: totalWithdrawn.toFixed(2),
      netBalance: netBalance.toFixed(2)
    }
  };
};

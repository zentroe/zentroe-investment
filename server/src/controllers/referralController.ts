import { Response } from 'express';
import { AuthenticatedRequest } from '../types/CustomRequest';
import { Referral, ReferralPoints, PointsTransaction, EquityTransaction, REFERRAL_TIERS, EQUITY_CONVERSION } from '../models/Referral';
import { ActivityHistory } from '../models/ActivityHistory';
import { User } from '../models/User';
import { UserInvestment } from '../models/UserInvestment';
import crypto from 'crypto';

// Generate unique referral code
const generateReferralCode = (email: string): string => {
  const hash = crypto.createHash('sha256').update(email + Date.now()).digest('hex');
  return hash.substring(0, 8).toUpperCase();
};

// Get user's referral dashboard data
export const getReferralDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Get or create referral points record
    let referralPoints = await ReferralPoints.findOne({ user: userId });
    if (!referralPoints) {
      referralPoints = await ReferralPoints.create({ user: userId });
    }

    // Get referral history (includes demo/generated referrals with metadata)
    const allReferrals = await Referral.find({ referrer: userId })
      .populate('referred', 'firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Get referral activity entries to ensure we reflect any admin edits made in activity history
    const referralActivities = await ActivityHistory.find({
      userId,
      activityType: 'referral'
    })
      .select('referralId referredUserName referredUserEmail date referralBonus description')
      .sort({ date: -1 })
      .lean();

    const activityByReferralId = new Map<string, any>();
    const activityByEmail = new Map<string, any>();
    const activityByDayAndBonus = new Map<string, any>();

    referralActivities.forEach(activity => {
      if (activity.referralId) {
        activityByReferralId.set(activity.referralId.toString(), activity);
      }

      if (activity.referredUserEmail) {
        activityByEmail.set(activity.referredUserEmail.toLowerCase(), activity);
      }

      const dayKey = `${activity.date.toISOString().split('T')[0]}-${activity.referralBonus ?? ''}`;
      activityByDayAndBonus.set(dayKey, activity);
    });

    // Transform referrals to handle both real users and demo data
    const referrals = allReferrals.map(ref => {
      const refObj: any = ref;

      const referredDoc = refObj.referred && typeof refObj.referred === 'object' && !Array.isArray(refObj.referred)
        ? refObj.referred
        : null;

      // Attempt to find matching activity entry to keep data in sync with ActivityHistory edits
      let matchedActivity = refObj._id ? activityByReferralId.get(refObj._id.toString()) : undefined;

      const candidateEmails = [
        refObj.metadata?.fakeUserInfo?.email,
        referredDoc?.email,
        matchedActivity?.referredUserEmail
      ].filter(Boolean) as string[];

      if (!matchedActivity) {
        for (const email of candidateEmails) {
          const matchByEmail = activityByEmail.get(email.toLowerCase());
          if (matchByEmail) {
            matchedActivity = matchByEmail;
            break;
          }
        }
      }

      if (!matchedActivity) {
        const fallbackDate = refObj.rewardDate || refObj.qualificationDate || refObj.signupDate;
        if (fallbackDate) {
          const dateKey = `${new Date(fallbackDate).toISOString().split('T')[0]}-${matchedActivity?.referralBonus ?? refObj.pointsEarned ?? ''}`;
          matchedActivity = activityByDayAndBonus.get(dateKey);
        }
        if (!matchedActivity) {
          matchedActivity = referralActivities.find(activity => {
            const activityDay = activity.date.toISOString().split('T')[0];
            const referralDay = new Date(fallbackDate).toISOString().split('T')[0];
            return activityDay === referralDay;
          });
        }

      }

      const coalesceNameFromActivity = () => {
        if (!matchedActivity?.referredUserName) return { firstName: undefined, lastName: undefined };
        const nameParts = matchedActivity.referredUserName.trim().split(/\s+/);
        const first = nameParts[0];
        const last = nameParts.slice(1).join(' ') || undefined;
        return { firstName: first, lastName: last };
      };

      const activityNames = coalesceNameFromActivity();
      const activityEmail = matchedActivity?.referredUserEmail;

      // Determine the referred user details priority: activity edit -> real user -> metadata fallback
      const referredDetails = referredDoc && referredDoc._id ? {
        ...referredDoc,
        firstName: activityNames.firstName || referredDoc.firstName,
        lastName: activityNames.lastName || referredDoc.lastName,
        email: activityEmail || referredDoc.email
      } : {
        _id: referredDoc || refObj.referred || undefined,
        firstName: activityNames.firstName || refObj.metadata?.fakeUserInfo?.firstName,
        lastName: activityNames.lastName || refObj.metadata?.fakeUserInfo?.lastName,
        email: activityEmail || refObj.metadata?.fakeUserInfo?.email,
        createdAt: refObj.signupDate
      };

      // Ensure we always send an object for referred details
      const normalizedReferred = referredDetails ? {
        _id: referredDetails._id,
        firstName: referredDetails.firstName,
        lastName: referredDetails.lastName,
        email: referredDetails.email,
        createdAt: referredDetails.createdAt || refObj.signupDate
      } : undefined;

      const baseResponse: any = {
        ...refObj,
        referred: normalizedReferred,
        metadata: refObj.metadata,
        activityMetadata: matchedActivity ? {
          referredUserName: matchedActivity.referredUserName,
          referredUserEmail: matchedActivity.referredUserEmail,
          activityId: matchedActivity._id
        } : undefined
      };

      if (matchedActivity) {
        baseResponse.metadata = {
          ...(refObj.metadata || {}),
          fakeUserInfo: {
            ...(refObj.metadata?.fakeUserInfo || {}),
            firstName: activityNames.firstName || refObj.metadata?.fakeUserInfo?.firstName,
            lastName: activityNames.lastName || refObj.metadata?.fakeUserInfo?.lastName,
            email: activityEmail || refObj.metadata?.fakeUserInfo?.email
          }
        };
      }

      // If referred user exists (real referral)
      if (baseResponse.referred && baseResponse.referred._id && referredDoc && referredDoc._id) {
        return baseResponse;
      }

      // If no referred user (demo/generated referral with metadata)
      if (refObj.metadata?.fakeUserInfo) {
        const metadataRef = {
          ...baseResponse,
          referred: normalizedReferred
        };

        console.log('📊 Transformed referral:', {
          firstName: metadataRef.referred?.firstName,
          lastName: metadataRef.referred?.lastName,
          email: metadataRef.referred?.email
        });
        return metadataRef;
      }

      // Invalid referral (no user and no metadata) - filter out
      return null;
    }).filter(ref => ref !== null);

    console.log(`📊 Returning ${referrals.length} referrals for user ${userId}`);

    // Get points transaction history
    const pointsHistory = await PointsTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate statistics
    const stats = {
      totalPoints: referralPoints.totalPoints,
      availablePoints: referralPoints.availablePoints,
      usedPoints: referralPoints.usedPoints,
      currentTier: referralPoints.tier,
      pointsToNextTier: referralPoints.pointsToNextTier,
      equityPercentage: referralPoints.equityPercentage,
      sharesOwned: referralPoints.sharesOwned,
      ...referralPoints.lifetimeStats
    };

    // Get current tier benefits
    const tierInfo = REFERRAL_TIERS[referralPoints.tier as keyof typeof REFERRAL_TIERS];

    // Set no-cache headers to ensure fresh data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.json({
      success: true,
      data: {
        stats,
        tierInfo,
        referrals,
        pointsHistory,
        equityConversion: {
          minimumPoints: EQUITY_CONVERSION.minimumConversion,
          currentSharePrice: EQUITY_CONVERSION.baseSharePrice,
          canConvertToEquity: referralPoints.availablePoints >= EQUITY_CONVERSION.minimumConversion
        }
      }
    });
  } catch (error) {
    console.error('Error fetching referral dashboard:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get or generate user's referral code
export const getReferralCode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!user.referralCode) {
      user.referralCode = generateReferralCode(user.email);
      await user.save();
    }

    const referralLink = `${process.env.CLIENT_URL}/signup?ref=${user.referralCode}`;

    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink,
        shareMessage: `Join me on Zentroe and start building wealth through smart investments! Use my referral code ${user.referralCode} and we both earn points toward equity ownership. ${referralLink}`
      }
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Process a referral (called when someone signs up with a referral code)
export const processReferral = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { referralCode, newUserId } = req.body;

    if (!referralCode || !newUserId) {
      res.status(400).json({
        success: false,
        message: 'Referral code and new user ID are required'
      });
      return;
    }

    // Find the referrer
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
      return;
    }

    // Check if referral already exists
    const existingReferral = await Referral.findOne({
      referrer: referrer._id,
      referred: newUserId
    });

    if (existingReferral) {
      res.status(400).json({
        success: false,
        message: 'Referral already exists'
      });
      return;
    }

    // Create referral record
    const referral = await Referral.create({
      referrer: referrer._id,
      referred: newUserId,
      referralCode,
      status: 'pending',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // Update referred user
    await User.findByIdAndUpdate(newUserId, {
      referredBy: referrer._id
    });

    // Update referrer's stats
    await User.findByIdAndUpdate(referrer._id, {
      $inc: { 'referralStats.totalReferred': 1 }
    });

    res.json({
      success: true,
      data: { referralId: referral._id }
    });
  } catch (error) {
    console.error('Error processing referral:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Check referral qualification (called when user makes investment)
export const checkReferralQualification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId, investmentAmount } = req.body;

    // Find pending referral for this user
    const referral = await Referral.findOne({
      referred: userId,
      status: 'pending'
    }).populate('referrer');

    if (!referral) {
      res.json({ success: true, message: 'No pending referral found' });
      return;
    }

    const minimumInvestment = 1000; // $1000 minimum to qualify

    if (investmentAmount >= minimumInvestment) {
      // Qualify the referral
      referral.status = 'qualified';
      referral.qualificationDate = new Date();
      referral.qualifyingInvestment = investmentAmount;
      await referral.save();

      // Award points to referrer
      await awardReferralPoints(referral.referrer._id.toString(), referral._id.toString(), investmentAmount);

      res.json({
        success: true,
        message: 'Referral qualified and points awarded'
      });
    } else {
      res.json({
        success: true,
        message: 'Investment amount does not meet qualification threshold'
      });
    }
  } catch (error) {
    console.error('Error checking referral qualification:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Convert points to equity
export const convertPointsToEquity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { pointsToConvert } = req.body;

    if (!pointsToConvert || pointsToConvert < EQUITY_CONVERSION.minimumConversion) {
      res.status(400).json({
        success: false,
        message: `Minimum ${EQUITY_CONVERSION.minimumConversion} points required for equity conversion`
      });
      return;
    }

    const referralPoints = await ReferralPoints.findOne({ user: userId });
    if (!referralPoints || referralPoints.availablePoints < pointsToConvert) {
      res.status(400).json({
        success: false,
        message: 'Insufficient points for conversion'
      });
      return;
    }

    // Calculate equity
    const sharesReceived = pointsToConvert / EQUITY_CONVERSION.baseSharePrice;
    const equityPercentage = (sharesReceived / EQUITY_CONVERSION.totalShares) * 100;

    // Create equity transaction (pending approval)
    const equityTransaction = await EquityTransaction.create({
      user: userId,
      pointsUsed: pointsToConvert,
      sharesReceived,
      equityPercentage,
      sharePrice: EQUITY_CONVERSION.baseSharePrice,
      companyValuation: EQUITY_CONVERSION.companyValuation,
      status: 'pending'
    });

    // Reserve the points (reduce available points)
    referralPoints.availablePoints -= pointsToConvert;
    await referralPoints.save();

    // Record points transaction
    await PointsTransaction.create({
      user: userId,
      type: 'equity_purchase',
      points: -pointsToConvert,
      description: `Equity conversion - ${sharesReceived.toFixed(6)} shares`,
      equityTransaction: equityTransaction._id,
      balanceAfter: referralPoints.availablePoints
    });

    res.json({
      success: true,
      message: 'Equity conversion request submitted for approval',
      data: {
        transactionId: equityTransaction._id,
        sharesReceived,
        equityPercentage,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error converting points to equity:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Award referral points (internal function)
async function awardReferralPoints(referrerId: string, referralId: string, investmentAmount: number) {
  // Get or create referral points record
  let referralPoints = await ReferralPoints.findOne({ user: referrerId });
  if (!referralPoints) {
    referralPoints = await ReferralPoints.create({ user: referrerId });
  }

  // Calculate points based on tier and investment amount
  const tierInfo = REFERRAL_TIERS[referralPoints.tier as keyof typeof REFERRAL_TIERS];
  const basePoints = tierInfo.pointsPerReferral;
  const investmentBonus = Math.floor(investmentAmount / 1000) * 5; // 5 bonus points per $1000 invested
  const totalPoints = Math.floor((basePoints + investmentBonus) * tierInfo.bonusMultiplier);

  // Update points
  referralPoints.totalPoints += totalPoints;
  referralPoints.availablePoints += totalPoints;
  if (referralPoints.lifetimeStats) {
    referralPoints.lifetimeStats.qualifiedReferrals += 1;
    referralPoints.lifetimeStats.totalPointsEarned += totalPoints;
    referralPoints.lifetimeStats.totalInvestmentGenerated += investmentAmount;
  }

  // Check for tier upgrade
  const newTier = calculateTier(referralPoints.totalPoints) as 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'shareholder';
  if (newTier !== referralPoints.tier) {
    referralPoints.tier = newTier;
    // Award tier upgrade bonus
    const tierUpgradeBonus = getTierUpgradeBonus(newTier);
    referralPoints.totalPoints += tierUpgradeBonus;
    referralPoints.availablePoints += tierUpgradeBonus;
  }

  // Update points to next tier
  referralPoints.pointsToNextTier = getPointsToNextTier(referralPoints.totalPoints, newTier);

  await referralPoints.save();

  // Record points transaction
  await PointsTransaction.create({
    user: referrerId,
    type: 'earned',
    points: totalPoints,
    description: `Referral qualification - $${investmentAmount.toLocaleString()} investment`,
    referral: referralId,
    balanceAfter: referralPoints.availablePoints
  });

  // Update referrer's user stats
  await User.findByIdAndUpdate(referrerId, {
    $inc: { 'referralStats.qualifiedReferrals': 1, 'referralStats.totalPointsEarned': totalPoints },
    $set: { 'referralStats.currentTier': newTier }
  });

  // Mark referral as rewarded
  await Referral.findByIdAndUpdate(referralId, {
    status: 'rewarded',
    pointsEarned: totalPoints,
    rewardDate: new Date()
  });
}

// Helper functions
function calculateTier(totalPoints: number): string {
  for (const [tier, config] of Object.entries(REFERRAL_TIERS)) {
    if (totalPoints >= config.minPoints && totalPoints <= config.maxPoints) {
      return tier;
    }
  }
  return 'bronze';
}

function getTierUpgradeBonus(tier: string): number {
  const bonuses = {
    silver: 50,
    gold: 200,
    platinum: 500,
    diamond: 1000,
    shareholder: 2500
  };
  return bonuses[tier as keyof typeof bonuses] || 0;
}

function getPointsToNextTier(currentPoints: number, currentTier: string): number {
  const tiers = Object.entries(REFERRAL_TIERS);
  const currentIndex = tiers.findIndex(([tier]) => tier === currentTier);

  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return 0; // Already at highest tier
  }

  const nextTier = tiers[currentIndex + 1][1];
  return nextTier.minPoints - currentPoints;
}
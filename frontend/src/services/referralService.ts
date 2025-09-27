import axios from '@/utils/axios';

// Types for referral system
export interface ReferralStats {
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
  currentTier: string;
  pointsToNextTier: number;
  equityPercentage: number;
  sharesOwned: number;
  totalReferrals: number;
  qualifiedReferrals: number;
  totalPointsEarned: number;
  totalInvestmentGenerated: number;
}

export interface TierInfo {
  minPoints: number;
  maxPoints: number;
  pointsPerReferral: number;
  bonusMultiplier: number;
  benefits: string[];
}

export interface ReferralRecord {
  _id: string;
  referrer: string;
  referred: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    createdAt: string;
  };
  referralCode: string;
  status: 'pending' | 'qualified' | 'rewarded' | 'expired';
  pointsEarned: number;
  qualifyingInvestment: number;
  signupDate: string;
  qualificationDate?: string;
  rewardDate?: string;
}

export interface PointsTransaction {
  _id: string;
  type: 'earned' | 'redeemed' | 'bonus' | 'penalty' | 'equity_purchase';
  points: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface EquityConversion {
  minimumPoints: number;
  currentSharePrice: number;
  canConvertToEquity: boolean;
}

export interface ReferralDashboard {
  stats: ReferralStats;
  tierInfo: TierInfo;
  referrals: ReferralRecord[];
  pointsHistory: PointsTransaction[];
  equityConversion: EquityConversion;
}

export interface ReferralCode {
  referralCode: string;
  referralLink: string;
  shareMessage: string;
}

export interface EquityTransaction {
  transactionId: string;
  sharesReceived: number;
  equityPercentage: number;
  status: string;
}

// API Functions
export const getReferralDashboard = async (): Promise<ReferralDashboard> => {
  const response = await axios.get('/referrals/dashboard');
  return response.data.data;
};

export const getReferralCode = async (): Promise<ReferralCode> => {
  const response = await axios.get('/referrals/code');
  return response.data.data;
};

export const processReferral = async (referralCode: string, newUserId: string) => {
  const response = await axios.post('/referrals/process', {
    referralCode,
    newUserId
  });
  return response.data;
};

export const checkReferralQualification = async (userId: string, investmentAmount: number) => {
  const response = await axios.post('/referrals/check-qualification', {
    userId,
    investmentAmount
  });
  return response.data;
};

export const convertPointsToEquity = async (pointsToConvert: number): Promise<EquityTransaction> => {
  const response = await axios.post('/referrals/convert-to-equity', {
    pointsToConvert
  });
  return response.data.data;
};

// Utility functions
export const getTierColor = (tier: string): string => {
  const colors = {
    bronze: 'text-orange-600 bg-orange-50',
    silver: 'text-gray-600 bg-gray-50',
    gold: 'text-yellow-600 bg-yellow-50',
    platinum: 'text-purple-600 bg-purple-50',
    diamond: 'text-blue-600 bg-blue-50',
    shareholder: 'text-green-600 bg-green-50'
  };
  return colors[tier as keyof typeof colors] || colors.bronze;
};

export const getTierIcon = (tier: string): string => {
  const icons = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
    diamond: '💠',
    shareholder: '🏛️'
  };
  return icons[tier as keyof typeof icons] || icons.bronze;
};

export const formatPoints = (points: number): string => {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  } else if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`;
  }
  return points.toString();
};

export const getStatusColor = (status: string): string => {
  const colors = {
    pending: 'text-yellow-600 bg-yellow-50',
    qualified: 'text-blue-600 bg-blue-50',
    rewarded: 'text-green-600 bg-green-50',
    expired: 'text-red-600 bg-red-50'
  };
  return colors[status as keyof typeof colors] || colors.pending;
};

export const calculateEquityValue = (shares: number, sharePrice: number): number => {
  return shares * sharePrice;
};

export const formatEquityPercentage = (percentage: number): string => {
  if (percentage < 0.001) {
    return '<0.001%';
  }
  return `${percentage.toFixed(3)}%`;
};
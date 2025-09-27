import axios from '@/utils/axios';

export interface UserInvestment {
  _id: string;
  user: string;
  investmentPlan: {
    _id: string;
    name: string;
    description: string;
    profitPercentage: number;
    duration: number;
  };
  amount: number;
  status: 'pending' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  totalProfitsEarned: number;
  availableBalance: number;
  dailyProfitRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyProfit {
  _id: string;
  userInvestment: string;
  user: string;
  date: string;
  profitAmount: number;
  status: 'calculated' | 'paid' | 'failed';
  createdAt: string;
}

export interface ProfitHistory {
  date: string;
  profitAmount: number;
  status: string;
  cumulativeProfit: number;
}

export interface InvestmentSummary {
  totalInvested: number;
  totalProfits: number;
  totalInvestments: number;
  activeInvestments: number;
  completedInvestments: number;
  availableBalance: number;
  profitToday: number;
}

/**
 * Get user's investment summary
 */
export const getUserInvestmentSummary = async (): Promise<InvestmentSummary> => {
  try {
    const response = await axios.get('/api/user/investments');
    return response.data.summary;
  } catch (error) {
    console.error('Failed to fetch investment summary:', error);
    throw error;
  }
};

/**
 * Get user's active investments
 */
export const getUserInvestments = async (): Promise<UserInvestment[]> => {
  try {
    const response = await axios.get('/api/user/investments');
    return response.data.investments || [];
  } catch (error) {
    console.error('Failed to fetch user investments:', error);
    throw error;
  }
};

/**
 * Get profit history for user's investments
 */
export const getUserProfitHistory = async (days = 30): Promise<ProfitHistory[]> => {
  try {
    const response = await axios.get(`/api/user/dashboard/profits?days=${days}`);
    return response.data.chartData || [];
  } catch (error) {
    console.error('Failed to fetch profit history:', error);
    throw error;
  }
};

/**
 * Get daily profits for a specific investment
 */
export const getInvestmentProfitHistory = async (investmentId: string, days = 30): Promise<DailyProfit[]> => {
  try {
    const response = await axios.get(`/api/user/investments/${investmentId}?days=${days}`);
    return response.data.profitHistory || [];
  } catch (error) {
    console.error('Failed to fetch investment profit history:', error);
    throw error;
  }
};

/**
 * Get complete profit dashboard data
 */
export const getProfitDashboard = async (days = 30) => {
  try {
    const response = await axios.get(`/api/user/dashboard/profits?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch profit dashboard:', error);
    throw error;
  }
};

/**
 * Get user's withdrawal requests
 */
export const getUserWithdrawals = async () => {
  try {
    const response = await axios.get('/investment/withdrawals');
    return response.data.withdrawals || [];
  } catch (error) {
    console.error('Failed to fetch withdrawals:', error);
    throw error;
  }
};

/**
 * Request withdrawal
 */
export const requestWithdrawal = async (data: {
  investmentId: string;
  withdrawalType: 'profits_only' | 'full_withdrawal';
  requestedAmount?: number;
  reason?: string;
}) => {
  try {
    const response = await axios.post('/investment/request-withdrawal', data);
    return response.data;
  } catch (error) {
    console.error('Failed to request withdrawal:', error);
    throw error;
  }
};
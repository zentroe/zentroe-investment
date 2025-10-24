import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  getUserInvestments,
  getUserInvestmentSummary,
  getProfitDashboard,
  UserInvestment as ServiceUserInvestment,
  InvestmentSummary as ServiceInvestmentSummary
} from '@/services/userInvestmentService';
import { getUserPaymentHistory } from '@/services/paymentService';
import { getReferralDashboard, ReferralDashboard } from '@/services/referralService';
import axios from '@/utils/axios';
import { useAuth } from './AuthContext';

// User Profile Interface - Comprehensive matching backend User model
export interface UserProfile {
  _id: string;

  // Core Authentication
  email: string;
  isEmailVerified: boolean;
  walletBalance: number;
  role: 'user' | 'admin';

  // Personal Information
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;

  // Residence and Citizenship
  countryOfResidence?: string;
  countryOfCitizenship?: string;

  // Address Information
  address?: {
    street?: string;
    street2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };

  // Identity Verification
  socialSecurityNumber?: string;
  ssn?: string;

  // Account Setup
  accountType?: 'general' | 'retirement';
  accountSubType?: 'individual' | 'joint' | 'trust' | 'other';

  // Investment Profile
  initialInvestmentAmount?: number;
  annualInvestmentAmount?: string;
  annualIncome?: string;
  netWorth?: string;
  investmentExperience?: 'none' | 'limited' | 'moderate' | 'extensive';
  investmentGoal?: 'diversification' | 'fixed_income' | 'venture_capital' | 'growth' | 'income';
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  portfolioPriority?: 'long_term' | 'short_term' | 'balanced';
  investmentTimeHorizon?: '1-3 years' | '3-5 years' | '5-10 years' | '10+ years';

  // Preferences
  referralSource?: string;
  selectedInvestmentPlan?: string; // ObjectId as string
  recommendedPortfolio?: string;
  recurringInvestment?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly';
  recurringDay?: string;
  recurringAmount?: number;

  // Compliance & Verification
  isAccreditedInvestor?: boolean;
  employmentStatus?: 'employed' | 'self-employed' | 'unemployed' | 'retired' | 'student';
  employer?: string;
  politicallyExposed?: boolean;

  // Onboarding Progress
  onboardingStatus: 'started' | 'basicInfo' | 'investmentProfile' | 'verification' | 'bankConnected' | 'completed';

  // Platform Activity
  lastLogin?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Re-export service types
export type UserInvestment = ServiceUserInvestment;
export type InvestmentSummary = ServiceInvestmentSummary;

// Payment Interfaces
export interface PaymentItem {
  _id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'approved' | 'rejected';
  paymentMethod: string;
  createdAt: string;
  type: 'deposit' | 'card_payment';
}

export interface PaymentHistory {
  payments: PaymentItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Dashboard Stats Interface
export interface DashboardStats {
  totalProfits: number;
  totalInvestments: number;
  activeInvestments: number;
  totalInvested: number;
  avgDailyProfit: number;
  profitDays: number;
}

// User Context Interface
interface UserContextType {
  // User Profile
  user: UserProfile | null;

  // Investment Data
  investments: UserInvestment[];
  investmentSummary: InvestmentSummary | null;
  dashboardStats: DashboardStats | null;

  // Payment Data
  paymentHistory: PaymentHistory | null;

  // Referral Data
  referralData: ReferralDashboard | null;

  // Loading States
  loading: {
    user: boolean;
    investments: boolean;
    payments: boolean;
    dashboardStats: boolean;
    referrals: boolean;
  };

  // Error States
  errors: {
    user: string | null;
    investments: string | null;
    payments: string | null;
    dashboardStats: string | null;
    referrals: string | null;
  };

  // Refresh Functions
  refreshUser: () => Promise<void>;
  refreshInvestments: () => Promise<void>;
  refreshPayments: () => Promise<void>;
  refreshDashboardStats: () => Promise<void>;
  refreshReferrals: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Update Functions
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  clearUserData: () => void;
}

// Create Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// User Provider Props
interface UserProviderProps {
  children: ReactNode;
}

// Initial loading state
const initialLoading = {
  user: true,
  investments: true,
  payments: true,
  dashboardStats: true,
  referrals: true,
};

// Initial error state
const initialErrors = {
  user: null as string | null,
  investments: null as string | null,
  payments: null as string | null,
  dashboardStats: null as string | null,
  referrals: null as string | null,
};

// User Provider Component
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  // State Management
  const [user, setUser] = useState<UserProfile | null>(null);
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [investmentSummary, setInvestmentSummary] = useState<InvestmentSummary | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory | null>(null);
  const [referralData, setReferralData] = useState<ReferralDashboard | null>(null);
  const [loading, setLoading] = useState(initialLoading);
  const [errors, setErrors] = useState(initialErrors);
  const { isAuthenticated } = useAuth();

  // Fetch User Profile
  const fetchUser = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, user: true }));
      setErrors(prev => ({ ...prev, user: null }));

      const response = await axios.get('/auth/profile');
      setUser(response.data); // Direct response data, not nested
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setErrors(prev => ({ ...prev, user: 'Failed to load user profile' }));
    } finally {
      setLoading(prev => ({ ...prev, user: false }));
    }
  }, []);

  // Fetch Investment Data
  const fetchInvestments = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, investments: true }));
      setErrors(prev => ({ ...prev, investments: null }));

      console.log('UserContext - Fetching investment data...');
      const [investmentsData, summaryData] = await Promise.all([
        getUserInvestments(),
        getUserInvestmentSummary()
      ]);

      console.log('UserContext - Investments data:', investmentsData);
      console.log('UserContext - Summary data:', summaryData);

      setInvestments(investmentsData);
      setInvestmentSummary(summaryData);
    } catch (error) {
      console.error('Failed to fetch investment data:', error);
      setErrors(prev => ({ ...prev, investments: 'Failed to load investment data' }));
    } finally {
      setLoading(prev => ({ ...prev, investments: false }));
    }
  }, []);

  // Fetch Payment History
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, payments: true }));
      setErrors(prev => ({ ...prev, payments: null }));

      const paymentsData = await getUserPaymentHistory();
      setPaymentHistory(paymentsData);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      setErrors(prev => ({ ...prev, payments: 'Failed to load payment history' }));
    } finally {
      setLoading(prev => ({ ...prev, payments: false }));
    }
  }, []);

  // Fetch Dashboard Stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, dashboardStats: true }));
      setErrors(prev => ({ ...prev, dashboardStats: null }));

      const statsData = await getProfitDashboard(30);
      setDashboardStats(statsData.summary);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setErrors(prev => ({ ...prev, dashboardStats: 'Failed to load dashboard stats' }));
    } finally {
      setLoading(prev => ({ ...prev, dashboardStats: false }));
    }
  }, []);

  // Fetch Referral Data
  const fetchReferralData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, referrals: true }));
      setErrors(prev => ({ ...prev, referrals: null }));

      const referrals = await getReferralDashboard();
      setReferralData(referrals);
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      setErrors(prev => ({ ...prev, referrals: 'Failed to load referral data' }));
    } finally {
      setLoading(prev => ({ ...prev, referrals: false }));
    }
  }, []);

  // Refresh Functions
  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const refreshInvestments = useCallback(async () => {
    await fetchInvestments();
  }, [fetchInvestments]);

  const refreshPayments = useCallback(async () => {
    await fetchPayments();
  }, [fetchPayments]);

  const refreshDashboardStats = useCallback(async () => {
    await fetchDashboardStats();
  }, [fetchDashboardStats]);

  const refreshReferrals = useCallback(async () => {
    await fetchReferralData();
  }, [fetchReferralData]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchUser(),
      fetchInvestments(),
      fetchPayments(),
      fetchDashboardStats(),
      fetchReferralData()
    ]);
  }, [fetchUser, fetchInvestments, fetchPayments, fetchDashboardStats, fetchReferralData]);

  // Update User Profile
  // Update User Profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      const response = await axios.patch('/auth/profile', updates);
      setUser(response.data); // Update with response from server
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error; // Re-throw to allow component to handle error
    }
  };

  // Clear User Data
  const clearUserData = useCallback(() => {
    setUser(null);
    setInvestments([]);
    setInvestmentSummary(null);
    setDashboardStats(null);
    setPaymentHistory(null);
    setReferralData(null);
    setLoading(initialLoading);
    setErrors(initialErrors);
  }, []);

  // Fetch data whenever authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('UserContext - Authenticated, fetching data...');
      refreshAll().catch((error) => {
        console.error('UserContext - Failed to refresh data after authentication:', error);
      });
    } else {
      console.log('UserContext - Not authenticated, clearing cached data');
      clearUserData();
    }
  }, [isAuthenticated, refreshAll, clearUserData]);

  // Context Value
  const contextValue: UserContextType = {
    // User Profile
    user,

    // Investment Data
    investments,
    investmentSummary,
    dashboardStats,

    // Payment Data
    paymentHistory,

    // Referral Data
    referralData,

    // Loading States
    loading,

    // Error States
    errors,

    // Refresh Functions
    refreshUser,
    refreshInvestments,
    refreshPayments,
    refreshDashboardStats,
    refreshReferrals,
    refreshAll,

    // Update Functions
    updateUserProfile,
    clearUserData,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook to Use User Context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Export Context for Advanced Usage
export { UserContext };
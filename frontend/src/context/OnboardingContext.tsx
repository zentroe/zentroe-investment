import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserOnboardingData, updateOnboardingStatus } from '@/services/onboardingService';
import { useAuth } from '@/context/AuthContext';

// Define the shape of user onboarding data
export interface OnboardingData {
  // Basic Info
  email?: string;
  firstName?: string;
  lastName?: string;
  accountType?: 'general' | 'retirement';
  accountSubType?: 'individual' | 'joint' | 'trust' | 'other';

  // Personal Information
  phone?: string;
  countryOfResidence?: string;
  countryOfCitizenship?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    street2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  socialSecurityNumber?: string;
  ssn?: string;

  // Investment Profile
  portfolioPriority?: 'long_term' | 'short_term' | 'balanced';
  investmentGoal?: 'diversification' | 'fixed_income' | 'venture_capital' | 'growth' | 'income';
  annualIncome?: string;
  annualInvestmentAmount?: string;
  referralSource?: string;
  recommendedPortfolio?: string;

  // Investment Setup
  initialInvestmentAmount?: number;
  recurringInvestment?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly';
  recurringDay?: string;
  recurringAmount?: number;

  // Progress Status
  onboardingStatus?: 'started' | 'basicInfo' | 'investmentProfile' | 'verification' | 'bankConnected' | 'completed';
}

interface OnboardingContextType {
  // Data
  data: OnboardingData;

  // Loading states
  loading: boolean;
  error: string | null;

  // Methods
  refreshData: () => Promise<void>;
  updateLocalData: (updates: Partial<OnboardingData>) => void;
  updateStatus: (status: OnboardingData['onboardingStatus']) => Promise<void>;

  // Progress methods
  getProgressPercentage: () => number;
  getCurrentStepName: () => string;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [data, setData] = useState<OnboardingData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateUser } = useAuth();

  // Fetch user onboarding data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserOnboardingData();
      setData(response.user || {});
    } catch (err: any) {
      console.error('Error fetching onboarding data:', err);
      setError(err.response?.data?.message || 'Failed to load onboarding data');
      // Don't throw error - just set error state so app continues working
    } finally {
      setLoading(false);
    }
  };

  // Refresh data (public method)
  const refreshData = async () => {
    await fetchData();
  };

  // Update local data without API call (for optimistic updates)
  const updateLocalData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  // Update onboarding status (milestone tracking)
  const updateStatus = async (status: OnboardingData['onboardingStatus']) => {
    if (!status) return;

    try {
      await updateOnboardingStatus(status);
      // Update local data after successful API call
      updateLocalData({ onboardingStatus: status });
      // Also update the AuthContext so the user object has the latest status
      updateUser({ onboardingStatus: status });
      console.log('✅ Updated both OnboardingContext and AuthContext with status:', status);
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      // Don't throw error - just log it so app continues working
    }
  };

  // Get progress percentage based on onboarding status
  const getProgressPercentage = (): number => {
    const status = data.onboardingStatus;
    switch (status) {
      case 'started': return 10;
      case 'basicInfo': return 25;
      case 'investmentProfile': return 50;
      case 'verification': return 75;
      case 'bankConnected': return 90;
      case 'completed': return 100;
      default: return 0;
    }
  };

  // Get current step name based on onboarding status
  const getCurrentStepName = (): string => {
    const status = data.onboardingStatus;
    switch (status) {
      case 'started': return 'Getting Started';
      case 'basicInfo': return 'Basic Information';
      case 'investmentProfile': return 'Investment Profile';
      case 'verification': return 'Identity Verification';
      case 'bankConnected': return 'Bank Connection';
      case 'completed': return 'Complete';
      default: return 'Not Started';
    }
  };

  // Fetch data on mount
  useEffect(() => {
    // We're using cookie-based auth, so we should always try to fetch data
    // since cookies are sent automatically with axios requests
    fetchData();
  }, []);

  const value: OnboardingContextType = {
    data,
    loading,
    error,
    refreshData,
    updateLocalData,
    updateStatus,
    getProgressPercentage,
    getCurrentStepName,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

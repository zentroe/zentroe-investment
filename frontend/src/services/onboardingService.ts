import axios from '@/utils/axios';

/**
 * Onboarding Service
 * User data fetching + Individual API calls for each onboarding step
 */

// Get User Onboarding Data (for context)
export const getUserOnboardingData = async () => {
  try {
    const response = await axios.get('/onboarding/user-data');
    return response.data;
  } catch (error) {
    console.error('Error fetching user onboarding data:', error);
    throw error;
  }
};

// Account Type Service
export const saveAccountType = async (accountType: 'general' | 'retirement') => {
  try {
    const response = await axios.patch('/onboarding/account-type', {
      accountType
    });
    return response.data;
  } catch (error) {
    console.error('Error saving account type:', error);
    throw error;
  }
};

// Portfolio Priority Service (Most Important page)
export const savePortfolioPriority = async (portfolioPriority: 'long_term' | 'short_term' | 'balanced') => {
  try {
    const response = await axios.patch('/onboarding/portfolio-priority', {
      portfolioPriority
    });
    return response.data;
  } catch (error) {
    console.error('Error saving portfolio priority:', error);
    throw error;
  }
};

// Investment Goal Service (Primary Goal page)
export const saveInvestmentGoal = async (investmentGoal: 'diversification' | 'fixed_income' | 'venture_capital' | 'growth' | 'income') => {
  try {
    const response = await axios.patch('/onboarding/investment-goal', {
      investmentGoal
    });
    return response.data;
  } catch (error) {
    console.error('Error saving investment goal:', error);
    throw error;
  }
};

// Annual Income Service
export const saveAnnualIncome = async (annualIncome: string) => {
  try {
    const response = await axios.patch('/onboarding/annual-income', {
      annualIncome
    });
    return response.data;
  } catch (error) {
    console.error('Error saving annual income:', error);
    throw error;
  }
};

// Annual Investment Amount Service (Amount Choice page)
export const saveAnnualInvestmentAmount = async (annualInvestmentAmount: string) => {
  try {
    const response = await axios.patch('/onboarding/annual-investment-amount', {
      annualInvestmentAmount
    });
    return response.data;
  } catch (error) {
    console.error('Error saving annual investment amount:', error);
    throw error;
  }
};

// Referral Source Service (How Did You Hear page)
export const saveReferralSource = async (referralSource: string) => {
  try {
    const response = await axios.patch("/onboarding/referral-source", {
      referralSource,
    });
    return response.data;
  } catch (error) {
    console.error('Error saving referral source:', error);
    throw error;
  }
};

// Recommended Portfolio Service
export const saveRecommendedPortfolio = async (recommendedPortfolio: string) => {
  try {
    const response = await axios.patch("/onboarding/recommended-portfolio", {
      recommendedPortfolio,
    });
    return response.data;
  } catch (error) {
    console.error('Error saving recommended portfolio:', error);
    throw error;
  }
};

// Account Sub Type Service (Select Account Type page)
export const saveAccountSubType = async (accountSubType: string) => {
  try {
    const response = await axios.patch("/onboarding/account-sub-type", {
      accountSubType,
    });
    return response.data;
  } catch (error) {
    console.error('Error saving account sub type:', error);
    throw error;
  }
};

// Personal Info Service (Legal Name page)
export const savePersonalInfo = async (firstName: string, lastName: string) => {
  try {
    const response = await axios.patch("/onboarding/personal-info", {
      firstName,
      lastName,
    });
    return response.data;
  } catch (error) {
    console.error('Error saving personal info:', error);
    throw error;
  }
};

// Onboarding Status Service (for milestone tracking)
export const updateOnboardingStatus = async (status: 'started' | 'basicInfo' | 'investmentProfile' | 'verification' | 'bankConnected' | 'completed') => {
  try {
    const response = await axios.patch('/onboarding/status', {
      status
    });
    return response.data;
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    throw error;
  }
};

// Residence and Citizenship Service
export const saveResidenceAndCitizenship = async (countryOfResidence: string, countryOfCitizenship: string) => {
  try {
    const response = await axios.patch('/onboarding/residence-citizenship', {
      countryOfResidence,
      countryOfCitizenship
    });
    return response.data;
  } catch (error) {
    console.error('Error saving residence and citizenship:', error);
    throw error;
  }
};

// Phone Number Service
export const savePhoneNumber = async (phone: string) => {
  try {
    const response = await axios.patch('/onboarding/phone-number', {
      phone
    });
    return response.data;
  } catch (error) {
    console.error('Error saving phone number:', error);
    throw error;
  }
};

// Address Information Service
export const saveAddressInfo = async (addressData: {
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}) => {
  try {
    const response = await axios.patch('/onboarding/address-info', addressData);
    return response.data;
  } catch (error) {
    console.error('Error saving address information:', error);
    throw error;
  }
};

// Identity Information Service (SSN and Date of Birth)
export const saveIdentityInfo = async (socialSecurityNumber: string, dateOfBirth: string) => {
  try {
    const response = await axios.patch('/onboarding/identity-info', {
      socialSecurityNumber,
      dateOfBirth
    });
    return response.data;
  } catch (error) {
    console.error('Error saving identity information:', error);
    throw error;
  }
};

// Investment Plans Service - Get available investment plans for recommendations
export const getInvestmentPlans = async () => {
  try {
    console.log("🌐 Making request to /onboarding/investment-plans...");
    const response = await axios.get('/onboarding/investment-plans');
    console.log("✅ Response received:", response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching investment plans:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

// Interface for investment plan (matches backend)
export interface InvestmentPlan {
  _id: string;
  name: string;
  description: string;
  category: 'retirement' | 'starter' | 'highGrowth' | 'default';
  profitPercentage: number;
  duration: number;
  minInvestment: number;
  maxInvestment?: number;
  pieChartData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  supplementalTabs: {
    best: Array<{ title: string; desc: string }>;
    strategy: Array<{ title: string; desc: string }>;
    assets: Array<{ title: string; desc: string }>;
  };
  isActive: boolean;
  priority: number;
  targetIncomeRanges: string[];
  targetInvestmentAmounts: string[];
  targetAccountTypes: string[];
  createdAt: string;
  updatedAt: string;
}

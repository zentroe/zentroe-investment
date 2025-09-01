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

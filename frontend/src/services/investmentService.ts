import axios from '@/utils/axios';

/**
 * Investment Service
 * API calls for investment setup during onboarding
 */

// Save Initial Investment Amount
// investmentPlanId is OPTIONAL - only used for dashboard investments
// Onboarding flow doesn't need to pass it (uses recommendation)
export const saveInitialInvestmentAmount = async (
  initialInvestmentAmount: number,
  investmentPlanId?: string
) => {
  try {
    const payload: any = { initialInvestmentAmount };

    // Only include investmentPlanId if provided (dashboard flow)
    if (investmentPlanId) {
      payload.investmentPlanId = investmentPlanId;
    }

    const response = await axios.patch('/investment/setup/initial-amount', payload);
    return response.data;
  } catch (error) {
    console.error('Error saving initial investment amount:', error);
    throw error;
  }
};

// Save Recurring Investment Settings
export const saveRecurringInvestmentSettings = async (settings: {
  recurringInvestment: boolean;
  recurringFrequency?: string;
  recurringDay?: string;
  recurringAmount?: number;
}) => {
  try {
    const response = await axios.patch('/investment/setup/recurring-settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error saving recurring investment settings:', error);
    throw error;
  }
};

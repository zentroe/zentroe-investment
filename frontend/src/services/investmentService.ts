import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Investment Service
 * API calls for investment setup during onboarding
 */

// Save Initial Investment Amount
export const saveInitialInvestmentAmount = async (initialInvestmentAmount: number) => {
  try {
    const response = await api.patch('/investment/setup/initial-amount', {
      initialInvestmentAmount
    });
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
    const response = await api.patch('/investment/setup/recurring-settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error saving recurring investment settings:', error);
    throw error;
  }
};

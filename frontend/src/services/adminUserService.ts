import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export interface User {
  _id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  countryOfResidence?: string;
  countryOfCitizenship?: string;
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
  accountType?: string;
  accountSubType?: string;
  initialInvestmentAmount?: number;
  annualInvestmentAmount?: string;
  annualIncome?: string;
  netWorth?: string;
  investmentExperience?: string;
  investmentGoal?: string;
  riskTolerance?: string;
  portfolioPriority?: string;
  investmentTimeHorizon?: string;
  referralSource?: string;
  selectedInvestmentPlan?: any;
  recommendedPortfolio?: string;
  recurringInvestment?: boolean;
  recurringFrequency?: string;
  recurringDay?: string;
  recurringAmount?: number;
  isAccreditedInvestor?: boolean;
  employmentStatus?: string;
  employer?: string;
  politicallyExposed?: boolean;
  kyc?: {
    status: string;
    submittedAt?: string;
    reviewedAt?: string;
    notes?: string;
  };
  isActive?: boolean;
  onboardingStatus?: string;
  lastLogin?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  referralCode?: string;
  referredBy?: any;
  referralStats?: {
    totalReferred: number;
    qualifiedReferrals: number;
    totalPointsEarned: number;
    currentTier: string;
  };
  walletBalance?: number;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Activity {
  _id: string;
  userId: string;
  activityType: string;
  date: string;
  description: string;
  amount?: number;
  currency?: string;
  transactionId?: string;
  status?: string;
  paymentMethod?: string;
  bankAccount?: string;
  investmentPlanId?: string;
  investmentPlanName?: string;
  portfolioType?: string;
  shares?: number;
  referredUserId?: string;
  referredUserName?: string;
  referredUserEmail?: string;
  referralBonus?: number;
  returnPercentage?: number;
  principalAmount?: number;
  kycStatus?: string;
  ipAddress?: string;
  device?: string;
  location?: string;
  notes?: string;
  isGenerated?: boolean;
  generatedAt?: string;
  editedBy?: string;
  editedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get complete user details
export const getAdminUserDetails = async (userId: string) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

// Update user details
export const updateAdminUserDetails = async (userId: string, userData: Partial<User>) => {
  const response = await api.put(`/admin/users/${userId}`, userData);
  return response.data;
};

// Generate activity history
export const generateUserActivity = async (userId: string, years: number, activityConfig?: any) => {
  const response = await api.post(`/admin/users/${userId}/generate-activity`, {
    years,
    activityConfig
  });
  return response.data;
};

// Get user activity history
export const getUserActivity = async (
  userId: string,
  params?: {
    page?: number;
    limit?: number;
    activityType?: string;
    startDate?: string;
    endDate?: string;
  }
) => {
  const response = await api.get(`/admin/users/${userId}/activity`, { params });
  return response.data;
};

// Get activity statistics
export const getActivityStats = async (userId: string) => {
  const response = await api.get(`/admin/users/${userId}/activity/stats`);
  return response.data;
};

// Create single activity
export const createActivity = async (userId: string, activityData: Partial<Activity>) => {
  const response = await api.post(`/admin/users/${userId}/activity`, activityData);
  return response.data;
};

// Update activity
export const updateActivity = async (activityId: string, activityData: Partial<Activity>) => {
  const response = await api.put(`/admin/activity/${activityId}`, activityData);
  return response.data;
};

// Delete activity
export const deleteActivity = async (activityId: string) => {
  const response = await api.delete(`/admin/activity/${activityId}`);
  return response.data;
};

// Delete all generated activities
export const deleteGeneratedActivities = async (userId: string) => {
  const response = await api.delete(`/admin/users/${userId}/generated-activities`);
  return response.data;
};

// Delete user and all associated data
export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

// Get user details (for cloning)
export const getUserDetails = async (userId: string) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

// Create new user (admin-created)
export const createUser = async (userData: Partial<User>) => {
  const response = await api.post('/admin/users', userData);
  return response.data;
};

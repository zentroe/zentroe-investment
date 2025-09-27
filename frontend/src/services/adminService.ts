import axios from '@/utils/axios';

/**
 * Admin Service
 * All admin-related API calls including authentication, payment management, and system configuration
 */

// ===== ADMIN AUTHENTICATION =====

export const adminLogin = async (email: string, password: string) => {
  try {
    const response = await axios.post('/admin/login', {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Error logging in admin:', error);
    throw error;
  }
};

export const adminLogout = async () => {
  try {
    const response = await axios.post('/admin/logout');
    return response.data;
  } catch (error) {
    console.error('Error logging out admin:', error);
    throw error;
  }
};

export const getAdminProfile = async () => {
  try {
    const response = await axios.get('/admin/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    throw error;
  }
};

export const createAdmin = async (adminData: {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'super_admin';
}) => {
  try {
    const response = await axios.post('/admin/create-admin', adminData);
    return response.data;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};

// ===== PAYMENT CONFIGURATION =====

export const getPaymentConfig = async () => {
  try {
    const response = await axios.get('/admin/payments/config');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment config:', error);
    throw error;
  }
};

export const updatePaymentConfig = async (config: {
  cryptoEnabled?: boolean;
  bankTransferEnabled?: boolean;
  cardPaymentEnabled?: boolean;
}) => {
  try {
    const response = await axios.put('/admin/payments/config', config);
    return response.data;
  } catch (error) {
    console.error('Error updating payment config:', error);
    throw error;
  }
};

// ===== CRYPTO WALLET MANAGEMENT =====

export const getCryptoWallets = async () => {
  try {
    const response = await axios.get('/admin/payments/crypto-wallets');
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto wallets:', error);
    throw error;
  }
};

export const createCryptoWallet = async (walletData: {
  name: string;
  address: string;
  network: string;
  icon?: string;
}) => {
  try {
    const response = await axios.post('/admin/payments/crypto-wallets', walletData);
    return response.data;
  } catch (error) {
    console.error('Error creating crypto wallet:', error);
    throw error;
  }
};

export const updateCryptoWallet = async (id: string, walletData: {
  name?: string;
  address?: string;
  network?: string;
  icon?: string;
  active?: boolean;
}) => {
  try {
    const response = await axios.put(`/admin/payments/crypto-wallets/${id}`, walletData);
    return response.data;
  } catch (error) {
    console.error('Error updating crypto wallet:', error);
    throw error;
  }
};

export const deleteCryptoWallet = async (id: string) => {
  try {
    const response = await axios.delete(`/admin/payments/crypto-wallets/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting crypto wallet:', error);
    throw error;
  }
};

// ===== BANK ACCOUNT MANAGEMENT =====

export const getBankAccounts = async () => {
  try {
    const response = await axios.get('/admin/payments/bank-accounts');
    return response.data;
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    throw error;
  }
};

export const createBankAccount = async (bankData: {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  instructions?: string;
}) => {
  try {
    const response = await axios.post('/admin/payments/bank-accounts', bankData);
    return response.data;
  } catch (error) {
    console.error('Error creating bank account:', error);
    throw error;
  }
};

export const updateBankAccount = async (id: string, bankData: {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  instructions?: string;
  active?: boolean;
}) => {
  try {
    const response = await axios.put(`/admin/payments/bank-accounts/${id}`, bankData);
    return response.data;
  } catch (error) {
    console.error('Error updating bank account:', error);
    throw error;
  }
};

export const deleteBankAccount = async (id: string) => {
  try {
    const response = await axios.delete(`/admin/payments/bank-accounts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting bank account:', error);
    throw error;
  }
};

// ===== DEPOSIT MANAGEMENT =====

export const getAllDeposits = async (filters?: {
  status?: 'pending' | 'approved' | 'rejected';
  paymentMethod?: 'crypto' | 'bank_transfer' | 'card';
  limit?: number;
  offset?: number;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await axios.get(`/admin/payments/deposits?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching deposits:', error);
    throw error;
  }
};

export const updateDepositStatus = async (id: string, statusData: {
  status: 'approved' | 'rejected';
  adminNotes?: string;
}) => {
  try {
    const response = await axios.put(`/admin/payments/deposits/${id}/status`, statusData);
    return response.data;
  } catch (error) {
    console.error('Error updating deposit status:', error);
    throw error;
  }
};

// ===== CARD PAYMENT MANAGEMENT =====

export const getAllCardPayments = async (filters?: {
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'disputed';
  limit?: number;
  offset?: number;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await axios.get(`/admin/payments/card-payments?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching card payments:', error);
    throw error;
  }
};

export const updateCardPaymentStatus = async (id: string, statusData: {
  processingStatus: 'processing' | 'completed' | 'failed' | 'disputed';
  processingNotes?: string;
}) => {
  try {
    const response = await axios.put(`/admin/payments/card-payments/${id}/status`, statusData);
    return response.data;
  } catch (error) {
    console.error('Error updating card payment status:', error);
    throw error;
  }
};

// ===== DASHBOARD ANALYTICS =====

export const getDashboardStats = async () => {
  try {
    const response = await axios.get('/admin/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getRecentActivity = async (limit: number = 10) => {
  try {
    const response = await axios.get(`/admin/dashboard/recent-activity?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
};

// ===== UTILITY FUNCTIONS =====

export const uploadFile = async (file: File, folder: string = 'admin-uploads') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await axios.post('/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// ===== INVESTMENT PLAN MANAGEMENT =====

export const createInvestmentPlan = async (planData: any) => {
  try {
    const response = await axios.post('/admin/investment-plans', planData);
    return response.data;
  } catch (error) {
    console.error('Error creating investment plan:', error);
    throw error;
  }
};

export const getAllInvestmentPlans = async (filters?: { category?: string; isActive?: boolean }) => {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const response = await axios.get(`/admin/investment-plans?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching investment plans:', error);
    throw error;
  }
};

export const getInvestmentPlanById = async (id: string) => {
  try {
    const response = await axios.get(`/admin/investment-plans/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching investment plan:', error);
    throw error;
  }
};

export const updateInvestmentPlan = async (id: string, planData: any) => {
  try {
    const response = await axios.put(`/admin/investment-plans/${id}`, planData);
    return response.data;
  } catch (error) {
    console.error('Error updating investment plan:', error);
    throw error;
  }
};

export const deleteInvestmentPlan = async (id: string) => {
  try {
    const response = await axios.delete(`/admin/investment-plans/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting investment plan:', error);
    throw error;
  }
};

export const toggleInvestmentPlanStatus = async (id: string) => {
  try {
    const response = await axios.patch(`/admin/investment-plans/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('Error toggling investment plan status:', error);
    throw error;
  }
};

// ===== TYPE DEFINITIONS =====

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentConfig {
  cryptoEnabled: boolean;
  bankTransferEnabled: boolean;
  cardPaymentEnabled: boolean;
}

export interface CryptoWallet {
  _id: string;
  name: string;
  address: string;
  network: string;
  icon?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  _id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  instructions?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Deposit {
  _id: string;
  userId: string;
  paymentMethod: 'crypto' | 'bank_transfer' | 'card';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  proofOfPayment?: string;
  adminNotes?: string;
  cryptoWallet?: string;
  bankAccount?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardPayment {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  transactionId: string;
  processingMethod: 'manual' | 'api' | 'bank_transfer';
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'disputed';
  processingNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalDeposits: number;
  pendingDeposits: number;
  approvedDeposits: number;
  rejectedDeposits: number;
  totalCardPayments: number;
  pendingCardPayments: number;
  cryptoPayments: number;
  bankTransfers: number;
  cardPayments: number;
  totalAmount: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface TabContent {
  title: string;
  desc: string;
}

export interface SupplementalTabs {
  best: TabContent[];
  strategy: TabContent[];
  assets: TabContent[];
}

export interface InvestmentPlan {
  _id: string;
  name: string;
  description: string;
  category: 'retirement' | 'starter' | 'highGrowth' | 'default';
  profitPercentage: number;
  duration: number; // Investment duration in days
  minInvestment: number;
  maxInvestment?: number;
  pieChartData: PieChartData[];
  supplementalTabs: SupplementalTabs;
  isActive: boolean;
  priority: number;
  targetIncomeRanges: string[];
  targetInvestmentAmounts: string[];
  targetAccountTypes: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ===== USER MANAGEMENT =====

export interface AdminUserData {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  kyc: {
    status: 'pending' | 'approved' | 'rejected';
    submittedAt?: string;
    reviewedAt?: string;
    reviewedBy?: string;
  };
  totalInvested: number;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  onboardingStatus: string;
  role: string;
  referralStats?: {
    totalReferred: number;
    qualifiedReferrals: number;
    totalPointsEarned: number;
    currentTier: string;
  };
}

export const getAllUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  kycStatus?: string;
}) => {
  try {
    const response = await axios.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

export const getUserById = async (userId: string) => {
  try {
    const response = await axios.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

export const toggleUserStatus = async (userId: string) => {
  try {
    const response = await axios.patch(`/admin/users/${userId}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
};

export const updateKycStatus = async (userId: string, status: 'approved' | 'rejected', notes?: string) => {
  try {
    const response = await axios.patch(`/admin/users/${userId}/kyc-status`, {
      status,
      notes
    });
    return response.data;
  } catch (error) {
    console.error('Error updating KYC status:', error);
    throw error;
  }
};

export const getUserInvestments = async (userId: string) => {
  try {
    const response = await axios.get(`/admin/users/${userId}/investments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user investments:', error);
    throw error;
  }
};

// ===== MANUAL INVESTMENT CREATION =====

export const startInvestmentFromDeposit = async (depositId: string) => {
  try {
    const response = await axios.post(`/admin/payments/deposits/${depositId}/start-investment`);
    return response.data;
  } catch (error) {
    console.error('Error starting investment from deposit:', error);
    throw error;
  }
};

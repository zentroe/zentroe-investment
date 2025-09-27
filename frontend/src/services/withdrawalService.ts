import axios from '@/utils/axios';

/**
 * Withdrawal Service
 * API calls for withdrawal management
 */

// Types
export interface WithdrawalEligibility {
  canWithdraw: boolean;
  availableAmount: number;
  maxProfitsWithdraw: number;
  maxPrincipalWithdraw: number;
  errors: string[];
  investmentStatus: string;
  daysUntilFullWithdrawal: number;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  swiftCode?: string;
}

export interface CryptoDetails {
  walletAddress: string;
  network: string;
  currency: string;
}

export interface CheckDetails {
  mailingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface PaymentDetails {
  bankDetails?: BankDetails;
  cryptoDetails?: CryptoDetails;
  checkDetails?: CheckDetails;
}

export interface WithdrawalRequest {
  userInvestmentId: string;
  amount: number;
  type: 'profits_only' | 'full_withdrawal' | 'partial_principal';
  paymentMethod: 'bank_transfer' | 'crypto' | 'check';
  paymentDetails: PaymentDetails;
  reason?: string;
}

export interface Withdrawal {
  _id: string;
  user: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  userInvestment: {
    _id: string;
    amount: number;
    startDate: string;
    endDate: string;
    status: string;
  };
  amount: number;
  type: 'profits_only' | 'full_withdrawal' | 'partial_principal';
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  paymentMethod: 'bank_transfer' | 'crypto' | 'check';
  paymentDetails: PaymentDetails;
  principalAmount: number;
  profitAmount: number;
  fees: number;
  netAmount: number;
  requestedAt: string;
  reviewedAt?: string;
  processedAt?: string;
  reviewedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  adminNotes?: string;
  rejectionReason?: string;
  transactionId?: string;
  reason?: string;
}

export interface InvestmentWithWithdrawal {
  _id: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  totalProfitsEarned: number;
  totalWithdrawn: number;
  profitsWithdrawn: number;
  principalWithdrawn: number;
  investmentPlan: {
    name: string;
    dailyProfitRate: number;
  };
  withdrawalEligibility: WithdrawalEligibility;
}

export interface WithdrawalHistory {
  withdrawals: Withdrawal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WithdrawalStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  completedRequests: number;
  totalWithdrawnAmount: number;
  thisMonthRequests: number;
  processingRate: string;
}

// API Functions

/**
 * Get user investments with withdrawal eligibility info
 */
export const getUserInvestmentsForWithdrawal = async (): Promise<InvestmentWithWithdrawal[]> => {
  try {
    const response = await axios.get('/withdrawals/investments');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching investments for withdrawal:', error);
    throw error;
  }
};

/**
 * Check withdrawal eligibility for specific investment
 */
export const checkWithdrawalEligibility = async (userInvestmentId: string): Promise<WithdrawalEligibility> => {
  try {
    const response = await axios.get(`/withdrawals/eligibility/${userInvestmentId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error checking withdrawal eligibility:', error);
    throw error;
  }
};

/**
 * Create a new withdrawal request
 */
export const createWithdrawalRequest = async (request: WithdrawalRequest): Promise<Withdrawal> => {
  try {
    const response = await axios.post('/withdrawals/request', request);
    return response.data.data;
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    throw error;
  }
};

/**
 * Get user's withdrawal history
 */
export const getUserWithdrawalHistory = async (page = 1, limit = 10): Promise<WithdrawalHistory> => {
  try {
    const response = await axios.get('/withdrawals/history', {
      params: { page, limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching withdrawal history:', error);
    throw error;
  }
};

/**
 * Cancel a pending withdrawal request
 */
export const cancelWithdrawalRequest = async (withdrawalId: string): Promise<Withdrawal> => {
  try {
    const response = await axios.patch(`/withdrawals/cancel/${withdrawalId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error cancelling withdrawal request:', error);
    throw error;
  }
};

// Admin API Functions

/**
 * Get all withdrawal requests (Admin)
 */
export const getAllWithdrawalRequests = async (
  page = 1,
  limit = 20,
  status?: string,
  userId?: string
): Promise<WithdrawalHistory> => {
  try {
    const params: any = { page, limit };
    if (status) params.status = status;
    if (userId) params.userId = userId;

    const response = await axios.get('/withdrawals/admin/all', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all withdrawal requests:', error);
    throw error;
  }
};

/**
 * Review withdrawal request (Admin)
 */
export const reviewWithdrawalRequest = async (
  withdrawalId: string,
  action: 'approve' | 'reject',
  adminNotes?: string,
  rejectionReason?: string
): Promise<Withdrawal> => {
  try {
    const response = await axios.patch(`/withdrawals/admin/review/${withdrawalId}`, {
      action,
      adminNotes,
      rejectionReason
    });
    return response.data.data;
  } catch (error) {
    console.error('Error reviewing withdrawal request:', error);
    throw error;
  }
};

/**
 * Process approved withdrawal (Admin)
 */
export const processWithdrawal = async (
  withdrawalId: string,
  transactionId: string
): Promise<Withdrawal> => {
  try {
    const response = await axios.patch(`/withdrawals/admin/process/${withdrawalId}`, {
      transactionId
    });
    return response.data.data;
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    throw error;
  }
};

/**
 * Get withdrawal statistics (Admin)
 */
export const getWithdrawalStatistics = async (): Promise<WithdrawalStatistics> => {
  try {
    const response = await axios.get('/withdrawals/admin/statistics');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching withdrawal statistics:', error);
    throw error;
  }
};
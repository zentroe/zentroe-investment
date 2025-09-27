import axios from '@/utils/axios';

/**
 * Payment Service
 * User-facing payment API calls for processing payments
 */

// ===== PAYMENT OPTIONS =====

export const getPaymentOptions = async () => {
  try {
    const response = await axios.get('/payments/options');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment options:', error);
    throw error;
  }
};

// ===== CRYPTO PAYMENTS =====

export const submitCryptoPayment = async (paymentData: {
  walletId: string;
  amount: number;
  proofOfPayment: string; // base64 image
}) => {
  try {
    const response = await axios.post('/payments/crypto', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error submitting crypto payment:', error);
    throw error;
  }
};

// ===== BANK TRANSFER PAYMENTS =====

export const submitBankTransferPayment = async (paymentData: {
  accountId: string;
  amount: number;
  proofOfPayment: string; // base64 image
}) => {
  try {
    const response = await axios.post('/payments/bank-transfer', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error submitting bank transfer payment:', error);
    throw error;
  }
};

// ===== CARD PAYMENTS =====

export const submitCardPayment = async (paymentData: {
  cardDetails: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    billingAddress: string;
  };
  amount: number;
  proofOfPayment?: string; // optional base64 image
}) => {
  try {
    const response = await axios.post('/payments/card', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error submitting card payment:', error);
    throw error;
  }
};

// ===== SIMPLE CARD PAYMENTS =====

export const submitSimpleCardPayment = async (paymentData: {
  amount: number;
  currency: string;
  cardDetails: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    holderName: string;
  };
}) => {
  try {
    const response = await axios.post('/payments/card/simple', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error submitting simple card payment:', error);
    throw error;
  }
};

export const requestCardPaymentOtp = async (paymentId: string) => {
  try {
    const response = await axios.post(`/payments/card/${paymentId}/request-otp`);
    return response.data;
  } catch (error) {
    console.error('Error requesting card payment OTP:', error);
    throw error;
  }
};

export const verifyCardPaymentOtp = async (paymentId: string, otpCode: string) => {
  try {
    const response = await axios.post(`/payments/card/${paymentId}/verify-otp`, { otpCode });
    return response.data;
  } catch (error) {
    console.error('Error verifying card payment OTP:', error);
    throw error;
  }
};

// ===== ADMIN CARD PAYMENT METHODS =====

export const getPendingCardPayments = async () => {
  try {
    console.log('Making request to /admin/payments/card-payments');
    const response = await axios.get('/admin/payments/card-payments');
    console.log('Raw response:', response);
    console.log('Response data:', response.data);
    console.log('Response status:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching pending card payments:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const getCardPaymentDetails = async (paymentId: string) => {
  try {
    const response = await axios.get(`/payments/card/${paymentId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching card payment details:', error);
    throw error;
  }
};

export const updateCardPaymentStatus = async (paymentId: string, status: string, notes?: string) => {
  try {
    const response = await axios.put(`/admin/payments/card-payments/${paymentId}/status`, { status, notes });
    return response.data;
  } catch (error) {
    console.error('Error updating card payment status:', error);
    throw error;
  }
};

export const adminRequestCardPaymentOtp = async (paymentId: string) => {
  try {
    const response = await axios.post(`/admin/payments/card-payments/${paymentId}/request-otp`);
    return response.data;
  } catch (error) {
    console.error('Error requesting OTP:', error);
    throw error;
  }
};

export const submitCardPaymentOtp = async (paymentId: string, otpCode: string) => {
  try {
    const response = await axios.post(`/payments/card/${paymentId}/verify-otp`, { otpCode });
    return response.data;
  } catch (error) {
    console.error('Error submitting OTP:', error);
    throw error;
  }
};

// ===== PAYMENT STATUS =====

export const getPaymentStatus = async (depositId: string) => {
  try {
    const response = await axios.get(`/payments/status/${depositId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw error;
  }
};

export const getUserDeposits = async (filters?: {
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

    const response = await axios.get(`/payments/user-deposits?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user deposits:', error);
    throw error;
  }
};

// ===== PAYMENT CREATION =====

export const createPayment = async (paymentData: {
  amount: number;
  currency: string;
  portfolioType?: string;
}) => {
  try {
    const response = await axios.post('/payments/create', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// ===== TYPE DEFINITIONS =====

export interface PaymentConfig {
  cryptoEnabled: boolean;
  bankTransferEnabled: boolean;
  cardPaymentEnabled: boolean;
}

export interface CryptoWallet {
  _id: string;
  name: string;
  icon: string;
  address: string;
  network: string;
}

export interface BankAccount {
  _id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  instructions?: string;
}

export interface PaymentOptions {
  config: PaymentConfig;
  cryptoWallets: CryptoWallet[];
  bankAccounts: BankAccount[];
}

export interface Deposit {
  _id: string;
  userId: string;
  paymentMethod: 'crypto' | 'bank_transfer' | 'card';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  proofOfPayment?: string;
  adminNotes?: string;
  cryptoWallet?: CryptoWallet;
  bankAccount?: BankAccount;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    depositId: string;
    status: string;
  };
}

// ===== PAYMENT HISTORY =====

interface PaymentHistoryItem {
  _id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'approved' | 'rejected';
  paymentMethod: string;
  createdAt: string;
  type: 'deposit' | 'card_payment';
}

interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Get user's payment history including deposits and card payments
 */
export const getUserPaymentHistory = async (page = 1, limit = 10): Promise<PaymentHistoryResponse> => {
  try {
    const response = await axios.get(`/payments/history?page=${page}&limit=${limit}`);

    // Transform the response to match the expected format
    const payments: PaymentHistoryItem[] = [];

    // Add deposits
    if (response.data.deposits) {
      response.data.deposits.forEach((deposit: any) => {
        payments.push({
          _id: deposit._id,
          amount: deposit.amount,
          currency: deposit.currency || 'USD',
          status: deposit.status,
          paymentMethod: deposit.paymentMethod || 'bank_transfer',
          createdAt: deposit.createdAt,
          type: 'deposit'
        });
      });
    }

    // Add card payments if they exist
    if (response.data.cardPayments) {
      response.data.cardPayments.forEach((cardPayment: any) => {
        payments.push({
          _id: cardPayment._id,
          amount: cardPayment.amount,
          currency: cardPayment.currency || 'USD',
          status: cardPayment.status,
          paymentMethod: 'card',
          createdAt: cardPayment.createdAt,
          type: 'card_payment'
        });
      });
    }

    // Sort by creation date (newest first)
    payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      payments,
      pagination: response.data.pagination
    };
  } catch (error) {
    console.error('Failed to fetch payment history:', error);
    throw error;
  }
};

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
    const response = await axios.get('/payments/card/admin/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending card payments:', error);
    throw error;
  }
};

export const getCardPaymentDetails = async (paymentId: string) => {
  try {
    const response = await axios.get(`/payments/card/admin/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching card payment details:', error);
    throw error;
  }
};

export const updateCardPaymentStatus = async (paymentId: string, status: string, notes?: string) => {
  try {
    const response = await axios.put(`/payments/card/admin/${paymentId}/status`, { status, notes });
    return response.data;
  } catch (error) {
    console.error('Error updating card payment status:', error);
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

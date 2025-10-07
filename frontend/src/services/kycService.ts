import axios from '@/utils/axios';

/**
 * KYC Service
 * API calls for KYC (Know Your Customer) verification
 */

// Types
export interface KYCDocument {
  _id: string;
  type: 'drivers_license' | 'passport';
  frontImageUrl: string;
  backImageUrl?: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface KYCStatus {
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  rejectionReason?: string;
  documents: KYCDocument[];
  notes?: string;
}

export interface KYCSubmissionData {
  documentType: 'drivers_license' | 'passport';
  frontImage: File;
  backImage?: File;
}

// API Functions

/**
 * Get user's KYC status and documents
 */
export const getUserKYCStatus = async (): Promise<KYCStatus> => {
  try {
    const response = await axios.get('/kyc/status');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching KYC status:', error);
    throw error;
  }
};

/**
 * Upload KYC documents
 */
export const uploadKYCDocument = async (data: {
  documentType: 'drivers_license' | 'passport';
  frontImage: string; // base64 data URL
  backImage?: string; // base64 data URL
}): Promise<KYCDocument> => {
  try {
    const response = await axios.post('/kyc/upload', data);
    return response.data.data;
  } catch (error) {
    console.error('Error uploading KYC document:', error);
    throw error;
  }
};

/**
 * Submit KYC documents for review
 */
export const submitKYCVerification = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post('/kyc/submit');
    return response.data;
  } catch (error) {
    console.error('Error submitting KYC verification:', error);
    throw error;
  }
};

/**
 * Delete a KYC document (if status is pending or rejected)
 */
export const deleteKYCDocument = async (documentId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete(`/kyc/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting KYC document:', error);
    throw error;
  }
};

// Admin API Functions

/**
 * Get all KYC submissions for admin review
 */
export const getAllKYCSubmissions = async (filters?: {
  status?: 'pending' | 'submitted' | 'approved' | 'rejected';
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{
  submissions: Array<{
    _id: string;
    user: {
      _id: string;
      firstName?: string;
      lastName?: string;
      email: string;
    };
    status: 'pending' | 'submitted' | 'approved' | 'rejected';
    documents: KYCDocument[];
    submittedAt?: string;
    reviewedAt?: string;
    reviewedBy?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    rejectionReason?: string;
    notes?: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await axios.get(`/admin/kyc/submissions?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching KYC submissions:', error);
    throw error;
  }
};

/**
 * Get specific KYC submission details for admin review
 */
export const getKYCSubmissionById = async (submissionId: string): Promise<{
  _id: string;
  user: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  };
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  documents: KYCDocument[];
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  rejectionReason?: string;
  notes?: string;
}> => {
  try {
    const response = await axios.get(`/admin/kyc/submissions/${submissionId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching KYC submission details:', error);
    throw error;
  }
};

/**
 * Review KYC submission (approve or reject)
 */
export const reviewKYCSubmission = async (
  submissionId: string,
  action: 'approve' | 'reject',
  rejectionReason?: string,
  notes?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(`/admin/kyc/review/${submissionId}`, {
      action,
      rejectionReason,
      notes
    });
    return response.data;
  } catch (error) {
    console.error('Error reviewing KYC submission:', error);
    throw error;
  }
};

/**
 * Get KYC verification statistics for admin dashboard
 */
export const getKYCStatistics = async (): Promise<{
  totalSubmissions: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  thisMonthSubmissions: number;
  averageReviewTime: string;
  approvalRate: string;
}> => {
  try {
    const response = await axios.get('/admin/kyc/statistics');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching KYC statistics:', error);
    throw error;
  }
};

export default {
  getUserKYCStatus,
  uploadKYCDocument,
  submitKYCVerification,
  deleteKYCDocument,
  getAllKYCSubmissions,
  getKYCSubmissionById,
  reviewKYCSubmission,
  getKYCStatistics
};
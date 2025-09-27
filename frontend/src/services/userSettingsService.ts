import axios from '@/utils/axios';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    street2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth: string | null;
  accountType: string;
  memberSince: string;
  kycStatus: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  investmentUpdates: boolean;
  marketNews: boolean;
  monthlyReports: boolean;
  referralUpdates: boolean;
}

export interface PrivacySettings {
  twoFactorAuth: boolean;
  sessionTimeout: string;
  dataSharing: boolean;
  profileVisibility: string;
}

export interface UserSettings {
  profile: UserProfile;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street?: string;
    street2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  dateOfBirth?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Get user settings
export const getUserSettings = async (): Promise<UserSettings> => {
  const response = await axios.get('/user/settings');
  return response.data;
};

// Update user profile
export const updateUserProfile = async (profileData: UpdateProfileRequest): Promise<{ message: string; profile: Partial<UserProfile> }> => {
  const response = await axios.put('/user/settings/profile', profileData);
  return response.data;
};

// Update notification settings
export const updateNotificationSettings = async (notifications: Partial<NotificationSettings>): Promise<{ message: string; notifications: NotificationSettings }> => {
  const response = await axios.put('/user/settings/notifications', notifications);
  return response.data;
};

// Change password
export const changePassword = async (passwordData: ChangePasswordRequest): Promise<{ message: string }> => {
  const response = await axios.put('/user/settings/password', passwordData);
  return response.data;
};

// Update privacy settings
export const updatePrivacySettings = async (privacy: Partial<PrivacySettings>): Promise<{ message: string; privacy: PrivacySettings }> => {
  const response = await axios.put('/user/settings/privacy', privacy);
  return response.data;
};

// Request data download
export const requestDataDownload = async (): Promise<{ message: string; requestId: string }> => {
  const response = await axios.post('/user/settings/data-download');
  return response.data;
};

// Delete account
export const deleteAccount = async (password: string): Promise<{ message: string }> => {
  const response = await axios.delete('/user/settings/account', { data: { password } });
  return response.data;
};
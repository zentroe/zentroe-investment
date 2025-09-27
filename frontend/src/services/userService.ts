import axios from '@/utils/axios';
import { UserProfile } from '@/context/UserContext';

// Get comprehensive user profile
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await axios.get('/auth/profile');
  return response.data;
};

// Update user profile
export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await axios.patch('/auth/profile', profileData);
  return response.data;
};

// Helper functions for user data
export const getUserDisplayName = (user: UserProfile | null): string => {
  if (!user) return 'User';

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  if (user.firstName) {
    return user.firstName;
  }

  if (user.email) {
    return user.email.split('@')[0];
  }

  return 'User';
};

export const getUserInitials = (user: UserProfile | null): string => {
  if (!user) return 'U';

  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  if (user.firstName) {
    return user.firstName.slice(0, 2).toUpperCase();
  }

  if (user.email) {
    const emailParts = user.email.split('@')[0];
    return emailParts.slice(0, 2).toUpperCase();
  }

  return 'U';
};

export const getUserInvestorType = (user: UserProfile | null): string => {
  if (!user) return 'Investor';

  if (user.role === 'admin') {
    return 'Administrator';
  }

  if (user.isAccreditedInvestor) {
    return 'Accredited Investor';
  }

  if (user.investmentExperience) {
    switch (user.investmentExperience) {
      case 'extensive':
        return 'Expert Investor';
      case 'moderate':
        return 'Experienced Investor';
      case 'limited':
        return 'Investor';
      case 'none':
        return 'New Investor';
      default:
        return 'Investor';
    }
  }

  if (user.accountType === 'retirement') {
    return 'Retirement Account';
  }

  return 'Investor';
};

export const getOnboardingProgress = (user: UserProfile | null): number => {
  if (!user) return 0;

  const steps = {
    'started': 10,
    'basicInfo': 30,
    'investmentProfile': 60,
    'verification': 80,
    'bankConnected': 90,
    'completed': 100
  };

  return steps[user.onboardingStatus] || 0;
};

export const isUserOnboardingComplete = (user: UserProfile | null): boolean => {
  return user?.onboardingStatus === 'completed';
};

export const getUserRiskProfile = (user: UserProfile | null): string => {
  if (!user?.riskTolerance) return 'Not assessed';

  const riskLabels = {
    'conservative': 'Conservative',
    'moderate': 'Moderate',
    'aggressive': 'Aggressive'
  };

  return riskLabels[user.riskTolerance] || 'Not assessed';
};
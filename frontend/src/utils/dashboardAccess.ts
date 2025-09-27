/**
 * Dashboard Access Control Utilities
 * 
 * These utilities help determine if a user can access dashboard features
 * based on email verification and onboarding completion status.
 */

export interface DashboardAccessStatus {
  canAccess: boolean;
  reason?: 'email_not_verified' | 'onboarding_incomplete' | 'not_authenticated';
  message?: string;
}

export interface User {
  isEmailVerified: boolean;
  onboardingStatus: string;
  email: string;
}

/**
 * Check if user can access the dashboard
 */
export const checkDashboardAccess = (user: User | null): DashboardAccessStatus => {
  // Check if user is authenticated
  if (!user) {
    return {
      canAccess: false,
      reason: 'not_authenticated',
      message: 'Please log in to access your dashboard'
    };
  }

  // Check email verification
  if (!user.isEmailVerified) {
    return {
      canAccess: false,
      reason: 'email_not_verified',
      message: 'Please verify your email address to access the dashboard'
    };
  }

  // Check onboarding completion
  if (user.onboardingStatus !== 'completed') {
    return {
      canAccess: false,
      reason: 'onboarding_incomplete',
      message: 'Please complete your account setup to access the dashboard'
    };
  }

  return {
    canAccess: true
  };
};

/**
 * Get appropriate redirect path based on user status
 */
export const getDashboardAccessRedirect = (user: User | null): string => {
  if (!user) {
    return '/auth/login';
  }

  if (!user.isEmailVerified) {
    // Stay on dashboard - DashboardLayout will show email verification UI
    return '/dashboard';
  }

  if (user.onboardingStatus !== 'completed') {
    // Route to appropriate onboarding step
    switch (user.onboardingStatus) {
      case 'started':
        return '/onboarding/account-type';
      case 'basicInfo':
        return '/onboarding/intro';
      case 'investmentProfile':
        return '/onboarding/personal-details-intro';
      case 'verification':
        return '/invest/payment-amount';
      case 'bankConnected':
        return '/payment';
      default:
        return '/onboarding/account-type';
    }
  }

  return '/dashboard';
};

/**
 * Check if user can access investment features (payments, etc.)
 * Investment features require both email verification AND onboarding completion
 */
export const checkInvestmentAccess = (user: User | null): DashboardAccessStatus => {
  return checkDashboardAccess(user);
};
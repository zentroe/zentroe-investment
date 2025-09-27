// Server-side onboarding milestones and progress tracking utilities

export interface OnboardingMilestone {
  id: string;
  name: string;
  description: string;
  step: number;
  route: string;
  requiredFields: string[];
}

export const ONBOARDING_MILESTONES: OnboardingMilestone[] = [
  // Phase 1: Account Setup
  {
    id: 'email_setup',
    name: 'Account Creation',
    description: 'Email address provided',
    step: 0,
    route: '/signup',
    requiredFields: ['email']
  },
  {
    id: 'password_setup',
    name: 'Account Security',
    description: 'Password created',
    step: 1,
    route: '/onboarding/password',
    requiredFields: ['password']
  },

  // Phase 2: Investment Profile Discovery
  {
    id: 'profile_intro',
    name: 'Profile Setup Started',
    description: 'Investment profile discovery began',
    step: 2,
    route: '/onboarding/intro',
    requiredFields: ['hasSeenIntro']
  },
  {
    id: 'investment_priority',
    name: 'Investment Preferences',
    description: 'Investment priorities defined',
    step: 3,
    route: '/onboarding/most-important',
    requiredFields: ['investmentPriority']
  },
  {
    id: 'investment_goal',
    name: 'Investment Goals',
    description: 'Primary investment goals selected',
    step: 4,
    route: '/onboarding/motivation',
    requiredFields: ['investmentGoal']
  },
  {
    id: 'annual_income',
    name: 'Financial Profile',
    description: 'Annual income range provided',
    step: 5,
    route: '/onboarding/income',
    requiredFields: ['annualIncome']
  },
  {
    id: 'investment_amount',
    name: 'Investment Capacity',
    description: 'Annual investment amount selected',
    step: 6,
    route: '/onboarding/satisfied-amount',
    requiredFields: ['annualInvestmentAmount']
  },
  {
    id: 'referral_source',
    name: 'Discovery Channel',
    description: 'How they heard about Zentroe',
    step: 7,
    route: '/onboarding/hdyh',
    requiredFields: ['referralSource']
  },
  {
    id: 'portfolio_recommendation',
    name: 'Portfolio Recommended',
    description: 'Personalized portfolio generated and presented',
    step: 8,
    route: '/onboarding/investment-recommendation',
    requiredFields: ['recommendedPortfolio']
  },

  // Phase 3: Personal Information & Compliance  
  {
    id: 'personal_intro',
    name: 'Personal Information Phase',
    description: 'Personal details collection started',
    step: 9,
    route: '/onboarding/personal-intro',
    requiredFields: ['hasSeenPersonalIntro']
  },
  {
    id: 'account_type',
    name: 'Account Structure',
    description: 'Investment account type selected',
    step: 10,
    route: '/onboarding/select-account-form',
    requiredFields: ['accountType']
  },
  {
    id: 'personal_details',
    name: 'Identity Verification',
    description: 'Personal details and legal name provided',
    step: 11,
    route: '/onboarding/personal-info',
    requiredFields: ['firstName', 'lastName']
  },

  // Phase 4: Investment Execution
  {
    id: 'investment_intro',
    name: 'Investment Phase',
    description: 'Ready to invest - final setup phase',
    step: 12,
    route: '/invest/intro',
    requiredFields: ['hasSeenInvestIntro']
  },
  {
    id: 'payment_amount',
    name: 'Investment Amount',
    description: 'Initial investment amount specified',
    step: 13,
    route: '/invest/payment-amount',
    requiredFields: ['initialInvestmentAmount']
  },
  {
    id: 'recurring_setup',
    name: 'Recurring Investment',
    description: 'Automatic investment preferences set',
    step: 14,
    route: '/invest/auto-invest',
    requiredFields: ['recurringInvestment']
  },

  // Phase 5: Completion
  {
    id: 'completed',
    name: 'Onboarding Complete',
    description: 'Full onboarding process completed',
    step: 15,
    route: '/dashboard',
    requiredFields: ['onboardingStatus']
  }
];

export const getOnboardingPhase = (step: number): string => {
  if (step <= 1) return 'Account Setup';
  if (step <= 8) return 'Investment Profile';
  if (step <= 11) return 'Personal Information';
  if (step <= 14) return 'Investment Setup';
  return 'Complete';
};

export const getMilestoneByStep = (step: number): OnboardingMilestone | null => {
  return ONBOARDING_MILESTONES.find(m => m.step === step) || null;
};

export const getNextMilestone = (currentStep: number): OnboardingMilestone | null => {
  return ONBOARDING_MILESTONES.find(m => m.step > currentStep) || null;
};

export const calculateProgress = (userData: any): {
  currentStep: number;
  currentMilestone: OnboardingMilestone | null;
  nextMilestone: OnboardingMilestone | null;
  phase: string;
  completedMilestones: string[];
  progressPercentage: number;
} => {
  let currentStep = 0;
  const completedMilestones: string[] = [];

  // Calculate current step based on completed data
  for (const milestone of ONBOARDING_MILESTONES) {
    const hasAllFields = milestone.requiredFields.every(field => {
      if (field === 'onboardingStatus') {
        return userData[field] === 'completed';
      }
      return userData[field] !== undefined && userData[field] !== null && userData[field] !== '';
    });

    if (hasAllFields) {
      currentStep = milestone.step + 1; // Next step after completed milestone
      completedMilestones.push(milestone.id);
    } else {
      break; // Stop at first incomplete milestone
    }
  }

  const currentMilestone = getMilestoneByStep(currentStep);
  const nextMilestone = getNextMilestone(currentStep);
  const phase = getOnboardingPhase(currentStep);
  const progressPercentage = Math.round((currentStep / ONBOARDING_MILESTONES.length) * 100);

  return {
    currentStep,
    currentMilestone,
    nextMilestone,
    phase,
    completedMilestones,
    progressPercentage
  };
};

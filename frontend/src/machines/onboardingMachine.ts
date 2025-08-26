import { createMachine } from 'xstate';
import { z } from 'zod';

// Validation schemas
export const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export const investmentGoalsSchema = z.object({
  investmentPriority: z.enum(['diversification', 'fixed_income', 'venture_capital', 'growth', 'income']),
  investmentGoal: z.enum(['long_term', 'short_term', 'balanced']),
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive'])
});

export const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  dateOfBirth: z.string(),
  phone: z.string().optional()
});

export const accountSetupSchema = z.object({
  accountType: z.enum(['general', 'retirement']),
  accountSubType: z.enum(['individual', 'joint', 'trust', 'other'])
});

// State machine definition
export const onboardingMachine = createMachine({
  id: 'onboarding',
  initial: 'email',
  context: {
    formData: {},
    errors: {},
    currentStep: 1,
    isLoading: false
  },
  states: {
    email: {
      on: {
        NEXT: {
          target: 'investmentProfile',
          actions: ['saveFormData', 'incrementStep']
        },
        VALIDATE: {
          actions: ['validateEmail']
        }
      }
    },
    investmentProfile: {
      on: {
        NEXT: {
          target: 'personalInfo',
          actions: ['saveFormData', 'incrementStep']
        },
        BACK: {
          target: 'email',
          actions: ['decrementStep']
        }
      }
    },
    personalInfo: {
      on: {
        NEXT: {
          target: 'accountSetup',
          actions: ['saveFormData', 'incrementStep']
        },
        BACK: {
          target: 'investmentProfile',
          actions: ['decrementStep']
        }
      }
    },
    accountSetup: {
      on: {
        NEXT: {
          target: 'complete',
          actions: ['saveFormData', 'completeOnboarding']
        },
        BACK: {
          target: 'personalInfo',
          actions: ['decrementStep']
        }
      }
    },
    complete: {
      type: 'final'
    }
  }
});

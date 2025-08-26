import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

type StepData = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  accountType?: "general" | "retirement";
  accountSubType?: "individual" | "joint" | "trust" | "other";
  investmentGoal?: "diversification" | "fixed_income" | "venture_capital" | "growth" | "income";
  riskTolerance?: "conservative" | "moderate" | "aggressive";
  investmentTimeHorizon?: "1-3 years" | "3-5 years" | "5-10 years" | "10+ years";
};

type OnboardingContextType = {
  currentStep: number;
  formData: Record<string, StepData>;
  isLoading: boolean;
  saveStepData: (stepId: string, data: StepData) => Promise<void>;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  onboarding: StepData;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'onboarding_progress';

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, StepData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [onboarding, setOnboardingData] = useState<StepData>({});

  const saveStepData = async (stepId: string, data: StepData) => {
    setIsLoading(true);
    try {
      const newData = { ...formData, [stepId]: data };
      setFormData(newData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

      await fetch('/api/onboarding/progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, data })
      });

      setOnboardingData(prev => ({ ...prev, ...data }));
      setCurrentStep(prev => prev + 1);
    } catch (error) {
      toast.error('Failed to save progress');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        formData,
        isLoading,
        saveStepData,
        goToNextStep,
        goToPreviousStep,
        onboarding
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

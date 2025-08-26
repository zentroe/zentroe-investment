import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

type OnboardingContextType = {
  currentStep: number;
  formData: Record<string, any>;
  isLoading: boolean;
  saveStepData: (stepId: string, data: any) => Promise<void>;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  onboarding: Record<string, any>;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'onboarding_progress';

export type OnboardingData = {
  // Authentication
  email: string;
  password: string;

  // Personal Information
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

  // Account Setup
  accountType?: "general" | "retirement";
  accountSubType?: "individual" | "joint" | "trust" | "other";

  // Investment Profile
  initialInvestmentAmount?: number;
  annualInvestmentAmount?: string;
  annualIncome?: string;
  netWorth?: string;
  investmentExperience?: "none" | "limited" | "moderate" | "extensive";
  investmentGoal?: "diversification" | "fixed_income" | "venture_capital" | "growth" | "income";
  riskTolerance?: "conservative" | "moderate" | "aggressive";
  portfolioPriority?: "long_term" | "short_term" | "balanced";
  investmentTimeHorizon?: "1-3 years" | "3-5 years" | "5-10 years" | "10+ years";

  // Preferences
  referralSource?: string;
  recommendedPortfolio?: string;
  recurringInvestment?: boolean;
  recurringFrequency?: "weekly" | "monthly" | "quarterly";
  recurringDay?: string;
  recurringAmount?: number;

  // Milestone tracking fields
  hasSeenIntro?: boolean;
  hasSeenPersonalIntro?: boolean;
  hasSeenInvestIntro?: boolean;
  hasCompletedAccountSetup?: boolean;
  investmentPriority?: string;

  // Compliance
  isAccreditedInvestor?: boolean;
  employmentStatus?: "employed" | "self-employed" | "unemployed" | "retired" | "student";
  employer?: string;
  politicallyExposed?: boolean;

  // Progress tracking
  onboardingStep?: number;
  onboardingStatus?: "started" | "basicInfo" | "investmentProfile" | "verification" | "bankConnected" | "completed";
};

type OnboardingContextType = {
  currentStep: number;
  formData: Record<string, any>;
  isLoading: boolean;
  saveStepData: (stepId: string, data: any) => Promise<void>;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  onboarding: Record<string, any>;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [onboarding, setOnboardingState] = useState<OnboardingData>({
    email: "",
    password: "",
    onboardingStep: 0,
  });

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const setOnboarding = (data: Partial<OnboardingData>) => {
    setOnboardingState((prev) => ({ ...prev, ...data }));
  };

  const updateOnboardingStep = (step: number) => {
    setOnboardingState((prev) => ({ ...prev, onboardingStep: step }));
  };

  // Enhanced progress tracking functions with milestone system
  const saveProgress = async (data: Partial<OnboardingData>, step?: number) => {
    try {
      // Update local state immediately
      const updatedData = { ...data };
      if (step !== undefined) {
        updatedData.onboardingStep = step;
      }

      setOnboardingState((prev) => ({ ...prev, ...updatedData }));

      // Save to new milestone-based backend endpoint
      const email = updatedData.email || onboarding.email;
      if (email) {
        await updateOnboardingProgress({
          email,
          userData: updatedData,
          forceStep: step
        });
        console.log("✅ Onboarding progress saved to milestone system:", updatedData);
      }

      // Only try legacy endpoint if user is authenticated (has current user data)
      if (currentUser) {
        try {
          await updateOnboarding(updatedData);
          console.log("✅ Legacy onboarding also updated");
        } catch (legacyError) {
          console.warn("⚠️ Legacy onboarding update failed (non-critical):", legacyError);
          // Don't throw - this is just for backward compatibility
        }
      }

    } catch (error) {
      console.error("❌ Failed to save onboarding progress:", error);
      toast.error("Failed to save progress. Please try again.");
      throw error; // Re-throw so the calling code knows it failed
    }
  };

  const getProgressPercentage = (): number => {
    // Use milestone-based progress calculation
    const progressData = calculateProgress(onboarding);
    return progressData.progressPercentage;
  };

  const getCurrentStepName = (): string => {
    const progressData = calculateProgress(onboarding);
    return progressData.currentMilestone?.name || progressData.phase;
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setOnboardingState((prev) => ({
          ...prev,
          ...user,
          onboardingStep: user.onboardingStep || 0
        }));
      } catch (err) {
        console.error("❌ Failed to fetch user onboarding data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) return <FullScreenLoader />;

  return (
    <OnboardingContext.Provider
      value={{
        onboarding,
        setOnboarding,
        updateOnboardingStep,
        saveProgress,
        getProgressPercentage,
        getCurrentStepName,
        isLoading: loading,
        currentUser
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("useOnboarding must be used within OnboardingProvider");
  return context;
};

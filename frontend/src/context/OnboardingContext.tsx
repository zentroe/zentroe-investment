import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser } from "@/services/auth";
import FullScreenLoader from "@/components/FullScreenLoader";

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
  onboarding: OnboardingData;
  setOnboarding: (data: Partial<OnboardingData>) => void;
  updateOnboardingStep: (step: number) => void;
  isLoading: boolean;
  currentUser: any;
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

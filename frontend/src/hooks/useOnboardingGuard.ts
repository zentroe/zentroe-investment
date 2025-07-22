import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/context/OnboardingContext";

export const useOnboardingGuard = (requiredFields: (keyof ReturnType<typeof useOnboarding>["onboarding"])[], redirectTo: string) => {
  const { onboarding } = useOnboarding();
  const navigate = useNavigate();

  useEffect(() => {
    const isMissing = requiredFields.some((field) => !onboarding[field]);
    if (isMissing) {
      navigate(redirectTo);
    }
  }, [onboarding, requiredFields, navigate]);
};

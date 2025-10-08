import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/context/OnboardingContext";
import { OnboardingData } from "@/context/OnboardingContext";

export const useOnboardingGuard = (requiredFields: (keyof OnboardingData)[], redirectTo: string) => {
  const { data } = useOnboarding();
  const navigate = useNavigate();

  useEffect(() => {
    const isMissing = requiredFields.some((field) => !data[field]);
    if (isMissing) {
      navigate(redirectTo);
    }
  }, [data, requiredFields, navigate, redirectTo]);
};

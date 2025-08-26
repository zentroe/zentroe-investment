import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "@/assets/Zentroe-success-animation.json";
import OnboardingLayout from "./OnboardingLayout";
import { Helmet } from "react-helmet-async";
import { useOnboarding } from "@/context/OnboardingContext";

export default function Success() {
  const navigate = useNavigate();
  const { saveStepData } = useOnboarding();

  useEffect(() => {
    // Save Account Setup phase completion
    const saveAccountSetupCompletion = async () => {
      try {
        await saveStepData('account_setup_completion', {});
      } catch (error) {
        console.error("Failed to save account setup completion:", error);
      }
    };

    saveAccountSetupCompletion();

    const timeout = setTimeout(() => {
      navigate("/onboarding/intro");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [navigate, saveStepData]);

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Account Created | Zentroe</title>
      </Helmet>

      <div className="flex flex-col items-center justify-center mt-30 text-center min-h-[80vh]">
        <div className="w-45 h-45">
          <Lottie animationData={animationData} loop={false} />
        </div>
        <p className="mt-6 text-lg font-medium text-darkPrimary">
          Your Zentroe account was created <br /> successfully
        </p>
      </div>
    </OnboardingLayout>
  );
}

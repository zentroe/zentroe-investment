// src/pages/onboarding/GeneratingRecommend.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Lottie from "lottie-react";
import OnboardingLayout from "./OnboardingLayout";
import loadingCube from "@/assets/loading.json";

const messages = [
  "Gathering Information...",
  "Generating your recommendations...",
  "Your recommendations are ready!",
];

export default function GeneratingRecommend() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => Math.min(prev + 1, messages.length - 1));
    }, 3000);

    const timeout = setTimeout(() => {
      navigate("/onboarding/investment-recommendation");
    }, 9000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Generating Your Recommendation | Zentroe</title>
      </Helmet>

      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 px-4">
        <Lottie animationData={loadingCube} loop className="w-50" />
        <p className="text-md text-darkPrimary font-medium">
          {messages[step]}
        </p>
      </div>
    </OnboardingLayout>
  );
}

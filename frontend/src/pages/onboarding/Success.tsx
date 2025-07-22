import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "@/assets/Zentroe-success-animation.json";
import OnboardingLayout from "./OnboardingLayout";
import { Helmet } from "react-helmet-async";

export default function Success() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/onboarding/account-type");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [navigate]);

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

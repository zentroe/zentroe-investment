import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "@/assets/Zentroe-success-animation.json";
import OnboardingLayout from "./OnboardingLayout";
import { Helmet } from "react-helmet-async";
import { useOnboarding } from "@/context/OnboardingContext";

export default function Success() {
  const navigate = useNavigate();
  const { updateStatus, refreshData } = useOnboarding();

  useEffect(() => {
    // Set onboarding status to "started" when user reaches success page
    const initializeOnboarding = async () => {
      try {
        console.log('🔄 [Success] Initializing onboarding status to started...');
        await updateStatus('started');

        // Refresh data to ensure context is synced
        console.log('🔄 [Success] Refreshing onboarding data...');
        await refreshData();
        console.log('✅ [Success] Onboarding initialized and data refreshed');
      } catch (error) {
        console.error('❌ [Success] Failed to update onboarding status:', error);
        // Don't block the flow if status update fails
      }
    };

    initializeOnboarding();

    // Redirect to account type selection after 3 seconds to give user time to read the message
    const timeout = setTimeout(() => {
      navigate("/onboarding/account-type");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [navigate, updateStatus, refreshData]);

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Account Created | Zentroe</title>
      </Helmet>

      <div className="flex flex-col items-center justify-center text-center min-h-[80vh]">
        <div className="w-45 h-45">
          <Lottie animationData={animationData} loop={false} />
        </div>
        <div className="mt-6 space-y-4">
          <p className="text-lg font-medium text-darkPrimary">
            Your Zentroe account was created <br /> successfully!
          </p>
          <div className="max-w-md mx-auto space-y-2">
            <p className="text-sm text-gray-600">
              Please check your email for account confirmation instructions.
            </p>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}

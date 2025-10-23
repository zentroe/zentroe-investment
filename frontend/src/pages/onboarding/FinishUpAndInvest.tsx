import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OnboardingLayout from "./OnboardingLayout";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/context/OnboardingContext";
import { toast } from "sonner";

export default function FinishUpAndInvest() {
  const navigate = useNavigate();
  const { updateStatus, refreshData } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    try {
      setLoading(true);
      console.log('🔄 [FinishUpAndInvest] Updating status and refreshing data...');

      // Update the onboarding status
      await updateStatus("basicInfo");

      // Refresh the onboarding data to ensure we have the latest selected investment plan
      console.log('🔄 [FinishUpAndInvest] Refreshing onboarding data before navigation...');
      await refreshData();

      console.log('✅ [FinishUpAndInvest] Data refreshed, navigating to investment amount page');

      // Navigate to the investment amount page
      navigate("/invest/payment-amount");
    } catch (error) {
      console.error('❌ [FinishUpAndInvest] Error during continue:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Finish Up and Invest | Zentroe</title>
      </Helmet>

      <div className="mt-24 flex max-w-sm mx-auto flex-col items-left justify-center px-4 text-left">
        {/* Optional: add an animated icon or Lottie here */}
        <img
          src="/target.png"
          alt="Target Icon"
          className="w-24 mb-6"
        />

        <h1 className="text-3xl font-sectra text-darkPrimary mb-2">
          Finish up and invest
        </h1>

        <p className="text-sm text-gray-600 mb-10 max-w-md">
          Finally, we’ll collect your initial investment amount, securely connect a funding source, and place your investment when you’re ready.
        </p>

        <Button
          onClick={handleContinue}
          disabled={loading}
          className="text-sm text-white bg-primary hover:bg-[#8c391e] disabled:opacity-50"
        >
          {loading ? "Loading..." : "Continue"}
        </Button>
      </div>
    </OnboardingLayout>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OnboardingLayout from "./OnboardingLayout";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/context/OnboardingContext";
import { toast } from "sonner";

export default function PersonalDetailsIntro() {
  const navigate = useNavigate();
  const { updateStatus, refreshData } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    try {
      setLoading(true);
      console.log('🔄 [PersonalDetailsIntro] Updating status to investmentProfile...');

      await updateStatus("investmentProfile");

      // Refresh onboarding data to ensure context has the latest status
      console.log('🔄 [PersonalDetailsIntro] Refreshing onboarding data after status update...');
      await refreshData();
      console.log('✅ [PersonalDetailsIntro] Data refreshed, navigating to confirm residence');

      navigate("/onboarding/confirm-residence");
    } catch (error) {
      console.error("❌ [PersonalDetailsIntro] Error updating onboarding status:", error);
      toast.error("Failed to update progress. Please try again.");
      // Still navigate even if status update fails
      navigate("/onboarding/confirm-residence");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Personal Information | Zentroe</title>
      </Helmet>

      <div className="mt-28 flex flex-col  items-center max-w-sm mx-auto px-4 text-left space-y-3">
        <h1 className="text-3xl font-sectra text-darkPrimary leading-8">
          Let's continue with some information about you
        </h1>

        <p className="text-sm text-gray-600">
          To comply with federal regulations, and as is typical with any investment platform, we are required to collect certain personal information about you.
        </p>

        <Button
          onClick={handleContinue}
          disabled={loading}
          className="bg-primary text-white w-full mt-12 mx-auto hover:bg-[#8c391e] disabled:opacity-50"
        >
          {loading ? "Loading..." : "Continue"}
        </Button>
      </div>
    </OnboardingLayout>
  );
}

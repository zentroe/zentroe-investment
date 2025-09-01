import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OnboardingLayout from "./OnboardingLayout";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/context/OnboardingContext";

export default function PersonalDetailsIntro() {
  const navigate = useNavigate();
  const { updateStatus } = useOnboarding();


  const handleContinue = async () => {
    try {
      await updateStatus("investmentProfile");
      navigate("/onboarding/select-account-form");
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      // Still navigate even if status update fails
      // navigate("/onboarding/select-account-form");
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
          className="bg-primary text-white w-full mt-12 mx-auto hover:bg-[#8c391e]"
        >
          Continue
        </Button>
      </div>
    </OnboardingLayout>
  );
}

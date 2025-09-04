import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OnboardingLayout from "./OnboardingLayout";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/context/OnboardingContext";

export default function FinishUpAndInvest() {
  const navigate = useNavigate();
  const { updateStatus } = useOnboarding();

  const handleContinue = async () => {
    await updateStatus("basicInfo");
    navigate("/invest/payment-amount"); // Adjust route as needed
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
          className="text-sm text-white bg-primary hover:bg-[#8c391e]"
        >
          Continue
        </Button>
      </div>
    </OnboardingLayout>
  );
}

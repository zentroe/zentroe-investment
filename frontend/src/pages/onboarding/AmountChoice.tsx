import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import OnboardingLayout from "./OnboardingLayout";
import { useOnboarding } from "@/context/OnboardingContext";
import { updateOnboarding } from "@/services/auth";
import { toast } from "sonner";

export default function AmountChoice() {
  const navigate = useNavigate();
  const { onboarding, setOnboarding } = useOnboarding();
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  const accountType = onboarding.accountType;

  useEffect(() => {
    if (!accountType) {
      navigate("/onboarding/account-type");
    }
  }, [accountType, navigate]);

  const options = [
    "Less than $1,000",
    "$1,000 to $10,000",
    "$10,000 to $100,000",
    "$100,000 to $1,000,000",
    "More than $1,000,000",
  ];

  const handleSelect = async (value: string) => {
    setSelected(value);
    setLoading(true);

    try {
      await updateOnboarding({ annualInvestmentAmount: value });
      setOnboarding({ annualInvestmentAmount: value });
      toast.success("Investment amount saved.");
      navigate("/onboarding/hdyh");
    } catch (error) {
      console.error("Error saving investment amount:", error);
      toast.error("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Investment Amount | Zentroe</title>
      </Helmet>

      <div className="mt-24 px-4 max-w-xl mx-auto">
        <h1 className="text-3xl font-sectra text-darkPrimary mb-2">
          How much could you invest with Zentroe every year?
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Please answer this question assuming you were{" "}
          <em>completely satisfied</em> with your Zentroe investment experience.
          {accountType === "retirement" && (
            <>
              {" "}
              <strong>Note:</strong> Retirement accounts require a minimum of{" "}
              <span className="font-medium text-darkPrimary">$1,000</span>.
            </>
          )}
        </p>

        <div className="divide-y rounded-md">
          {options
            .filter((option) =>
              accountType === "retirement" && option === "Less than $1,000"
                ? false
                : true
            )
            .map((option, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSelect(option)}
                className={`w-full text-left cursor-pointer py-7 pr-2 flex justify-between items-center hover:bg-gray-50 transition ${selected === option ? "bg-gray-50" : ""
                  }`}
              >
                <span className="text-darkPrimary">{option}</span>
                <ChevronRight className="text-gray-800" size={24} />
              </button>
            ))}
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-10 text-sm font-semibold text-primary hover:underline"
        >
          Back
        </button>
      </div>
    </OnboardingLayout>
  );
}

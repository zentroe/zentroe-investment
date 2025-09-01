import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import OnboardingLayout from "./OnboardingLayout";
import { useOnboarding } from "@/context/OnboardingContext";
import { saveAnnualInvestmentAmount } from "@/services/onboardingService";
import { toast } from "sonner";

export default function AmountChoice() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  const { data, loading: contextLoading, updateLocalData } = useOnboarding();

  // Pre-populate from context data
  useEffect(() => {
    if (data.annualInvestmentAmount) {
      setSelected(data.annualInvestmentAmount);
    }
  }, [data.annualInvestmentAmount]);

  // Only redirect if context has loaded and accountType is missing
  useEffect(() => {
    if (!contextLoading && !data.accountType) {
      navigate("/onboarding/account-type");
    }
  }, [contextLoading, data.accountType, navigate]);

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
      // Save annual investment amount using our new onboarding service
      await saveAnnualInvestmentAmount(value);

      // Update local context data for immediate UI feedback
      updateLocalData({ annualInvestmentAmount: value });

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
          {data.accountType === "retirement" && (
            <>
              {" "}
              <strong>Note:</strong> Retirement accounts require a minimum of{" "}
              <span className="font-medium text-darkPrimary">$1,000</span>.
            </>
          )}
        </p>

        {contextLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {selected && (
              <p className="text-sm text-green-600 mb-4">
                Previously selected: {selected}
              </p>
            )}

            <div className="divide-y rounded-md">
              {options
                .filter((option) =>
                  data.accountType === "retirement" && option === "Less than $1,000"
                    ? false
                    : true
                )
                .map((option, idx) => (
                  <button
                    key={idx}
                    disabled={loading || contextLoading}
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left cursor-pointer py-7 pr-2 flex justify-between items-center hover:bg-gray-50 transition ${selected === option ? "bg-gray-50" : ""
                      } ${loading || contextLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className="text-darkPrimary">{option}</span>
                    {loading && selected === option ? (
                      <span className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ChevronRight className="text-gray-800" size={24} />
                    )}
                  </button>
                ))}
            </div>
          </>
        )}

        <button
          onClick={() => navigate(-1)}
          className="mt-10 text-sm font-semibold text-primary hover:underline"
          disabled={loading || contextLoading}
        >
          Back
        </button>
      </div>
    </OnboardingLayout>
  );
}

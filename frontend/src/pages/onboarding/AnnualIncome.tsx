import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import OnboardingLayout from "./OnboardingLayout";
import { useOnboarding } from "@/context/OnboardingContext";
import { updateOnboarding } from "@/services/auth";
import { toast } from "sonner";

export default function AnnualIncome() {
  const navigate = useNavigate();
  const { setOnboarding } = useOnboarding();
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  const incomeOptions = [
    "Less than $75,000",
    "$75,000 to $150,000",
    "$150,000 to $250,000",
    "$250,000 to $500,000",
    "More than $500,000",
    "Prefer not to share",
  ];

  const handleSelect = async (value: string) => {
    setSelected(value);
    setLoading(true);

    try {
      await updateOnboarding({ annualIncome: value });
      setOnboarding({ annualIncome: value });
      toast.success("Annual income saved.");
      navigate("/onboarding/satisfied-amount");
    } catch (error) {
      console.error("Failed to save annual income:", error);
      toast.error("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Annual Income | Zentroe</title>
      </Helmet>

      <div className="mt-24 px-4 max-w-xl mx-auto">
        <h1 className="text-3xl font-sectra text-darkPrimary mb-2">
          What is your current annual income
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Please use your individual pre-tax income.
        </p>

        <div className="divide-y rounded-md">
          {incomeOptions.map((option, idx) => (
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

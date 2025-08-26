import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OnboardingLayout from "./OnboardingLayout";
import { ChevronRight } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { toast } from "sonner";

export default function MostImportant() {
  const navigate = useNavigate();
  const { saveStepData } = useOnboarding();

  const [selected, setSelected] = useState<"long_term" | "short_term" | "">("");
  const [loading, setLoading] = useState(false);

  const handleSelect = async (value: "long_term" | "short_term") => {
    setSelected(value);
    setLoading(true);

    try {
      await saveStepData('most_important', { investmentPriority: value });
      toast.success("Portfolio preference saved.");
      navigate("/onboarding/motivation");
    } catch (error) {
      console.error("Error saving portfolio priority:", error);
      toast.error("Failed to save selection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <Helmet>
        <title>What's Most Important | Zentroe</title>
      </Helmet>

      <div className="mt-24 px-4 max-w-xl mx-auto">
        <h1 className="text-3xl font-sectra text-darkPrimary mb-2">
          What’s most important to you in your portfolio?
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Select the option that best describes you.
        </p>

        <div className="divide-y rounded-md">
          {[
            {
              id: "long_term",
              title: "Long-term, risk-adjusted returns",
              desc:
                "I'm okay with my portfolio fluctuating up and down in the short-term, as I'm primarily focused on the best risk-adjusted returns over the long-term.",
            },
            {
              id: "short_term",
              title: "Short-term, consistent returns",
              desc:
                "I'm primarily focused on consistent returns with low volatility. I prefer reliable short-term returns even at the cost of the highest potential long-term return.",
            },
          ].map((item) => (
            <button
              key={item.id}
              disabled={loading}
              onClick={() => handleSelect(item.id as "long_term" | "short_term")}
              className={`w-full cursor-pointer text-left p-4 px-5 flex justify-between items-center hover:bg-gray-50 transition ${selected === item.id ? "bg-gray-50" : ""
                }`}
            >
              <div className="py-2 pr-6">
                <p className="font-medium text-darkPrimary">{item.title}</p>
                <p className="text-sm font-light text-gray-600 mt-1">{item.desc}</p>
              </div>
              <ChevronRight className="text-gray-800 mt-1" size={30} />
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

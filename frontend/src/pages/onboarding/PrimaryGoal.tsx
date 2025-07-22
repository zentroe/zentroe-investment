import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OnboardingLayout from "./OnboardingLayout";
import { ChevronRight } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { updateOnboarding } from "@/services/auth";
import { toast } from "sonner";

export default function PrimaryGoal() {
  const navigate = useNavigate();
  const { setOnboarding } = useOnboarding();
  const [selected, setSelected] = useState<"diversification" | "fixed_income" | "venture_capital" | "">("");
  const [loading, setLoading] = useState(false);

  const handleSelect = async (value: "diversification" | "fixed_income" | "venture_capital") => {
    setSelected(value);
    setLoading(true);

    try {
      await updateOnboarding({ investmentGoal: value });
      setOnboarding({ investmentGoal: value });
      toast.success("Investment goal saved.");
      navigate("/onboarding/income");
    } catch (error) {
      console.error("Error saving investment goal:", error);
      toast.error("Failed to save selection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Primary Goal | Zentroe</title>
      </Helmet>

      <div className="mt-24 px-4 max-w-xl mx-auto">
        <h1 className="text-3xl font-sectra text-darkPrimary mb-2">
          What's your primary goal with Zentroe?
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Select the option that best describes you.
        </p>

        <div className="divide-y rounded-md">
          {[
            {
              id: "diversification",
              title: "Diversification & performance",
              desc: "I'm interested in gaining access to alternative investments and diversifying outside just the stock market, in an effort to earn better long-term returns.",
            },
            {
              id: "fixed_income",
              title: "Consistent fixed income",
              desc: "I'm interested in investments that deliver lower-return but consistent fixed income distributions (often best for those who are retired).",
            },
            {
              id: "venture_capital",
              title: "Access to venture capital",
              desc: "I'm primarily interested in venture capital and private tech companies, even though those investments are inherently less liquid and often more volatile.",
            },
          ].map((item) => (
            <button
              key={item.id}
              disabled={loading}
              onClick={() => handleSelect(item.id as "diversification" | "fixed_income" | "venture_capital")}
              className={`w-full text-left cursor-pointer p-4 px-5 flex justify-between items-center hover:bg-gray-50 transition ${selected === item.id ? "bg-gray-50" : ""}`}
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

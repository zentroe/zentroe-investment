import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import OnboardingLayout from "./OnboardingLayout";
import { useOnboarding } from "@/context/OnboardingContext";
import { updateOnboarding } from "@/services/auth";
import { toast } from "sonner";

export default function AccountType() {
  const [selected, setSelected] = useState<"general" | "retirement" | "">("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setOnboarding } = useOnboarding();

  const accountOptions: {
    id: "general" | "retirement";
    title: string;
    min: string;
    desc: string;
  }[] = [
      {
        id: "general",
        title: "General investing account",
        min: "$10 minimum",
        desc: "A flexible investing account created to help you build long-term wealth.",
      },
      {
        id: "retirement",
        title: "Retirement account",
        min: "$1,000 minimum",
        desc: "Transfer, rollover, or start a new IRA with tax benefits for your retirement.",
      },
    ];

  const handleContinue = async () => {
    if (!selected) return;

    setLoading(true);
    try {
      await updateOnboarding({ accountType: selected });
      setOnboarding({ accountType: selected });
      toast.success("Account type saved");
      navigate("/onboarding/intro");
    } catch (error) {
      console.error("Failed to save account type:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Select Account Type | Zentroe</title>
      </Helmet>

      <div className="mt-24 flex flex-col items-center justify-center px-4">
        <div className="max-w-xl w-full space-y-6">
          <div>
            <h1 className="text-3xl font-sectra text-darkPrimary">
              What account would you like to open?
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Start creating an account that meets your goals. You can add another later.
            </p>
          </div>

          <div className="border rounded-md divide-y px-3 py-3">
            {accountOptions.map((option) => (
              <label
                key={option.id}
                className={`flex justify-between items-start p-4 cursor-pointer ${selected === option.id ? "bg-gray-50" : ""}`}
              >
                <div className="py-2">
                  <p className="font-medium text-darkPrimary flex md:flex-row flex-col items-left gap-2">
                    {option.title}
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                      {option.min}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{option.desc}</p>
                </div>
                <input
                  type="radio"
                  name="account-type"
                  className="mt-2"
                  checked={selected === option.id}
                  onChange={() => setSelected(option.id)}
                />
              </label>
            ))}
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selected || loading}
            className="w-full text-white text-sm bg-primary hover:bg-[#8c391e] disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}

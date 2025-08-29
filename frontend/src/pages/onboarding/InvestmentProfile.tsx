import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type InvestmentPriorityType = "diversification" | "fixed_income" | "venture_capital" | "growth" | "income";
type RiskToleranceType = "conservative" | "moderate" | "aggressive";

type InvestmentFormData = {
  investmentPriority: InvestmentPriorityType;
  riskTolerance: RiskToleranceType;
  investmentGoal: InvestmentPriorityType;
};

const INVESTMENT_PRIORITIES: Array<{
  value: InvestmentPriorityType;
  label: string;
  description: string;
}> = [
    {
      value: "diversification",
      label: "Portfolio Diversification",
      description: "Spread investments across different asset classes"
    },
    {
      value: "fixed_income",
      label: "Fixed Income",
      description: "Regular income through interest and dividends"
    },
    {
      value: "venture_capital",
      label: "Venture Capital",
      description: "High-risk, high-reward startup investments"
    },
    {
      value: "growth",
      label: "Growth",
      description: "Capital appreciation over time"
    },
    {
      value: "income",
      label: "Income Generation",
      description: "Regular income from investments"
    }
  ];

const RISK_LEVELS: Array<{
  value: RiskToleranceType;
  label: string;
  description: string;
}> = [
    {
      value: "conservative",
      label: "Conservative",
      description: "Prefer stability and lower risk"
    },
    {
      value: "moderate",
      label: "Moderate",
      description: "Balance between risk and return"
    },
    {
      value: "aggressive",
      label: "Aggressive",
      description: "Willing to take higher risks for higher returns"
    }
  ];

export default function InvestmentProfile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<InvestmentFormData>>({
    investmentPriority: undefined,
    investmentGoal: undefined,
    riskTolerance: undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.investmentPriority || !formData.riskTolerance) {
      toast.error("Please complete all fields");
      return;
    }

    setIsLoading(true);

    try {
      // This component appears to be unused, but we'll keep it functional
      // In a real implementation, this would save to the backend
      console.log("Investment Profile Data:", {
        investmentGoal: formData.investmentPriority,
        riskTolerance: formData.riskTolerance
      });

      toast.success("Investment profile saved");
      navigate("/onboarding/personal-info");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Please fill in all required fields");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/onboarding/password");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Investment Profile</h1>
        <p className="text-muted-foreground">
          Help us understand your investment preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Label>What is your primary investment priority?</Label>
          <RadioGroup
            value={formData.investmentPriority || ""}
            onValueChange={(value: InvestmentPriorityType) =>
              setFormData({ ...formData, investmentPriority: value })
            }
          >
            {INVESTMENT_PRIORITIES.map((priority) => (
              <div
                key={priority.value}
                className="flex items-center space-x-2 space-y-1"
              >
                <RadioGroupItem value={priority.value} id={priority.value} />
                <Label htmlFor={priority.value}>
                  <div className="font-medium">{priority.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {priority.description}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label>What is your risk tolerance?</Label>
          <RadioGroup
            value={formData.riskTolerance || ""}
            onValueChange={(value: RiskToleranceType) =>
              setFormData({ ...formData, riskTolerance: value })
            }
          >
            {RISK_LEVELS.map((risk) => (
              <div
                key={risk.value}
                className="flex items-center space-x-2 space-y-1"
              >
                <RadioGroupItem value={risk.value} id={risk.value} />
                <Label htmlFor={risk.value}>
                  <div className="font-medium">{risk.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {risk.description}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isLoading}
          >
            Back
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  );
}

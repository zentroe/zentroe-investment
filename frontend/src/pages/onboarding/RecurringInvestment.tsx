import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OnboardingLayout from "./OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/context/OnboardingContext";

const frequencyOptions = [
  "Once a month",
  "Twice a month",
  "Weekly",
  "Every other week",
];

const investmentDaysMap: Record<string, string[]> = {
  "Once a month": ["1st", "15th", "Last day of month"],
  "Twice a month": ["1st & 15th", "15th & Last day"],
  Weekly: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "Every other week": ["Every other Monday", "Every other Friday"],
};

const frequencyMap: Record<string, number> = {
  "Once a month": 12,
  "Twice a month": 24,
  Weekly: 52,
  "Every other week": 26,
};

function getMidpointFromRange(range: string): number {
  if (range.includes("Less than")) return 500;
  if (range.includes("More than")) return 1250000;
  const match = range.match(/\$?([\d,]+)\s+to\s+\$?([\d,]+)/);
  if (!match) return 0;
  const low = parseInt(match[1].replace(/,/g, ""));
  const high = parseInt(match[2].replace(/,/g, ""));
  return Math.floor((low + high) / 2);
}

function generatePresetAmounts(annualAmount: string, frequency: string): number[] {
  const total = getMidpointFromRange(annualAmount);
  const periods = frequencyMap[frequency] || 12;
  const base = total / periods;
  return [1, 2, 3, 4].map((m) => Math.round((base * m) / 5) * 5);
}

export default function RecurringInvestment() {
  const navigate = useNavigate();
  const { onboarding, setOnboarding } = useOnboarding();

  const [frequency, setFrequency] = useState("Once a month");
  const [investmentDay, setInvestmentDay] = useState("1st");
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const presetAmounts = generatePresetAmounts(
    onboarding.annualInvestmentAmount || "",
    frequency
  );

  const isCustomAmountValid =
    customAmount && !isNaN(Number(customAmount)) && Number(customAmount) > 0;

  const isContinueEnabled =
    frequency && investmentDay && (selectedAmount !== null || isCustomAmountValid);

  const handleContinue = () => {
    if (!isContinueEnabled) return;

    const recurringAmount = selectedAmount || Number(customAmount);
    setOnboarding({
      recurringFrequency: frequency,
      recurringDay: investmentDay,
      recurringAmount,
    });

    navigate("/onboarding/bank-connect");
  };

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Recurring Investment | Zentroe</title>
      </Helmet>

      <div className="mt-24 max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-sectra text-darkPrimary mb-1">
          Make a recurring investment
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Grow your wealth with periodic contributions.
        </p>

        <div className="mb-6">
          <p className="font-medium mb-2">Frequency</p>
          <div className="flex flex-wrap gap-2">
            {frequencyOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setFrequency(opt);
                  setInvestmentDay(investmentDaysMap[opt][0]);
                }}
                className={`border rounded-full px-4 py-2 text-sm ${frequency === opt ? "border-primary bg-gray-50" : "border-gray-300"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="font-medium mb-2">Investment days</p>
          <select
            value={investmentDay}
            onChange={(e) => setInvestmentDay(e.target.value)}
            className="border w-full rounded px-4 py-3 text-sm"
          >
            {investmentDaysMap[frequency].map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-10">
          <p className="font-medium mb-2">Amount</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount("");
                }}
                className={`border rounded-full px-4 py-2 text-gray-600 text-sm ${selectedAmount === amount ? "border-primary bg-gray-50" : "border-gray-300"}`}
              >
                ${amount}
              </button>
            ))}
          </div>
          <Input
            placeholder="$ Other Amount"
            value={customAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(null);
            }}
          />
        </div>

        <div className="flex justify-between gap-4">
          <button className="text-sm font-medium text-primary hover:underline">
            Back
          </button>

          <div className="flex gap-3">
            <Link to={'/onboarding/bank-connect'}>
              <Button variant="outline" className="text-sm border border-gray-400">
                I’ll do this later
              </Button>
            </Link>
            <Button
              disabled={!isContinueEnabled}
              onClick={handleContinue}
              className="text-sm text-white bg-primary hover:bg-[#8c391e] disabled:opacity-50"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}

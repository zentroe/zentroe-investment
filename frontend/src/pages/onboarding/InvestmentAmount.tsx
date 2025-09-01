import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OnboardingLayout from "./OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { saveInitialInvestmentAmount } from "@/services/investmentService";
import { toast } from "sonner";

export default function InvestmentAmount() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(Infinity);
  const [loading, setLoading] = useState(false);

  const { data, loading: contextLoading, updateLocalData } = useOnboarding();

  // Pre-populate from context data
  useEffect(() => {
    if (data.initialInvestmentAmount) {
      setAmount(data.initialInvestmentAmount.toString());
    }
  }, [data.initialInvestmentAmount]);

  const selectedRange = data.annualInvestmentAmount;

  useEffect(() => {
    switch (selectedRange) {
      case "Less than $1,000":
        setMin(1);
        setMax(999);
        break;
      case "$1,000 to $10,000":
        setMin(1000);
        setMax(10000);
        break;
      case "$10,000 to $100,000":
        setMin(10000);
        setMax(100000);
        break;
      case "$100,000 to $1,000,000":
        setMin(100000);
        setMax(1000000);
        break;
      case "More than $1,000,000":
        setMin(1000001);
        setMax(Infinity);
        break;
      default:
        setMin(0);
        setMax(Infinity);
    }
  }, [selectedRange]);

  const numericAmount = Number(amount.trim().replace(/[^0-9.]/g, ""));
  const isValidAmount =
    amount.trim() !== "" &&
    !isNaN(numericAmount) &&
    numericAmount >= min &&
    numericAmount <= max;

  const handleContinue = async () => {
    if (!isValidAmount) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setLoading(true);

    try {
      await saveInitialInvestmentAmount(numericAmount);

      // Update local context data for immediate UI feedback
      updateLocalData({ initialInvestmentAmount: numericAmount });

      toast.success("Investment amount saved");
      // Navigate to payment page with the amount
      // navigate(`/payment?amount=${numericAmount}&portfolio=${data.recommendedPortfolio || 'balanced'}`);
      navigate('/invest/auto-invest');
    } catch (error) {
      console.error("Error saving investment amount:", error);
      toast.error("Failed to save investment amount. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading) {
    return (
      <OnboardingLayout>
        <div className="mt-24 px-4 max-w-xl mx-auto flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Investment Amount | Zentroe</title>
      </Helmet>

      <div className="mt-24 px-4 max-w-xl mx-auto relative">
        <h1 className="text-3xl font-sectra text-darkPrimary mb-6">
          Initial investment amount
        </h1>

        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={`Initial amount: ${selectedRange || "$0 to $X"}`}
          value={amount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
          className="mb-6"
        />

        {!isValidAmount && amount.trim() !== "" && (
          <p className="text-sm text-red-500 mb-4">
            Amount must be between ${min.toLocaleString()} and{" "}
            {max !== Infinity ? `$${max.toLocaleString()}` : "above"}.
          </p>
        )}

        <div className="bg-gray-50 border border-gray-300 rounded-md p-4 text-sm flex items-start gap-3 mb-8">
          <FileText className="text-primary mt-1" size={18} />
          <div>
            <p className="font-medium text-darkPrimary">How do redemptions work at Zentroe?</p>
            <p className="text-gray-600 mt-1">
              You can request to redeem (withdraw) from your investment plan at any time without penalty.
              Requests are processed quarterly — in January, April, July, and October.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="text-xs text-primary cursor-pointer font-semibold mt-2 hover:underline"
            >
              Learn more
            </button>
          </div>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!isValidAmount || loading}
          className="text-sm w-full bg-primary text-white hover:bg-[#8c391e] disabled:opacity-50"
        >
          {loading ? "Saving..." : "Continue"}
        </Button>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="bg-white rounded-md max-w-md w-full relative shadow-lg">
              <div className="flex p-5 justify-between items-center">
                <h2 className="text-lg font-semibold text-darkPrimary">
                  Redemptions at Zentroe
                </h2>
                <button
                  className="text-gray-500 cursor-pointer hover:text-black"
                  onClick={() => setShowModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <hr />

              <div className="text-sm p-5 text-gray-700 space-y-3">
                <p>
                  While Zentroe investments are intended to be long-term (5+ years),
                  we recognize life is unpredictable and investors may want to withdraw their investments early.
                </p>
                <p>
                  Private market investments typically offer no liquidity or ability to sell,
                  but our Flagship funds <strong>process redemption requests on a quarterly basis</strong>
                  (4x per year in January, April, July, and October), and
                  <strong> you can request redemption at any time.</strong>
                </p>
                <p>
                  Furthermore, our Flagship Funds do not charge any penalty or fee to redeem early.
                  For more information on our smaller, more advanced offerings,
                  please see any fund's offering circular.
                </p>
              </div>

              <div className="w-full p-5 flex justify-end">
                <Button
                  onClick={() => setShowModal(false)}
                  className="bg-primary text-white w-full max-w-30 text-sm hover:bg-[#8c391e]"
                >
                  Got it
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}

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

  // Set min/max based on selected investment plan
  useEffect(() => {
    if (data.selectedInvestmentPlan) {
      setMin(data.selectedInvestmentPlan.minInvestment || 0);
      setMax(data.selectedInvestmentPlan.maxInvestment || Infinity);
    } else {
      setMin(0);
      setMax(Infinity);
    }
  }, [data.selectedInvestmentPlan]);

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

    if (!data.selectedInvestmentPlan) {
      toast.error("Please select an investment plan first.");
      navigate("/onboarding/investment-recommendation");
      return;
    }

    setLoading(true);

    try {
      // Pass the investment plan ID along with the amount
      await saveInitialInvestmentAmount(numericAmount, data.selectedInvestmentPlan._id);

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

        {/* Show investment plan info */}
        {data.selectedInvestmentPlan && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">{data.selectedInvestmentPlan.name}</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Expected Return: <strong>{data.selectedInvestmentPlan.profitPercentage}%</strong></p>
              <p>• Duration: <strong>{data.selectedInvestmentPlan.duration} days</strong></p>
              <p>• Min: <strong>${data.selectedInvestmentPlan.minInvestment.toLocaleString()}</strong>
                {data.selectedInvestmentPlan.maxInvestment && ` - Max: $${data.selectedInvestmentPlan.maxInvestment.toLocaleString()}`}
              </p>
            </div>
          </div>
        )}

        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={
            data.selectedInvestmentPlan
              ? `Enter amount (min: $${data.selectedInvestmentPlan.minInvestment.toLocaleString()})`
              : "Enter initial investment amount"
          }
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

        {/* Amount Preview */}
        {amount && isValidAmount && data.selectedInvestmentPlan && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Investment Amount:</span>
              <span className="font-semibold text-lg">${numericAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Expected Profit ({data.selectedInvestmentPlan.profitPercentage}%):</span>
              <span className="font-semibold text-green-600">
                ${(numericAmount * data.selectedInvestmentPlan.profitPercentage / 100).toLocaleString()}
              </span>
            </div>
          </div>
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
              className="text-sm text-primary cursor-pointer font-semibold mt-2 hover:underline"
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

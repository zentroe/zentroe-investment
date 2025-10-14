import { ChevronRight } from "lucide-react";
import { type InvestmentPlan } from "@/services/onboardingService";

interface OtherPlansProps {
  investmentPlans: InvestmentPlan[];
  recommendedPlanId?: string;
  onPlanPreview: (plan: InvestmentPlan) => void;
}

export default function OtherPlans({ investmentPlans, recommendedPlanId, onPlanPreview }: OtherPlansProps) {
  // Filter out the recommended plan to show only other plans
  const otherPlans = investmentPlans.filter(plan => plan._id !== recommendedPlanId);

  if (otherPlans.length === 0) {
    return (
      <div className="mt-14 max-w-4xl w-full mx-auto py-2 pb-6">
        <h3 className="text-lg font-sectra text-darkPrimary">All other plans</h3>
        <p className="text-sm text-gray-600 mb-6">
          You can change your plan anytime
        </p>
        <div className="text-center py-8">
          <p className="text-gray-500">No other investment plans available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-14 max-w-4xl w-full mx-auto py-2 pb-6">
      <h3 className="text-lg font-sectra text-darkPrimary">All other plans</h3>
      <p className="text-sm text-gray-600 mb-6">
        You can change your plan anytime
      </p>

      <div className="space-y-2">
        {otherPlans.map((plan) => (
          <button
            key={plan._id}
            onClick={() => onPlanPreview(plan)}
            className="w-full bg-white cursor-pointer hover:bg-gray-50 px-4 py-5 border border-gray-200 rounded-md text-left flex justify-between items-center"
          >
            <div className="pr-4">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-medium text-darkPrimary">{plan.name}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {plan.profitPercentage}% profit
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {plan.duration} days
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{plan.description}</p>
            </div>
            <ChevronRight className="text-gray-400 mt-1 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

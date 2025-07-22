import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    title: "Balanced Investing",
    description:
      "Build wealth confidently with increased diversification. This plan is weighted relatively evenly across income and growth-oriented assets.",
  },
  {
    title: "Long-term Growth",
    description:
      "Pursue superior overall returns over the long term. This plan is weighted toward assets that have a high potential to appreciate in value.",
  },
  {
    title: "Venture Capital",
    description:
      "Targets long-term growth by investing in a diversified portfolio of private technology companies, which is inherently less liquid and often more volatile.",
  },
];

export default function OtherPlans() {
  return (
    <div className="mt-14 max-w-4xl w-full mx-auto py-2 pb-6">
      <h3 className="text-lg font-sectra text-darkPrimary">All other plans</h3>
      <p className="text-sm text-gray-600 mb-6">
        You can change your plan anytime
      </p>

      <div className="space-y-2">
        {plans.map((plan) => (
          <Link to={'/onboarding/personal-intro'}>
            <button
              key={plan.title}

              className="w-full bg-white cursor-pointer hover:bg-gray-50 px-4 py-5 border border-gray-200 rounded-md text-left flex justify-between items-center"
            >
              <div className="pr-4">
                <p className="font-medium text-darkPrimary mb-1">{plan.title}</p>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>
              <ChevronRight className="text-gray-400 mt-1 shrink-0" />
            </button>
          </Link>

        ))}
      </div>
    </div>
  );
}

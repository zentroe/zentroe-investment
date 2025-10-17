import { useState, useEffect } from "react";
import { Play, Pause, Edit, Calendar, DollarSign } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function RecurringPage() {
  const { user, investments, loading } = useUser();

  // Generate recurring investment data based on user's actual data
  const generateRecurringData = () => {
    if (!user || !investments) return [];

    // If user has recurring investment enabled, show it as a plan
    const recurringPlans = [];

    if (user.recurringInvestment && user.recurringAmount && user.recurringFrequency) {
      // Get the selected investment plan name
      const selectedPlan = investments.find(inv => inv.investmentPlan?._id === user.selectedInvestmentPlan);
      const planName = selectedPlan?.investmentPlan?.name || user.recommendedPortfolio || "Investment Plan";

      // Calculate next investment date
      const getNextDate = (frequency: string, day?: string) => {
        const now = new Date();
        const nextDate = new Date();

        switch (frequency) {
          case 'weekly':
            nextDate.setDate(now.getDate() + (7 - now.getDay()));
            break;
          case 'monthly':
            const targetDay = day ? parseInt(day) : 1;
            nextDate.setMonth(now.getMonth() + 1, targetDay);
            break;
          case 'quarterly':
            nextDate.setMonth(now.getMonth() + 3, day ? parseInt(day) : 1);
            break;
          default:
            nextDate.setDate(now.getDate() + 30);
        }

        return nextDate.toISOString().split('T')[0];
      };

      // Calculate total invested through recurring (estimate based on current investments)
      const totalInvestedFromRecurring = investments.reduce((sum, inv) => sum + inv.amount, 0);

      recurringPlans.push({
        id: 1,
        name: planName,
        amount: user.recurringAmount,
        frequency: user.recurringFrequency.charAt(0).toUpperCase() + user.recurringFrequency.slice(1),
        nextDate: getNextDate(user.recurringFrequency, user.recurringDay),
        status: "Active",
        totalInvested: totalInvestedFromRecurring
      });
    }

    // Add active investments as potential recurring candidates
    investments.forEach((investment, index) => {
      if (investment.status === 'active' && !user.recurringInvestment) {
        recurringPlans.push({
          id: index + 2,
          name: investment.investmentPlan?.name || `Investment Plan ${index + 1}`,
          amount: Math.round(investment.amount / 12), // Suggest monthly amount based on total
          frequency: "Monthly",
          nextDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "Setup Required",
          totalInvested: investment.amount
        });
      }
    });

    return recurringPlans;
  };

  const [recurringInvestments, setRecurringInvestments] = useState(generateRecurringData());

  useEffect(() => {
    if (!loading.user && user) {
      setRecurringInvestments(generateRecurringData());
    }
  }, [user, investments, loading.user]);

  const toggleStatus = (id: number) => {
    setRecurringInvestments(prev => prev.map(inv =>
      inv.id === id
        ? { ...inv, status: inv.status === "Active" ? "Paused" : "Active" }
        : inv
    ));
  };

  // Calculate metrics
  const totalMonthlyInvestment = recurringInvestments
    .filter(inv => inv.status === "Active")
    .reduce((sum, inv) => {
      const multiplier = inv.frequency === "Monthly" ? 1 : inv.frequency === "Bi-weekly" ? 2 : inv.frequency === "Weekly" ? 4 : 1;
      return sum + (inv.amount * multiplier);
    }, 0);

  const activePlans = recurringInvestments.filter(inv => inv.status === "Active").length;
  const pausedPlans = recurringInvestments.filter(inv => inv.status === "Paused").length;
  const setupRequiredPlans = recurringInvestments.filter(inv => inv.status === "Setup Required").length;

  // Find next investment
  const nextInvestment = recurringInvestments
    .filter(inv => inv.status === "Active")
    .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())[0];

  if (loading.user) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Recurring Investments</h1>
          <p className="text-sm text-gray-500 mt-1">Automate your investment strategy</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Investment</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                ${totalMonthlyInvestment.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {activePlans > 0 ? `Across ${activePlans} active plan${activePlans !== 1 ? 's' : ''}` : 'No active recurring plans'}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Plans</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{activePlans}</p>
              <p className="text-sm text-gray-500 mt-2">
                {pausedPlans > 0 && `${pausedPlans} paused`}
                {setupRequiredPlans > 0 && (pausedPlans > 0 ? `, ${setupRequiredPlans} setup needed` : `${setupRequiredPlans} setup needed`)}
                {pausedPlans === 0 && setupRequiredPlans === 0 && 'All plans active'}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Play size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Investment</p>
              {nextInvestment ? (
                <>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {new Date(nextInvestment.nextDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">{nextInvestment.name}</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">--</p>
                  <p className="text-sm text-gray-500 mt-2">No scheduled investments</p>
                </>
              )}
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <Calendar size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Investment Plans */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Investment Plans</h3>

        {recurringInvestments.length > 0 ? (
          <div className="space-y-4">
            {recurringInvestments.map((investment) => (
              <div key={investment.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{investment.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          ${investment.amount} • {investment.frequency} • Next: {investment.nextDate}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</p>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-1 text-sm rounded-full ${investment.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : investment.status === "Setup Required"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                            }`}>
                            {investment.status}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Invested</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          ${investment.totalInvested.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Monthly Est.</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          ${(investment.amount * (investment.frequency === "Monthly" ? 1 : investment.frequency === "Bi-weekly" ? 2 : investment.frequency === "Weekly" ? 4 : 1)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-6">
                    {investment.status !== "Setup Required" && (
                      <button
                        onClick={() => toggleStatus(investment.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title={investment.status === "Active" ? "Pause" : "Resume"}
                      >
                        {investment.status === "Active" ? (
                          <Pause size={20} className="text-gray-600" />
                        ) : (
                          <Play size={20} className="text-green-600" />
                        )}
                      </button>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
                      <Edit size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No recurring investments yet</h4>
            <p className="text-gray-500 mb-6">
              Set up automated investing to build your portfolio consistently over time.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Set Up Recurring Investment
            </button>
          </div>
        )}
      </div>

      {/* How It Works */}
      {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Recurring Investments Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-semibold">1</span>
            </div>
            <h4 className="font-medium text-gray-900">Set Your Schedule</h4>
            <p className="text-sm text-gray-600 mt-1">Choose how much and how often you want to invest</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-semibold">2</span>
            </div>
            <h4 className="font-medium text-gray-900">Automated Investing</h4>
            <p className="text-sm text-gray-600 mt-1">We automatically invest your chosen amount on schedule</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-semibold">3</span>
            </div>
            <h4 className="font-medium text-gray-900">Track Progress</h4>
            <p className="text-sm text-gray-600 mt-1">Monitor your investments and adjust as needed</p>
          </div>
        </div>
      </div> */}
    </div>
  );
}

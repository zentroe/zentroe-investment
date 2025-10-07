import { useState, useEffect } from "react";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { getUserInvestments, getUserInvestmentSummary } from "@/services/userInvestmentService";

interface Investment {
  _id: string;
  investmentPlan: {
    name: string;
    profitPercentage: number;
  };
  amount: number;
  status: string;
  totalProfitsEarned: number;
}

export default function TotalSales() {
  const [timeframe, setTimeframe] = useState("Monthly");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [investmentsData, summaryData] = await Promise.all([
        getUserInvestments(),
        getUserInvestmentSummary()
      ]);

      setInvestments(investmentsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to fetch investment data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Active Investments</h3>
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option>Monthly</option>
            <option>Weekly</option>
            <option>Yearly</option>
          </select>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <TrendingUp size={16} className="text-white" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {investments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No active investments yet</p>
          </div>
        ) : (
          investments.slice(0, 3).map((investment) => {
            const profitPercentage = investment.totalProfitsEarned > 0
              ? ((investment.totalProfitsEarned / investment.amount) * 100).toFixed(1)
              : investment.investmentPlan.profitPercentage.toFixed(1);

            return (
              <div key={investment._id} className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                  <div>
                    <span className="text-sm text-gray-600">{investment.investmentPlan.name}</span>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight size={14} className="text-green-600 mr-1" />
                      <span className="text-xs text-green-600 font-medium">+{profitPercentage}%</span>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    ${(investment.amount + investment.totalProfitsEarned).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full shadow-sm"
                    style={{ width: `${Math.min(Number(profitPercentage), 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        )}

        {/* Summary */}
        {summary && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">Total Portfolio Value</span>
                <div className="flex items-center mt-1">
                  <TrendingUp size={14} className="text-green-600 mr-1" />
                  <span className="text-sm font-semibold text-green-600">
                    ${summary.totalProfits?.toLocaleString() || '0'} profits earned
                  </span>
                </div>
              </div>
              {/* <span className="text-2xl font-bold text-gray-900">
                ${(summary.totalInvested + summary.totalProfits).toLocaleString()}
              </span> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

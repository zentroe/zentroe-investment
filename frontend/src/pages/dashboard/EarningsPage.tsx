import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { getProfitDashboard } from "@/services/userInvestmentService";

interface EarningItem {
  date: string;
  source: string;
  type: string;
  amount: number;
  status: string;
}

interface UpcomingPayment {
  date: string;
  source: string;
  type: string;
  estimated: number;
}

export default function EarningsPage() {
  const { investments, investmentSummary, loading } = useUser();
  const [earningsData, setEarningsData] = useState<EarningItem[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [profitHistory, setProfitHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      setIsLoading(true);

      // Fetch profit history for earnings data
      const profitData = await getProfitDashboard(180); // 6 months of data
      setProfitHistory(profitData.chartData || []);

      // Generate earnings data from profit history and investments
      generateEarningsFromData(profitData.chartData || []);

      // Generate upcoming payments from active investments
      generateUpcomingPayments();

    } catch (error) {
      console.error('Failed to fetch earnings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEarningsFromData = (profitData: any[]) => {
    const earnings: EarningItem[] = [];

    // Convert profit history to earnings entries
    profitData.forEach((item) => {
      if (item.totalProfit > 0) {
        earnings.push({
          date: item.date,
          source: `Investment Portfolio`,
          type: "Daily Profit",
          amount: item.totalProfit,
          status: "Paid"
        });
      }
    });

    // Add earnings from investments with profits
    investments.forEach((investment, index) => {
      if (investment.totalProfitsEarned > 0) {
        earnings.push({
          date: investment.updatedAt,
          source: investment.investmentPlan?.name || `Investment ${index + 1}`,
          type: "Investment Profit",
          amount: investment.totalProfitsEarned,
          status: "Paid"
        });
      }
    });

    // Sort by date (most recent first) and limit to last 20 entries
    const sortedEarnings = earnings
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);

    setEarningsData(sortedEarnings);
  };

  const generateUpcomingPayments = () => {
    const upcoming: UpcomingPayment[] = [];

    // Generate upcoming payments for active investments
    investments
      .filter(inv => inv.status === 'active')
      .forEach((investment, index) => {
        const nextPaymentDate = new Date();
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 7 + (index * 3)); // Stagger payments

        const estimatedDaily = investment.dailyProfitRate || (investment.amount * 0.001); // 0.1% daily estimate

        upcoming.push({
          date: nextPaymentDate.toISOString().split('T')[0],
          source: investment.investmentPlan?.name || `Investment ${index + 1}`,
          type: "Daily Profit",
          estimated: estimatedDaily
        });
      });

    // Sort by date
    const sortedUpcoming = upcoming
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);

    setUpcomingPayments(sortedUpcoming);
  };

  // Calculate metrics from real data
  const totalEarnings = investmentSummary?.totalProfits || 0;
  const totalInvested = investmentSummary?.totalInvested || 0;
  const monthlyAverage = totalEarnings / 12;
  const thisMonthEarnings = profitHistory
    .filter(item => {
      const itemDate = new Date(item.date);
      const now = new Date();
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, item) => sum + (item.totalProfit || 0), 0);

  const yieldRate = totalInvested > 0 ? ((totalEarnings / totalInvested) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Earnings</h1>
          <p className="text-sm text-gray-500 mt-1">Track your investment income and distributions</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download size={16} className="mr-2" />
          Export Report
        </button>
      </div>

      {loading.investments || isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Earnings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings YTD</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">${totalEarnings.toLocaleString()}</p>
                  <div className="flex items-center mt-2 text-green-600">
                    <TrendingUp size={16} className="mr-1" />
                    <span className="text-sm font-medium">+{((totalEarnings / Math.max(totalInvested, 1)) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <DollarSign size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Average</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">${monthlyAverage.toFixed(0)}</p>
                  <p className="text-sm text-gray-500 mt-2">Last 12 months</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <Calendar size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">${thisMonthEarnings.toFixed(0)}</p>
                  <div className="flex items-center mt-2 text-green-600">
                    <TrendingUp size={16} className="mr-1" />
                    <span className="text-sm font-medium">+{thisMonthEarnings > 0 ? ((thisMonthEarnings / monthlyAverage) * 100).toFixed(1) : '0.0'}%</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-full">
                  <DollarSign size={24} className="text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Yield Rate</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{yieldRate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500 mt-2">Annualized</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <TrendingUp size={24} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Payments */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Payments</h3>
            {upcomingPayments.length > 0 ? (
              <div className="space-y-4">
                {upcomingPayments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{payment.source}</p>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <Calendar size={14} className="mr-1" />
                        <span>{new Date(payment.date).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{payment.type}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${payment.estimated.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Estimated</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No upcoming payments</h4>
                <p>Your next payments will appear here once your investments become active.</p>
              </div>
            )}
          </div>

          {/* Earnings History */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings History</h3>
            {earningsData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Source</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earningsData.map((earning, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4 px-4 text-gray-600">
                          {new Date(earning.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-900">{earning.source}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {earning.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-900">
                          ${earning.amount.toFixed(2)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                            {earning.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign size={48} className="mx-auto mb-3 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No earnings yet</h4>
                <p>Your earnings history will appear here as your investments generate profits.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

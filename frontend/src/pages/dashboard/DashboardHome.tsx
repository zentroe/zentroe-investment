import DashboardStats from "@/components/dashboard/DashboardStats";
import SalesChart from "@/components/dashboard/SalesChart";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import TotalSales from "@/components/dashboard/TotalSales";
import PaymentHistory from "@/components/dashboard/PaymentHistory";
import UserInvestmentOverview from "@/components/dashboard/UserInvestmentOverview";
import InvestmentGrowthChart from "@/components/dashboard/InvestmentGrowthChart";
import WithdrawalWidget from "@/components/dashboard/WithdrawalWidget";
import { useEffect, useState } from "react";
import { getUserInvestmentSummary } from "@/services/userInvestmentService";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";

export default function DashboardHome() {
  const [monthlyProfit, setMonthlyProfit] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user: userProfile } = useUser();
  const { user: authUser } = useAuth();

  // Get user's display name
  const getUserGreeting = () => {
    const firstName = userProfile?.firstName || authUser?.email?.split('@')[0] || 'User';
    const currentHour = new Date().getHours();
    let greeting = 'Good day';

    if (currentHour < 12) greeting = 'Good morning';
    else if (currentHour < 17) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    return `${greeting}, ${firstName}`;
  };

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const summary = await getUserInvestmentSummary();
        // For now, use totalProfits as monthly profit
        // You could create a separate API endpoint for monthly data
        setMonthlyProfit(summary.totalProfits || 0);
      } catch (error) {
        console.error('Failed to fetch monthly data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {getUserGreeting()}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here's your investment overview</p>
        </div>
        {/* <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Rollover
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-primary to-orange-600 text-white rounded-lg text-sm font-medium hover:from-primary/90 hover:to-orange-600/90 transition-all shadow-md hover:shadow-lg">
            Add Target
          </button>
        </div> */}
      </div>

      {/* Stats Grid */}
      <DashboardStats />

      {/* Investment Overview */}
      <UserInvestmentOverview />

      {/* Investment Growth Chart */}
      <InvestmentGrowthChart />

      {/* Charts and Additional Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales Chart - Takes up 2 columns on xl screens */}
        <div className="xl:col-span-2">
          <SalesChart />
        </div>

        {/* Total Sales */}
        <div>
          <TotalSales />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingEvents />
        <PaymentHistory />
      </div>

      {/* Additional Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawal Widget */}
        <WithdrawalWidget />

        {/* Revenue This Month */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Profits Earned</h3>
          <div className="flex items-end space-x-4">
            <div>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900">
                    ${monthlyProfit.toLocaleString()}
                  </div>
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <span className="mr-1">↗</span>
                    Total Earnings from Investments
                  </p>
                </>
              )}
            </div>
            <div className="flex-1 h-16 bg-gray-50 rounded-lg flex items-end p-2">
              <div className="w-full h-full bg-primary rounded opacity-20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
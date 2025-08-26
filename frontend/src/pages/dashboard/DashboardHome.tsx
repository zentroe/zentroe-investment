import DashboardStats from "@/components/dashboard/DashboardStats";
import SalesChart from "@/components/dashboard/SalesChart";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import TotalSales from "@/components/dashboard/TotalSales";
import PaymentHistory from "@/components/dashboard/PaymentHistory";

export default function DashboardHome() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
            Investment Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Home / Default</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Rollover
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-primary to-orange-600 text-white rounded-lg text-sm font-medium hover:from-primary/90 hover:to-orange-600/90 transition-all shadow-md hover:shadow-lg">
            Add Target
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <DashboardStats />

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
        {/* Revenue This Month */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue This Month</h3>
          <div className="flex items-end space-x-4">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                $23,900
              </div>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <span className="mr-1">↗</span>
                1.5% Since Last Month
              </p>
            </div>
            <div className="flex-1 h-16 bg-gradient-to-r from-primary/20 to-orange-600/20 rounded-lg flex items-end p-2">
              <div className="w-full h-full bg-gradient-to-t from-primary to-orange-600 rounded opacity-70"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
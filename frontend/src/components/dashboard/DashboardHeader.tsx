import { Search, Bell } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { getUserDisplayName, getUserInitials, getUserInvestorType } from "@/services/userService";

export default function DashboardHeader() {
  const { user: userProfile, investments, paymentHistory } = useUser();

  // Check if user has any recent activity that would warrant notifications
  const hasRecentActivity = () => {
    // Check for recent investments or payments
    if (investments && investments.length > 0) return true;
    if (paymentHistory?.payments && paymentHistory.payments.length > 0) return true;
    return false;
  };
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-sm sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search investments, transactions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Theme Toggle */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-5 h-5 rounded-full bg-gray-300"></div>
          </button>

          {/* Notifications */}
          <button className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors">
            <Bell size={20} className="text-gray-600" />
            {hasRecentActivity() && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></span>
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-medium">{getUserInitials(userProfile)}</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{getUserDisplayName(userProfile)}</p>
              <p className="text-xs text-gray-500">{getUserInvestorType(userProfile)}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

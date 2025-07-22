import { Search, Bell } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-sm sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Type Something"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Theme Toggle */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-200 to-orange-300"></div>
          </button>

          {/* Notifications */}
          <button className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-orange-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-medium">EW</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">Emma Watson</p>
              <p className="text-xs text-gray-500">Premium Investor</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

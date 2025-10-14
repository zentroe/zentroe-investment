import { Search, Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { getUserDisplayName, getUserInitials, getUserInvestorType } from "@/services/userService";
import { logout } from "@/services/auth";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function DashboardHeader() {
  const { user: userProfile, investments, paymentHistory } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success('Successfully logged out');
      navigate('/auth/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

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

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-medium">{getUserInitials(userProfile)}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{getUserDisplayName(userProfile)}</p>
                <p className="text-sm text-gray-500">{getUserInvestorType(userProfile)}</p>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{getUserDisplayName(userProfile)}</p>
                  <p className="text-sm text-gray-500">{userProfile?.email}</p>
                </div>

                <Link
                  to="/dashboard/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={16} className="mr-3" />
                  Settings
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={16} className="mr-3" />
                  Profile
                </Link>

                <hr className="my-2" />

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut size={16} className="mr-3" />
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

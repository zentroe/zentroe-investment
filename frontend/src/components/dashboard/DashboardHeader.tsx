import { Search, Bell, ChevronDown, LogOut, Settings, User, Menu } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { getUserDisplayName, getUserInitials, getUserInvestorType } from "@/services/userService";
import { logout } from "@/services/auth";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function DashboardHeader({ onToggleSidebar, isSidebarOpen }: DashboardHeaderProps) {
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
    <header className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 sticky top-0 z-10 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Mobile Menu Button + Search Container */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleSidebar}
            className={`lg:hidden p-2 rounded-lg transition-colors touch-manipulation flex-shrink-0 ${isSidebarOpen
                ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                : 'hover:bg-gray-100 text-gray-600'
              }`}
            aria-label="Toggle sidebar menu"
          >
            <Menu size={20} />
          </button>

          {/* Search Bar - Responsive */}
          <div className="flex-1 max-w-[180px] xs:max-w-[220px] sm:max-w-sm md:max-w-md lg:max-w-lg">
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-gray-50/50 placeholder:text-gray-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Right Side Actions - Mobile Optimized */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Theme Toggle - Hidden on small mobile */}
          <button className="hidden xs:block p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-300"></div>
          </button>

          {/* Notifications */}
          <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg relative transition-colors touch-manipulation">
            <Bell size={18} className="sm:w-5 sm:h-5 text-gray-600" />
            {hasRecentActivity() && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded-full animate-pulse"></span>
            )}
          </button>

          {/* User Profile Dropdown - Mobile Optimized */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-3 p-1 sm:p-1.5 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation min-w-0"
            >
              {/* Avatar */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-white text-xs sm:text-sm font-medium">{getUserInitials(userProfile)}</span>
              </div>

              {/* User Info - Responsive visibility */}
              <div className="hidden sm:block md:block text-left min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px] lg:max-w-none">
                  {getUserDisplayName(userProfile)}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {getUserInvestorType(userProfile)}
                </p>
              </div>

              {/* Chevron */}
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu - Mobile Optimized */}
            {isDropdownOpen && (
              <>
                {/* Mobile overlay */}
                <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden" onClick={() => setIsDropdownOpen(false)} />

                {/* Dropdown content */}
                <div className="absolute right-0 mt-2 w-72 sm:w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 transform transition-all duration-200 animate-in slide-in-from-top-2">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white text-sm font-medium">{getUserInitials(userProfile)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{getUserDisplayName(userProfile)}</p>
                        <p className="text-xs text-gray-500 truncate">{userProfile?.email}</p>
                        <p className="text-xs text-primary font-medium">{getUserInvestorType(userProfile)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                    >
                      <Settings size={18} className="mr-3 text-gray-500" />
                      <span className="font-medium">Settings</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                    >
                      <User size={18} className="mr-3 text-gray-500" />
                      <span className="font-medium">Profile</span>
                    </Link>

                    <hr className="my-2 border-gray-100" />

                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    >
                      <LogOut size={18} className="mr-3" />
                      <span className="font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

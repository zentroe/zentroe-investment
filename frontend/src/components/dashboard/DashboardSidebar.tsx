import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  ArrowDownLeft,
  Shield,
  RefreshCw,
  Users,
  Settings,
  X,
  LogOut
} from "lucide-react";
import { logout } from "@/services/auth";
import { toast } from "sonner";
import Logo from "@/components/ui/Logo";
import logo from "@/assets/zenLogo.png";


interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems: NavigationItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Portfolio", path: "/dashboard/portfolio", icon: TrendingUp },
  { name: "Earnings", path: "/dashboard/earnings", icon: Wallet },
  { name: "Withdrawals", path: "/dashboard/withdrawals", icon: ArrowDownLeft },
  { name: "KYC Verification", path: "/dashboard/kyc", icon: Shield },
  { name: "Recurring", path: "/dashboard/recurring", icon: RefreshCw },
  { name: "Referrals", path: "/dashboard/referrals", icon: Users },
  { name: "Settings", path: "/dashboard/settings", icon: Settings },
];

export default function DashboardSidebar({ isOpen = false, onClose }: DashboardSidebarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 flex justify-end items-start bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-200 hover:bg-gray-100 rounded"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out shadow-lg lg:shadow-sm
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="flex items-center justify-start gap-4 p-6 border-b border-gray-200 bg-white">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <Logo variant="icon" size="sm" />
              <img src={logo} alt="Zentroe Logo" className="h-5" />
            </Link>

          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider px-3 mb-4">
                Main
              </p>
              {navigationItems.slice(0, 1).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon size={20} className="mr-3" />
                    {item.name}
                  </Link>
                );
              })}

              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider px-3 mb-4 mt-8">
                Investments
              </p>
              {navigationItems.slice(1, 5).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-primary to-orange-600 text-white shadow-md transform scale-105'
                        : 'text-gray-700 hover:bg-orange-50 hover:text-primary'
                      }
                    `}
                  >
                    <item.icon size={20} className="mr-3" />
                    {item.name}
                  </Link>
                );
              })}

              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider px-3 mb-4 mt-8">
                Account
              </p>
              {navigationItems.slice(5).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon size={20} className="mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-all duration-200 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut size={16} className="mr-2" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
            <div className="text-center">
              <p className="text-sm text-gray-500">Zentroe Investment Platform</p>
              <p className="text-sm text-gray-400 mt-1">v2.1.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
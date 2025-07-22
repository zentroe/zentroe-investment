import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  RefreshCw,
  Users,
  Settings,
  Menu,
  X
} from "lucide-react";
import Logo from "@/components/ui/Logo";

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navigationItems: NavigationItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Portfolio", path: "/dashboard/portfolio", icon: TrendingUp },
  { name: "Earnings", path: "/dashboard/earnings", icon: Wallet },
  { name: "Recurring", path: "/dashboard/recurring", icon: RefreshCw },
  { name: "Referrals", path: "/dashboard/referrals", icon: Users },
  { name: "Settings", path: "/dashboard/settings", icon: Settings },
];

export default function DashboardSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <Menu size={20} className="text-gray-600" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary to-orange-600">
            <Logo variant="icon" size="sm" className="text-white" />
            <div className="text-white">
              <h2 className="font-bold text-lg">Zentroe</h2>
              <p className="text-xs text-orange-100">Investment Platform</p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 text-white hover:bg-white/20 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-4">
                Main
              </p>
              {navigationItems.slice(0, 1).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
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

              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-4 mt-8">
                Investments
              </p>
              {navigationItems.slice(1, 4).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
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

              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-4 mt-8">
                Account
              </p>
              {navigationItems.slice(4).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
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
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center">
              <p className="text-xs text-gray-500">Zentroe Investment Platform</p>
              <p className="text-xs text-gray-400 mt-1">v2.1.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
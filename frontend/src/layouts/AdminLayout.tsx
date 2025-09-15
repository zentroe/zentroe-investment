import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Wallet,
  Building2,
  Users,
  FileText,
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { adminLogout, getAdminProfile, type AdminProfile } from '@/services/adminService';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: number;
}

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/x-admin/dashboard'
    },
    {
      id: 'deposits',
      label: 'Deposits',
      icon: CreditCard,
      path: '/x-admin/dashboard/deposits',
      badge: 5 // This would come from API
    },
    {
      id: 'payments',
      label: 'Payment Config',
      icon: Settings,
      path: '/x-admin/dashboard/payments-config'
    },
    {
      id: 'crypto-wallets',
      label: 'Crypto Wallets',
      icon: Wallet,
      path: '/x-admin/dashboard/crypto-wallets'
    },
    {
      id: 'bank-accounts',
      label: 'Bank Accounts',
      icon: Building2,
      path: '/x-admin/dashboard/bank-accounts'
    },
    {
      id: 'card-payments',
      label: 'Card Payments',
      icon: CreditCard,
      path: '/x-admin/dashboard/card-payments'
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      path: '/x-admin/dashboard/users'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      path: '/x-admin/dashboard/reports'
    },
    {
      id: 'logs',
      label: 'Activity Logs',
      icon: FileText,
      path: '/x-admin/dashboard/logs'
    }
  ];

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const profile = await getAdminProfile();
      setAdminProfile(profile);
    } catch (error) {
      console.error('Failed to fetch admin profile:', error);
      navigate('/x-admin');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      toast.success('Logged out successfully');
      navigate('/x-admin');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  const isActivePage = (path: string) => {
    return location.pathname === path;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Zentroe Investment</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:static`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Z</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Zentroe Admin</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-md hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActivePage(item.path)
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Admin Profile */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {adminProfile?.name || adminProfile?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {adminProfile?.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {sidebarItems.find(item => isActivePage(item.path))?.label || 'Admin Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>

              {/* Admin Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {adminProfile?.name || adminProfile?.email}
                </span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default AdminLayout;

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Users,
  CreditCard,
  Building,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getDashboardStats, getRecentActivity, type DashboardStats } from '@/services/adminService';

interface RecentActivity {
  id: string;
  type: string;
  action: string;
  amount: number;
  paymentMethod: string;
  user: {
    name: string;
    email: string;
  } | null;
  timestamp: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Refresh dashboard data every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats and recent activity in parallel
      const [statsResponse, activityResponse] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(5) // Get 5 recent activities
      ]);

      console.log('Stats response:', statsResponse);
      console.log('Activity response:', activityResponse);

      setStats(statsResponse);

      // Ensure recentActivity is always an array
      if (activityResponse && Array.isArray(activityResponse.activities)) {
        setRecentActivity(activityResponse.activities);
      } else if (Array.isArray(activityResponse)) {
        // Handle case where response is directly an array
        setRecentActivity(activityResponse);
      } else {
        console.warn('Recent activity response is not in expected format:', activityResponse);
        setRecentActivity([]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Ensure we always have safe defaults on error
      setStats(null);
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Zentroe</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage payments and user accounts</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Pending Deposits</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingDeposits || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Deposits</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalDeposits || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Card Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalCardPayments || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Wallet className="h-6 w-6 text-orange-500" />
                <h3 className="text-lg font-semibold ml-2">Crypto Payments</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.cryptoPayments || 0}</p>
              <p className="text-sm text-gray-600">Active transactions</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Building className="h-6 w-6 text-blue-500" />
                <h3 className="text-lg font-semibold ml-2">Bank Transfers</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.bankTransfers || 0}</p>
              <p className="text-sm text-gray-600">Wire transfers</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="h-6 w-6 text-green-500" />
                <h3 className="text-lg font-semibold ml-2">Card Payments</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.cardPayments || 0}</p>
              <p className="text-sm text-gray-600">Manual processing</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Clock className="h-6 w-6 text-yellow-500 mb-2" />
                <p className="font-medium">Review Pending</p>
                <p className="text-sm text-gray-600">Check pending deposits</p>
              </button>

              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Wallet className="h-6 w-6 text-orange-500 mb-2" />
                <p className="font-medium">Manage Wallets</p>
                <p className="text-sm text-gray-600">Add crypto wallets</p>
              </button>

              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Building className="h-6 w-6 text-blue-500 mb-2" />
                <p className="font-medium">Bank Accounts</p>
                <p className="text-sm text-gray-600">Manage bank details</p>
              </button>

              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <CreditCard className="h-6 w-6 text-purple-500 mb-2" />
                <p className="font-medium">Payment Config</p>
                <p className="text-sm text-gray-600">Toggle payment methods</p>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {Array.isArray(recentActivity) && recentActivity.length > 0 ? (
                (recentActivity || []).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {activity.action === 'approved' && (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      )}
                      {activity.action === 'pending' && (
                        <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                      )}
                      {activity.action === 'rejected' && (
                        <XCircle className="h-5 w-5 text-red-500 mr-3" />
                      )}
                      <div>
                        <p className="font-medium">
                          {activity.paymentMethod.charAt(0).toUpperCase() + activity.paymentMethod.slice(1)} payment {activity.action}
                        </p>
                        <p className="text-sm text-gray-600">
                          ${activity.amount.toLocaleString()} - {activity.user?.name || 'Unknown User'}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center p-8 text-gray-500">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

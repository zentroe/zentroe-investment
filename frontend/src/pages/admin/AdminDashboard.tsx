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

interface DashboardStats {
  totalUsers: number;
  pendingDeposits: number;
  totalDeposits: number;
  cryptoPayments: number;
  bankTransfers: number;
  cardPayments: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls - in real implementation, these would be actual API endpoints
      const mockStats: DashboardStats = {
        totalUsers: 1247,
        pendingDeposits: 23,
        totalDeposits: 156,
        cryptoPayments: 45,
        bankTransfers: 78,
        cardPayments: 33
      };

      setTimeout(() => {
        setStats(mockStats);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Pending Deposits</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingDeposits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Deposits</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalDeposits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Card Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.cardPayments}</p>
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
              <p className="text-3xl font-bold text-gray-900">{stats?.cryptoPayments}</p>
              <p className="text-sm text-gray-600">Active transactions</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Building className="h-6 w-6 text-blue-500" />
                <h3 className="text-lg font-semibold ml-2">Bank Transfers</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.bankTransfers}</p>
              <p className="text-sm text-gray-600">Wire transfers</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="h-6 w-6 text-green-500" />
                <h3 className="text-lg font-semibold ml-2">Card Payments</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.cardPayments}</p>
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
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <p className="font-medium">Crypto payment approved</p>
                    <p className="text-sm text-gray-600">$5,000 - Bitcoin payment</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">2 mins ago</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                  <div>
                    <p className="font-medium">Bank transfer pending</p>
                    <p className="text-sm text-gray-600">$10,000 - Wire transfer</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">15 mins ago</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="font-medium">Card payment failed</p>
                    <p className="text-sm text-gray-600">$2,500 - Insufficient funds</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

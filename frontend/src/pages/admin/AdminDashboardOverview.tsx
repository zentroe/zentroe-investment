import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  Building,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight
} from 'lucide-react';
import { getDashboardStats, getRecentActivity } from '@/services/adminService';

interface DashboardStats {
  totalUsers: number;
  pendingDeposits: number;
  totalDeposits: number;
  approvedDeposits: number;
  rejectedDeposits: number;
  totalAmount: number;
  cryptoPayments: number;
  bankTransfers: number;
  cardPayments: number;
}

interface RecentActivity {
  id: string;
  type: 'deposit' | 'payment' | 'user';
  description: string;
  amount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  timestamp: string;
  user: {
    name: string;
    email: string;
  };
}

const AdminDashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Try to fetch real data, fall back to mock data if needed
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          getDashboardStats(),
          getRecentActivity(10)
        ]);

        setStats(statsResponse.data || statsResponse);

        // Handle recent activity response properly
        if (activityResponse && Array.isArray(activityResponse.activities)) {
          setRecentActivity(activityResponse.activities);
        } else if (Array.isArray(activityResponse)) {
          setRecentActivity(activityResponse);
        } else {
          console.warn('Recent activity response is not in expected format:', activityResponse);
          setRecentActivity([]);
        }
        setLoading(false);
        return;
      } catch (apiError) {
        console.log('API not available, using mock data');
      }

      // Mock data fallback
      const mockStats: DashboardStats = {
        totalUsers: 1247,
        pendingDeposits: 23,
        totalDeposits: 156,
        approvedDeposits: 120,
        rejectedDeposits: 13,
        totalAmount: 2450000,
        cryptoPayments: 45,
        bankTransfers: 78,
        cardPayments: 33
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'deposit',
          description: 'Crypto deposit via Bitcoin',
          amount: 5000,
          status: 'pending',
          timestamp: '2 minutes ago',
          user: { name: 'John Doe', email: 'john@example.com' }
        },
        {
          id: '2',
          type: 'deposit',
          description: 'Bank transfer deposit',
          amount: 10000,
          status: 'approved',
          timestamp: '15 minutes ago',
          user: { name: 'Jane Smith', email: 'jane@example.com' }
        },
        {
          id: '3',
          type: 'user',
          description: 'New user registration',
          status: 'completed',
          timestamp: '1 hour ago',
          user: { name: 'Mike Johnson', email: 'mike@example.com' }
        }
      ];

      setTimeout(() => {
        setStats(mockStats);
        setRecentActivity(mockActivity);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Ensure safe defaults on error
      setStats(null);
      setRecentActivity([]);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'approved':
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+12%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Deposits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingDeposits}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-yellow-600">Requires attention</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Deposits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDeposits}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+8%</span>
            <span className="text-gray-500 ml-1">from last week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+15%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-900">Cryptocurrency</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.cryptoPayments}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-900">Bank Transfer</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.bankTransfers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-900">Card Payment</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.cardPayments}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deposit Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-900">Approved</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.approvedDeposits}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900">Pending</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.pendingDeposits}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-gray-900">Rejected</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats.rejectedDeposits}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.isArray(recentActivity) && recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(activity.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-500">
                        {activity.user.name} • {activity.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {activity.amount && (
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                    <span className="text-sm text-gray-500">{activity.timestamp}</span>
                  </div>
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
  );
};

export default AdminDashboardOverview;

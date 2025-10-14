import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Download,
  Eye,
  CreditCard,
  Building,
  Wallet
} from 'lucide-react';

interface ReportStats {
  totalUsers: number;
  userGrowth: number;
  totalDeposits: number;
  depositGrowth: number;
  totalInvestments: number;
  investmentGrowth: number;
  averageInvestment: number;
  kycApprovalRate: number;
}

interface PaymentMethodStats {
  crypto: { count: number; amount: number };
  bank: { count: number; amount: number };
  card: { count: number; amount: number };
}

interface MonthlyData {
  month: string;
  users: number;
  deposits: number;
  investments: number;
}

const AdminReports: React.FC = () => {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [paymentStats, setPaymentStats] = useState<PaymentMethodStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Mock data - in production, this would come from API
      const mockStats: ReportStats = {
        totalUsers: 1247,
        userGrowth: 12.5,
        totalDeposits: 156,
        depositGrowth: 8.3,
        totalInvestments: 2450000,
        investmentGrowth: 15.7,
        averageInvestment: 15705,
        kycApprovalRate: 89.2
      };

      const mockPaymentStats: PaymentMethodStats = {
        crypto: { count: 45, amount: 890000 },
        bank: { count: 78, amount: 1250000 },
        card: { count: 33, amount: 310000 }
      };

      const mockMonthlyData: MonthlyData[] = [
        { month: 'Sep', users: 156, deposits: 23, investments: 450000 },
        { month: 'Oct', users: 189, deposits: 31, investments: 580000 },
        { month: 'Nov', users: 234, deposits: 42, investments: 720000 },
        { month: 'Dec', users: 298, deposits: 38, investments: 650000 },
        { month: 'Jan', users: 347, deposits: 45, investments: 890000 },
        { month: 'Feb', users: 412, deposits: 52, investments: 1020000 }
      ];

      setTimeout(() => {
        setStats(mockStats);
        setPaymentStats(mockPaymentStats);
        setMonthlyData(mockMonthlyData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
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

  if (!stats || !paymentStats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive overview of platform performance and metrics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
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
            {stats.userGrowth > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={stats.userGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
              {formatPercentage(stats.userGrowth)}
            </span>
            <span className="text-gray-500 ml-1">vs last period</span>
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
            {stats.depositGrowth > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={stats.depositGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
              {formatPercentage(stats.depositGrowth)}
            </span>
            <span className="text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Investments</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalInvestments)}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {stats.investmentGrowth > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={stats.investmentGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
              {formatPercentage(stats.investmentGrowth)}
            </span>
            <span className="text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Investment</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageInvestment)}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-blue-600">{stats.kycApprovalRate.toFixed(1)}%</span>
            <span className="text-gray-500 ml-1">KYC approval rate</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
          <div className="space-y-4">
            {monthlyData.map((month) => (
              <div key={month.month} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 w-8">{month.month}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-blue-600">{month.users} users</span>
                      <span className="text-green-600">{month.deposits} deposits</span>
                      <span className="text-purple-600">{formatCurrency(month.investments)}</span>
                    </div>
                  </div>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (month.investments / Math.max(...monthlyData.map(m => m.investments))) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Wallet className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Cryptocurrency</p>
                  <p className="text-sm text-gray-500">{paymentStats.crypto.count} transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{formatCurrency(paymentStats.crypto.amount)}</p>
                <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
                  <div className="bg-orange-500 h-1 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Bank Transfer</p>
                  <p className="text-sm text-gray-500">{paymentStats.bank.count} transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{formatCurrency(paymentStats.bank.amount)}</p>
                <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
                  <div className="bg-blue-500 h-1 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Card Payment</p>
                  <p className="text-sm text-gray-500">{paymentStats.card.count} transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{formatCurrency(paymentStats.card.amount)}</p>
                <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
                  <div className="bg-green-500 h-1 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Reports</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">User Activity Report</p>
                  <p className="text-sm text-gray-500">Registration and engagement metrics</p>
                </div>
              </div>
              <Eye className="h-4 w-4 text-gray-400" />
            </button>

            <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Financial Report</p>
                  <p className="text-sm text-gray-500">Revenue and transaction analysis</p>
                </div>
              </div>
              <Eye className="h-4 w-4 text-gray-400" />
            </button>

            <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Performance Report</p>
                  <p className="text-sm text-gray-500">KPIs and growth metrics</p>
                </div>
              </div>
              <Eye className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;

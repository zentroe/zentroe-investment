import { useEffect, useState } from 'react';
import axios from '@/utils/axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Pause,
  Play,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';

interface Investment {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  investmentPlan: {
    name: string;
    profitPercentage: number;
    duration: number;
  };
  amount: number;
  status: 'pending' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  totalProfitsEarned: number;
  dailyProfitRate: number;
  createdAt: string;
}

export default function AdminInvestmentManagement() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchInvestments();
  }, [statusFilter, searchTerm]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '50',
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      console.log('🔍 Fetching investments with URL:', `/admin/investments?${params}`);

      const response = await axios.get(`/admin/investments?${params}`);
      console.log('� Raw API response:', response.data);

      let filteredInvestments = response.data.investments || [];
      console.log('💼 Investments array:', filteredInvestments);
      console.log('🔢 Number of investments:', filteredInvestments.length);

      // Client-side search filter
      if (searchTerm) {
        filteredInvestments = filteredInvestments.filter((inv: Investment) =>
          `${inv.user.firstName} ${inv.user.lastName} ${inv.user.email}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      }

      setInvestments(filteredInvestments);
    } catch (error) {
      console.error('❌ Failed to fetch investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvestmentAction = async (investmentId: string, action: 'pause' | 'resume' | 'complete') => {
    try {
      await axios.put(`/admin/investments/${investmentId}/${action}`, {
        reason: action === 'pause' ? 'Admin action' : undefined
      });

      fetchInvestments(); // Refresh the list
      alert(`Investment ${action}d successfully!`);
    } catch (error) {
      console.error(`Failed to ${action} investment:`, error);
      alert(`Failed to ${action} investment`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investment Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all user investments</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchInvestments()}
            className="bg-green-600 hover:bg-green-700"
          >
            🔄 Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Investments</p>
                <p className="text-2xl font-bold">{investments.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {investments.filter(inv => inv.status === 'active').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(investments.reduce((sum, inv) => sum + inv.amount, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Profits</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(investments.reduce((sum, inv) => sum + inv.totalProfitsEarned, 0))}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>All Investments ({investments.length})</CardTitle>
              <CardDescription>Manage and monitor user investments with real-time controls</CardDescription>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : investments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No investments found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {investments.map((investment) => (
                <div
                  key={investment._id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {investment.user.firstName} {investment.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{investment.user.email}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Investment ID: {investment._id.slice(-8)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(investment.status)}>
                        {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatCurrency(investment.amount)}</p>
                        <p className="text-sm text-gray-600">
                          {investment.investmentPlan.name}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          {investment.investmentPlan.profitPercentage}% APY
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {investment.status === 'active' && (
                          <Button
                            variant="outline"
                            onClick={() => handleInvestmentAction(investment._id, 'pause')}
                            className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                          >
                            <Pause className="h-4 w-4" />
                            Pause
                          </Button>
                        )}

                        {investment.status === 'paused' && (
                          <Button
                            variant="outline"
                            onClick={() => handleInvestmentAction(investment._id, 'resume')}
                            className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Play className="h-4 w-4" />
                            Resume
                          </Button>
                        )}

                        {(investment.status === 'active' || investment.status === 'paused') && (
                          <Button
                            onClick={() => handleInvestmentAction(investment._id, 'complete')}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium">{formatDate(investment.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="font-medium">{formatDate(investment.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Profits Earned</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(investment.totalProfitsEarned)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Daily Rate</p>
                      <p className="font-medium">{investment.dailyProfitRate.toFixed(4)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium">{investment.investmentPlan.duration} days</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
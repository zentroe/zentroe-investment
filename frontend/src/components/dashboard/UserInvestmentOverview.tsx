import { useEffect, useState } from 'react';
import { getUserInvestments, getUserInvestmentSummary } from '@/services/userInvestmentService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign,
  TrendingUp,
  Target,
  Activity,
  Pause,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Investment {
  _id: string;
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
}

interface InvestmentSummary {
  totalProfits: number;
  totalInvestments: number;
  activeInvestments: number;
}

export default function UserInvestmentOverview() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<InvestmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestmentData();
  }, []);

  const fetchInvestmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [investmentsData, summaryData] = await Promise.all([
        getUserInvestments(),
        getUserInvestmentSummary()
      ]);

      setInvestments(investmentsData);
      setSummary(summaryData);
    } catch (err) {
      setError('Failed to load investment data');
      console.error('Fetch investment data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Activity className="h-4 w-4 text-green-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
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

  const calculateProgress = (investment: Investment) => {
    const now = new Date();
    const start = new Date(investment.startDate);
    const end = new Date(investment.endDate);

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Your Investments</CardTitle>
          <CardDescription className="text-sm sm:text-base">Track your investment performance</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="flex flex-col items-center justify-center h-32 sm:h-40 space-y-3">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-gray-500">Loading your investments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm border-red-200">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl text-red-600">Your Investments</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="flex flex-col items-center justify-center h-32 sm:h-40 space-y-3 text-center">
            <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
            <div>
              <p className="text-red-500 font-medium text-sm sm:text-base">Failed to load investments</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards - Mobile Optimized */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Profits</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">
                    {formatCurrency(summary.totalProfits)}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Investments</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600 truncate">
                    {summary.totalInvestments}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Active Investments</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600 truncate">
                    {summary.activeInvestments}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Investments List - Mobile Optimized */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
            Your Investments
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Track your investment performance and growth
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {investments.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 font-medium">No investments yet</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Start investing to see your portfolio here
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {investments.map((investment) => (
                <div
                  key={investment._id}
                  className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200 bg-white"
                >
                  {/* Mobile: Stack layout, Desktop: Side by side */}
                  <div className="space-y-3 sm:space-y-0">
                    {/* Header - Investment name, status, amount */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                          <div className="flex-shrink-0">
                            {getStatusIcon(investment.status)}
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {investment.investmentPlan.name}
                          </h3>
                          <Badge className={`${getStatusColor(investment.status)} text-xs flex-shrink-0`}>
                            {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      {/* Amount and APY */}
                      <div className="flex items-center justify-between sm:text-right sm:block">
                        <div>
                          <p className="font-semibold text-base sm:text-lg text-gray-900">
                            {formatCurrency(investment.amount)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {investment.investmentPlan.profitPercentage}% APY
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Investment Details Grid - Mobile Responsive */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-2 sm:pt-0">
                      <div className="bg-gray-50/50 rounded-lg p-2.5 sm:p-3">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Profits Earned</p>
                        <p className="font-semibold text-green-600 text-sm sm:text-base">
                          {formatCurrency(investment.totalProfitsEarned)}
                        </p>
                      </div>
                      <div className="bg-gray-50/50 rounded-lg p-2.5 sm:p-3">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Start Date</p>
                        <p className="font-medium text-sm sm:text-base">{formatDate(investment.startDate)}</p>
                      </div>
                      <div className="bg-gray-50/50 rounded-lg p-2.5 sm:p-3 xs:col-span-2 sm:col-span-1">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">End Date</p>
                        <p className="font-medium text-sm sm:text-base">{formatDate(investment.endDate)}</p>
                      </div>
                    </div>

                    {/* Progress Bar for Active Investments */}
                    {investment.status === 'active' && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 font-medium">Investment Progress</span>
                          <span className="font-semibold text-primary">
                            {calculateProgress(investment).toFixed(0)}%
                          </span>
                        </div>
                        <Progress
                          value={calculateProgress(investment)}
                          className="h-1.5 sm:h-2 bg-gray-100"
                        />
                      </div>
                    )}
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
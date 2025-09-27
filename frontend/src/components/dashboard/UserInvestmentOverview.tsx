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
      <Card>
        <CardHeader>
          <CardTitle>Your Investments</CardTitle>
          <CardDescription>Track your investment performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Profits</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalProfits)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Investments</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {summary.totalInvestments}
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Investments</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {summary.activeInvestments}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Investments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Your Investments
          </CardTitle>
          <CardDescription>Track your investment performance and growth</CardDescription>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No investments yet</p>
              <p className="text-sm text-gray-400">Start investing to see your portfolio here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {investments.map((investment) => (
                <div
                  key={investment._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(investment.status)}
                        <h3 className="font-semibold text-gray-900">
                          {investment.investmentPlan.name}
                        </h3>
                      </div>
                      <Badge className={getStatusColor(investment.status)}>
                        {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {formatCurrency(investment.amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {investment.investmentPlan.profitPercentage}% APY
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Profits Earned</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(investment.totalProfitsEarned)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium">{formatDate(investment.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="font-medium">{formatDate(investment.endDate)}</p>
                    </div>
                  </div>

                  {investment.status === 'active' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {calculateProgress(investment).toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={calculateProgress(investment)} className="h-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
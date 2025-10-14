import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { getUserInvestmentsForWithdrawal, InvestmentWithWithdrawal } from '@/services/withdrawalService';
import { formatCurrency } from '@/utils/formatters';
import {
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const WithdrawalWidget: React.FC = () => {
  const [investments, setInvestments] = useState<InvestmentWithWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserInvestmentsForWithdrawal();
      setInvestments(data);
    } catch (error) {
      console.error('Error fetching investments for withdrawal:', error);
      setError('Failed to load withdrawal data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAvailable = () => {
    return investments.reduce((total, investment) => {
      return total + (investment.withdrawalEligibility.canWithdraw ? investment.withdrawalEligibility.availableAmount : 0);
    }, 0);
  };

  const getEligibleInvestmentsCount = () => {
    return investments.filter(inv => inv.withdrawalEligibility.canWithdraw && inv.withdrawalEligibility.availableAmount > 0).length;
  };

  const getTotalProfitsEarned = () => {
    return investments.reduce((total, investment) => total + investment.totalProfitsEarned, 0);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Withdrawals</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={fetchInvestments}
          className="w-full"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  const totalAvailable = calculateTotalAvailable();
  const eligibleCount = getEligibleInvestmentsCount();
  const totalProfits = getTotalProfitsEarned();

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <ArrowDownLeft className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Withdrawals</h3>
            <p className="text-sm text-gray-600">Manage your funds</p>
          </div>
        </div>
        <Link to="/dashboard/withdrawals">
          <Button variant="outline" className="flex items-center gap-2 px-3 py-1">
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {investments.length === 0 ? (
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">No investments available yet</p>
          <p className="text-gray-500 text-sm">Start investing to enable withdrawals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Available</span>
              </div>
              <div className="text-lg font-bold text-green-900 mt-1">
                {formatCurrency(totalAvailable)}
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Profits</span>
              </div>
              <div className="text-lg font-bold text-blue-900 mt-1">
                {formatCurrency(totalProfits)}
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Eligible</span>
              </div>
              <div className="text-lg font-bold text-purple-900 mt-1">
                {eligibleCount} {eligibleCount === 1 ? 'Investment' : 'Investments'}
              </div>
            </div>
          </div>

          {/* Quick Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {totalAvailable > 0 ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Withdrawals Available
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-gray-900">
                    No Withdrawals Available
                  </span>
                </>
              )}
            </div>
            {totalAvailable > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {formatCurrency(totalAvailable)}
              </Badge>
            )}
          </div>

          {/* Action Button */}
          <Link to="/dashboard/withdrawals" className="block">
            <Button
              className="w-full"
              disabled={totalAvailable <= 0}
              variant={totalAvailable > 0 ? 'default' : 'outline'}
            >
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              {totalAvailable > 0 ? 'Request Withdrawal' : 'View Investments'}
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
};

export default WithdrawalWidget;
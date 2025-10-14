import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUserWithdrawalHistory, Withdrawal } from '@/services/withdrawalService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  Bell,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowDownLeft,
  Eye
} from 'lucide-react';

const WithdrawalNotifications: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchRecentWithdrawals();
  }, []);

  const fetchRecentWithdrawals = async () => {
    try {
      setLoading(true);
      const data = await getUserWithdrawalHistory(1, 5);
      setWithdrawals(data.withdrawals);
    } catch (error) {
      console.error('Error fetching recent withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'processing':
        return <ArrowDownLeft className="w-4 h-4 text-orange-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return formatDate(date);
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (withdrawals.length === 0) {
    return null;
  }

  const displayWithdrawals = showAll ? withdrawals : withdrawals.slice(0, 3);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-100 rounded">
            <Bell className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Withdrawal Updates</h3>
        </div>
        {withdrawals.length > 3 && (
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="text-sm px-3 py-1"
          >
            {showAll ? 'Show Less' : `View All (${withdrawals.length})`}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {displayWithdrawals.map((withdrawal) => (
          <div
            key={withdrawal._id}
            className="p-3 rounded-lg border bg-gray-50 border-gray-200"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {getStatusIcon(withdrawal.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 leading-relaxed">
                  {formatCurrency(withdrawal.netAmount)} withdrawal {withdrawal.status} ({getTimeAgo(new Date(withdrawal.requestedAt))})
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-blue-100 text-blue-800 text-sm">
                    {withdrawal.status}
                  </Badge>
                  {withdrawal.transactionId && (
                    <Badge variant="outline" className="text-sm">
                      ID: {withdrawal.transactionId.slice(-6)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2 py-2"
          onClick={() => window.location.href = '/dashboard/withdrawals'}
        >
          <Eye className="w-4 h-4" />
          View All Withdrawals
        </Button>
      </div>
    </Card>
  );
};

export default WithdrawalNotifications;
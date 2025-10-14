import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUserInvestmentsForWithdrawal, InvestmentWithWithdrawal } from '@/services/withdrawalService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import WithdrawalRequestModal from './components/WithdrawalRequestModal';
import WithdrawalHistory from './components/WithdrawalHistory';
import { toast } from 'sonner';
import { ArrowDownLeft, DollarSign, TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react';

const WithdrawalsPage: React.FC = () => {
  const [investments, setInvestments] = useState<InvestmentWithWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentWithWithdrawal | null>(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'investments' | 'history'>('investments');

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const data = await getUserInvestmentsForWithdrawal();
      setInvestments(data);
    } catch (error) {
      console.error('Error fetching investments:', error);
      toast.error('Failed to fetch investments');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawClick = (investment: InvestmentWithWithdrawal) => {
    if (!investment.withdrawalEligibility.canWithdraw) {
      toast.error('Withdrawal not available for this investment');
      return;
    }
    setSelectedInvestment(investment);
    setShowWithdrawalModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWithdrawalStatusMessage = (eligibility: InvestmentWithWithdrawal['withdrawalEligibility']) => {
    if (!eligibility.canWithdraw) {
      // Check if it's a KYC-related error
      const isKYCError = eligibility.errors[0]?.toLowerCase().includes('kyc');

      return (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${isKYCError ? 'text-red-600 bg-red-50 border border-red-200' : 'text-amber-600 bg-amber-50'
          }`}>
          <AlertCircle className="w-4 h-4" />
          <div className="flex-1">
            <span className="text-sm">{eligibility.errors[0]}</span>
            {isKYCError && (
              <div className="mt-2">
                <Link
                  to="/dashboard/kyc"
                  className="inline-flex items-center text-sm font-medium text-red-700 hover:text-red-800 underline"
                >
                  Complete KYC Verification →
                </Link>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (eligibility.availableAmount > 0) {
      return (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">
            {formatCurrency(eligibility.availableAmount)} available for withdrawal
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-3 rounded-lg">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">No funds available for withdrawal yet</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Withdrawals</h1>
          <p className="text-gray-600">
            Manage your investment withdrawals and view transaction history
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b">
            <button
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'investments'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('investments')}
            >
              Available Investments
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('history')}
            >
              Withdrawal History
            </button>
          </div>
        </div>

        {activeTab === 'investments' ? (
          <>
            {investments.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <DollarSign className="w-16 h-16 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900">No Investments Found</h3>
                  <p className="text-gray-600 max-w-md">
                    You don't have any active investments yet. Start investing to see your withdrawal options here.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {investments.map((investment) => (
                  <Card key={investment._id} className="p-6 hover:shadow-lg transition-shadow">
                    {/* Investment Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(investment.status)}
                        <Badge className={getStatusColor(investment.status)}>
                          {investment.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(investment.amount)}
                        </div>
                        <div className="text-sm text-gray-500">Principal</div>
                      </div>
                    </div>

                    {/* Investment Plan */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {investment.investmentPlan.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {investment.investmentPlan.dailyProfitRate}% daily return
                      </p>
                    </div>

                    {/* Financial Summary */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Profits Earned:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(investment.totalProfitsEarned)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Withdrawn:</span>
                        <span className="font-medium">
                          {formatCurrency(investment.totalWithdrawn)}
                        </span>
                      </div>
                    </div>

                    {/* Investment Period */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Start:</span>
                        <span>{formatDate(investment.startDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>End:</span>
                        <span>{formatDate(investment.endDate)}</span>
                      </div>
                    </div>

                    {/* Withdrawal Status */}
                    <div className="mb-4">
                      {getWithdrawalStatusMessage(investment.withdrawalEligibility)}
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleWithdrawClick(investment)}
                      disabled={!investment.withdrawalEligibility.canWithdraw || investment.withdrawalEligibility.availableAmount <= 0}
                      className="w-full"
                      variant={investment.withdrawalEligibility.canWithdraw && investment.withdrawalEligibility.availableAmount > 0 ? 'default' : 'outline'}
                    >
                      <ArrowDownLeft className="w-4 h-4 mr-2" />
                      {investment.withdrawalEligibility.canWithdraw && investment.withdrawalEligibility.availableAmount > 0
                        ? 'Withdraw Funds'
                        : 'Withdrawal Unavailable'}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <WithdrawalHistory />
        )}

        {/* Withdrawal Request Modal */}
        {showWithdrawalModal && selectedInvestment && (
          <WithdrawalRequestModal
            investment={selectedInvestment}
            onClose={() => {
              setShowWithdrawalModal(false);
              setSelectedInvestment(null);
            }}
            onSuccess={() => {
              setShowWithdrawalModal(false);
              setSelectedInvestment(null);
              fetchInvestments();
              toast.success('Withdrawal request submitted successfully');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default WithdrawalsPage;
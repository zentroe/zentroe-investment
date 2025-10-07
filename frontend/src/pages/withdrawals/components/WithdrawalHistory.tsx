import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUserWithdrawalHistory, cancelWithdrawalRequest, WithdrawalHistory as WithdrawalHistoryType, Withdrawal } from '@/services/withdrawalService';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { toast } from 'sonner';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  CreditCard,
  Wallet,
  Mail,
  Eye,
  X,
  FileText
} from 'lucide-react';

const WithdrawalHistory: React.FC = () => {
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistoryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawalHistory();
  }, [currentPage]);

  const fetchWithdrawalHistory = async () => {
    try {
      setLoading(true);
      const data = await getUserWithdrawalHistory(currentPage, 10);
      setWithdrawalHistory(data);
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      toast.error('Failed to fetch withdrawal history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWithdrawal = async (withdrawalId: string) => {
    if (!confirm('Are you sure you want to cancel this withdrawal request?')) {
      return;
    }

    try {
      setCancelling(withdrawalId);
      await cancelWithdrawalRequest(withdrawalId);
      toast.success('Withdrawal request cancelled successfully');
      fetchWithdrawalHistory();
    } catch (error: any) {
      console.error('Error cancelling withdrawal:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel withdrawal request');
    } finally {
      setCancelling(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'crypto':
        return <Wallet className="w-4 h-4 text-orange-600" />;
      case 'check':
        return <Mail className="w-4 h-4 text-green-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'crypto':
        return 'Cryptocurrency';
      case 'check':
        return 'Physical Check';
      default:
        return method;
    }
  };

  const formatWithdrawalType = (type: string) => {
    switch (type) {
      case 'profits_only':
        return 'Profits Only';
      case 'full_withdrawal':
        return 'Full Withdrawal';
      case 'partial_principal':
        return 'Custom Amount';
      default:
        return type;
    }
  };

  const renderWithdrawalDetailsModal = () => {
    if (!selectedWithdrawal || !showDetails) return null;

    const withdrawal = selectedWithdrawal;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Withdrawal Details</h2>
                <p className="text-gray-600">Request ID: {withdrawal._id}</p>
              </div>
              <Button variant="outline" onClick={() => setShowDetails(false)} className="p-2">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Status and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Request Status</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(withdrawal.status)}
                    <Badge className={getStatusColor(withdrawal.status)}>
                      {withdrawal.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Requested: {formatDate(withdrawal.requestedAt)}
                  </div>
                  {withdrawal.reviewedAt && (
                    <div className="text-sm text-gray-600">
                      Reviewed: {formatDate(withdrawal.reviewedAt)}
                    </div>
                  )}
                  {withdrawal.processedAt && (
                    <div className="text-sm text-gray-600">
                      Processed: {formatDate(withdrawal.processedAt)}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Financial Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Withdrawal Amount:</span>
                      <span className="font-medium">{formatCurrency(withdrawal.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Fee:</span>
                      <span className="font-medium">{formatCurrency(withdrawal.fees)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Net Amount:</span>
                      <span className="text-green-600">{formatCurrency(withdrawal.netAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div>
                <h3 className="font-semibold mb-3">Amount Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-700">Principal Amount</div>
                    <div className="text-lg font-semibold text-blue-900">
                      {formatCurrency(withdrawal.principalAmount)}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-700">Profit Amount</div>
                    <div className="text-lg font-semibold text-green-900">
                      {formatCurrency(withdrawal.profitAmount)}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-700">Withdrawal Type</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatWithdrawalType(withdrawal.type)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-semibold mb-3">Payment Method</h3>
                <div className="flex items-center gap-2 mb-3">
                  {getPaymentMethodIcon(withdrawal.paymentMethod)}
                  <span className="font-medium">{formatPaymentMethod(withdrawal.paymentMethod)}</span>
                </div>

                {withdrawal.paymentDetails && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {withdrawal.paymentMethod === 'bank_transfer' && withdrawal.paymentDetails.bankDetails && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Account Name:</span>
                          <div className="font-medium">{withdrawal.paymentDetails.bankDetails.accountName}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Bank Name:</span>
                          <div className="font-medium">{withdrawal.paymentDetails.bankDetails.bankName}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Account Number:</span>
                          <div className="font-medium">****{withdrawal.paymentDetails.bankDetails.accountNumber.slice(-4)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Routing Number:</span>
                          <div className="font-medium">{withdrawal.paymentDetails.bankDetails.routingNumber}</div>
                        </div>
                      </div>
                    )}

                    {withdrawal.paymentMethod === 'crypto' && withdrawal.paymentDetails.cryptoDetails && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Network:</span>
                          <div className="font-medium">{withdrawal.paymentDetails.cryptoDetails.network}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Currency:</span>
                          <div className="font-medium">{withdrawal.paymentDetails.cryptoDetails.currency}</div>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-600">Wallet Address:</span>
                          <div className="font-medium break-all">{withdrawal.paymentDetails.cryptoDetails.walletAddress}</div>
                        </div>
                      </div>
                    )}

                    {withdrawal.paymentMethod === 'check' && withdrawal.paymentDetails.checkDetails && (
                      <div className="text-sm">
                        <span className="text-gray-600">Mailing Address:</span>
                        <div className="font-medium mt-1">
                          {withdrawal.paymentDetails.checkDetails.mailingAddress.street}<br />
                          {withdrawal.paymentDetails.checkDetails.mailingAddress.city}, {withdrawal.paymentDetails.checkDetails.mailingAddress.state} {withdrawal.paymentDetails.checkDetails.mailingAddress.zipCode}<br />
                          {withdrawal.paymentDetails.checkDetails.mailingAddress.country}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Investment Details */}
              <div>
                <h3 className="font-semibold mb-3">Investment Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Investment Amount:</span>
                      <div className="font-medium">{formatCurrency(withdrawal.userInvestment.amount)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Investment Status:</span>
                      <div className="font-medium">{withdrawal.userInvestment.status}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Start Date:</span>
                      <div className="font-medium">{formatDate(withdrawal.userInvestment.startDate)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">End Date:</span>
                      <div className="font-medium">{formatDate(withdrawal.userInvestment.endDate)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              {withdrawal.reason && (
                <div>
                  <h3 className="font-semibold mb-3">Reason</h3>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm">
                    {withdrawal.reason}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {(withdrawal.adminNotes || withdrawal.rejectionReason) && (
                <div>
                  <h3 className="font-semibold mb-3">Admin Notes</h3>
                  <div className="space-y-2">
                    {withdrawal.adminNotes && (
                      <div className="bg-blue-50 p-4 rounded-lg text-sm">
                        <div className="font-medium text-blue-900 mb-1">Admin Notes:</div>
                        <div className="text-blue-800">{withdrawal.adminNotes}</div>
                      </div>
                    )}
                    {withdrawal.rejectionReason && (
                      <div className="bg-red-50 p-4 rounded-lg text-sm">
                        <div className="font-medium text-red-900 mb-1">Rejection Reason:</div>
                        <div className="text-red-800">{withdrawal.rejectionReason}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transaction ID */}
              {withdrawal.transactionId && (
                <div>
                  <h3 className="font-semibold mb-3">Transaction Information</h3>
                  <div className="bg-green-50 p-4 rounded-lg text-sm">
                    <div className="font-medium text-green-900 mb-1">Transaction ID:</div>
                    <div className="text-green-800 break-all">{withdrawal.transactionId}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  if (loading && !withdrawalHistory) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32 mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!withdrawalHistory || withdrawalHistory.withdrawals.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <FileText className="w-16 h-16 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900">No Withdrawal History</h3>
          <p className="text-gray-600 max-w-md">
            You haven't made any withdrawal requests yet. When you do, they'll appear here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Withdrawals List */}
      <div className="space-y-4">
        {withdrawalHistory.withdrawals.map((withdrawal) => (
          <Card key={withdrawal._id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Main Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(withdrawal.status)}
                  <Badge className={getStatusColor(withdrawal.status)}>
                    {withdrawal.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatDate(withdrawal.requestedAt)}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-2">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(withdrawal.netAmount)}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      (from {formatCurrency(withdrawal.amount)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(withdrawal.paymentMethod)}
                    <span className="text-sm text-gray-600">
                      {formatPaymentMethod(withdrawal.paymentMethod)}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  {formatWithdrawalType(withdrawal.type)} •
                  Principal: {formatCurrency(withdrawal.principalAmount)} •
                  Profits: {formatCurrency(withdrawal.profitAmount)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedWithdrawal(withdrawal);
                    setShowDetails(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>

                {withdrawal.status === 'pending' && (
                  <Button
                    variant="outline"
                    onClick={() => handleCancelWithdrawal(withdrawal._id)}
                    disabled={cancelling === withdrawal._id}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                    {cancelling === withdrawal._id ? 'Cancelling...' : 'Cancel'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {withdrawalHistory.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: withdrawalHistory.pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                onClick={() => setCurrentPage(page)}
                className="w-10 h-10"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            disabled={currentPage === withdrawalHistory.pagination.totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Details Modal */}
      {renderWithdrawalDetailsModal()}
    </div>
  );
};

export default WithdrawalHistory;
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  getAllWithdrawalRequests,
  getWithdrawalStatistics,
  reviewWithdrawalRequest,
  processWithdrawal,
  WithdrawalHistory,
  WithdrawalStatistics,
  Withdrawal
} from '@/services/withdrawalService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'sonner';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  Filter,
  Search,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Truck
} from 'lucide-react';
import AdminWithdrawalDetailsModal from './components/AdminWithdrawalDetailsModal';

const AdminWithdrawalsPage: React.FC = () => {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalHistory | null>(null);
  const [statistics, setStatistics] = useState<WithdrawalStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filters and pagination
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  // Action states
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [currentPage, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsData, statsData] = await Promise.all([
        getAllWithdrawalRequests(currentPage, 20, statusFilter || undefined),
        getWithdrawalStatistics()
      ]);
      setWithdrawalRequests(requestsData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error fetching withdrawal data:', error);
      toast.error('Failed to fetch withdrawal data');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewWithdrawal = async (
    withdrawalId: string,
    action: 'approve' | 'reject',
    notes?: string,
    rejectionReason?: string
  ) => {
    try {
      setProcessingAction(withdrawalId);
      await reviewWithdrawalRequest(withdrawalId, action, notes, rejectionReason);
      toast.success(`Withdrawal ${action}d successfully`);
      fetchData();
    } catch (error: any) {
      console.error('Error reviewing withdrawal:', error);
      toast.error(error.response?.data?.message || `Failed to ${action} withdrawal`);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleProcessWithdrawal = async (withdrawalId: string, transactionId: string) => {
    try {
      setProcessingAction(withdrawalId);
      await processWithdrawal(withdrawalId, transactionId);
      toast.success('Withdrawal processed successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      toast.error(error.response?.data?.message || 'Failed to process withdrawal');
    } finally {
      setProcessingAction(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'processing':
        return <Truck className="w-4 h-4 text-orange-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStatisticsCards = () => {
    if (!statistics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{statistics.totalRequests}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{statistics.pendingRequests}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(statistics.totalWithdrawnAmount)}
              </div>
              <div className="text-sm text-gray-600">Total Withdrawn</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{statistics.processingRate}%</div>
              <div className="text-sm text-gray-600">Processing Rate</div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  if (loading && !withdrawalRequests) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Withdrawal Management</h1>
          <p className="text-gray-600">Review and process user withdrawal requests</p>
        </div>

        {/* Statistics Cards */}
        {renderStatisticsCards()}

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by user email or withdrawal ID..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-8 py-2 border rounded-md bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Withdrawal Requests */}
        {withdrawalRequests && withdrawalRequests.withdrawals.length > 0 ? (
          <div className="space-y-4">
            {withdrawalRequests.withdrawals
              .filter(withdrawal =>
                !searchTerm ||
                withdrawal.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                withdrawal._id.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((withdrawal) => (
                <Card key={withdrawal._id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(withdrawal.status)}
                        <Badge className={getStatusColor(withdrawal.status)}>
                          {withdrawal.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(withdrawal.requestedAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 mb-2">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">
                            {formatCurrency(withdrawal.amount)}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            (Net: {formatCurrency(withdrawal.netAmount)})
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          via {withdrawal.paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
                            withdrawal.paymentMethod === 'crypto' ? 'Crypto' : 'Check'}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        User: {withdrawal.user ? `${withdrawal.user.firstName} ${withdrawal.user.lastName}` : 'N/A'} •
                        Investment: {formatCurrency(withdrawal.userInvestment.amount)}
                      </div>

                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Principal: {formatCurrency(withdrawal.principalAmount)}</span>
                        <span>Profits: {formatCurrency(withdrawal.profitAmount)}</span>
                        <span>Fees: {formatCurrency(withdrawal.fees)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal);
                          setShowDetailsModal(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </Button>

                      {withdrawal.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleReviewWithdrawal(withdrawal._id, 'approve')}
                            disabled={processingAction === withdrawal._id}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleReviewWithdrawal(withdrawal._id, 'reject')}
                            disabled={processingAction === withdrawal._id}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            Reject
                          </Button>
                        </>
                      )}

                      {withdrawal.status === 'approved' && (
                        <Button
                          onClick={() => {
                            const transactionId = prompt('Enter transaction ID:');
                            if (transactionId) {
                              handleProcessWithdrawal(withdrawal._id, transactionId);
                            }
                          }}
                          disabled={processingAction === withdrawal._id}
                          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                        >
                          <Truck className="w-4 h-4" />
                          Process
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

            {/* Pagination */}
            {withdrawalRequests.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: withdrawalRequests.pagination.totalPages }, (_, i) => i + 1).map((page) => (
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
                  disabled={currentPage === withdrawalRequests.pagination.totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <DollarSign className="w-16 h-16 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900">No Withdrawal Requests</h3>
              <p className="text-gray-600 max-w-md">
                No withdrawal requests match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          </Card>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedWithdrawal && (
          <AdminWithdrawalDetailsModal
            withdrawal={selectedWithdrawal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedWithdrawal(null);
            }}
            onAction={(action, transactionId, notes, rejectionReason) => {
              setShowDetailsModal(false);
              setSelectedWithdrawal(null);
              if (action === 'process' && transactionId) {
                handleProcessWithdrawal(selectedWithdrawal._id, transactionId);
              } else if (action === 'approve' || action === 'reject') {
                handleReviewWithdrawal(selectedWithdrawal._id, action, notes, rejectionReason);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminWithdrawalsPage;
import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Eye,
  Check,
  X,
  Clock,
  Wallet,
  Building,
  CreditCard,
  User,
  ChevronLeft,
  ChevronRight,
  Play
} from 'lucide-react';
import { getAllDeposits, updateDepositStatus, startInvestmentFromDeposit } from '@/services/adminService';

interface Deposit {
  _id: string;
  amount: number;
  currency: string;
  method: 'crypto' | 'bank' | 'card';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  userId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
  };
  cryptoDetails?: {
    wallet: string;
    txId?: string;
  };
  bankDetails?: {
    accountName: string;
    routingNumber: string;
  };
  cardDetails?: {
    last4: string;
    brand: string;
  };
  proofOfPayment?: string;
  adminNotes?: string;
}

const AdminDepositsManagement: React.FC = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchDeposits();
  }, []);

  // Helper functions to safely access user data
  const getUserName = (deposit: Deposit): string => {
    if (deposit.userId?.firstName || deposit.userId?.lastName) {
      return `${deposit.userId.firstName || ''} ${deposit.userId.lastName || ''}`.trim();
    }
    return 'Unknown User';
  };

  const getUserEmail = (deposit: Deposit): string => {
    return deposit.userId?.email || 'No email provided';
  }; const fetchDeposits = async () => {
    try {
      setLoading(true);

      const response = await getAllDeposits();

      // The backend returns { deposits, pagination }
      if (response.deposits && Array.isArray(response.deposits)) {
        setDeposits(response.deposits);
      } else {
        console.warn('Invalid data format from API, expected deposits array');
        console.warn('Received:', response);
        setDeposits([]);
      }
    } catch (error) {
      console.error('Error fetching deposits:', error);
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (depositId: string, newStatus: 'approved' | 'rejected', notes?: string) => {
    try {
      // Try to use actual API call
      try {
        await updateDepositStatus(depositId, {
          status: newStatus,
          adminNotes: notes
        });
      } catch (apiError) {
        console.log('API not available, using local update');
      }

      // Update local state regardless
      setDeposits(deposits.map(deposit =>
        deposit._id === depositId
          ? { ...deposit, status: newStatus, adminNotes: notes }
          : deposit
      ));
      setSelectedDeposit(null);
    } catch (error) {
      console.error('Failed to update deposit status:', error);
    }
  };

  const handleStartInvestment = async (depositId: string) => {
    try {
      const confirmed = window.confirm('Are you sure you want to start an investment for this approved deposit?');
      if (!confirmed) return;

      await startInvestmentFromDeposit(depositId);
      alert('Investment started successfully!');

      // Refresh the deposits list to see any updates
      fetchDeposits();
    } catch (error: any) {
      console.error('Failed to start investment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to start investment';
      alert(`Error: ${errorMessage}`);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'crypto':
        return <Wallet className="h-4 w-4 text-orange-500" />;
      case 'bank':
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'card':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter deposits
  const filteredDeposits = (deposits || []).filter(deposit => {
    const userName = getUserName(deposit);
    const userEmail = getUserEmail(deposit);

    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || deposit.method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDeposits = filteredDeposits.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Deposits Management</h1>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Methods</option>
              <option value="crypto">Cryptocurrency</option>
              <option value="bank">Bank Transfer</option>
              <option value="card">Card Payment</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setMethodFilter('all');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDeposits.map((deposit) => (
                <tr key={deposit._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{getUserName(deposit)}</div>
                        <div className="text-sm text-gray-500">{getUserEmail(deposit)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(deposit.amount)}</div>
                    <div className="text-sm text-gray-500">{deposit.currency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getMethodIcon(deposit.method)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">{deposit.method}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(deposit.status)}`}>
                      {deposit.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {deposit.status === 'approved' && <Check className="h-3 w-3 mr-1" />}
                      {deposit.status === 'rejected' && <X className="h-3 w-3 mr-1" />}
                      {deposit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(deposit.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedDeposit(deposit)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastItem, filteredDeposits.length)}</span> of{' '}
                  <span className="font-medium">{filteredDeposits.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deposit Detail Modal */}
      {selectedDeposit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Deposit Details</h3>
                <button
                  onClick={() => setSelectedDeposit(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedDeposit.amount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Method</label>
                    <div className="mt-1 flex items-center">
                      {getMethodIcon(selectedDeposit.method)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">{selectedDeposit.method}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedDeposit.status)}`}>
                      {selectedDeposit.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedDeposit.createdAt)}</p>
                  </div>
                </div>

                {/* User Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User Information</label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-gray-900">{getUserName(selectedDeposit)}</p>
                    <p className="text-sm text-gray-500">{getUserEmail(selectedDeposit)}</p>
                  </div>
                </div>

                {/* Payment Details */}
                {selectedDeposit.cryptoDetails && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Crypto Details</label>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                      <p className="text-sm"><span className="font-medium">Wallet:</span> {selectedDeposit.cryptoDetails.wallet}</p>
                      {selectedDeposit.cryptoDetails.txId && (
                        <p className="text-sm"><span className="font-medium">Transaction ID:</span> {selectedDeposit.cryptoDetails.txId}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedDeposit.bankDetails && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Details</label>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                      <p className="text-sm"><span className="font-medium">Account Name:</span> {selectedDeposit.bankDetails.accountName}</p>
                      <p className="text-sm"><span className="font-medium">Routing Number:</span> {selectedDeposit.bankDetails.routingNumber}</p>
                    </div>
                  </div>
                )}

                {selectedDeposit.cardDetails && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                      <p className="text-sm"><span className="font-medium">Card:</span> {selectedDeposit.cardDetails.brand} ending in {selectedDeposit.cardDetails.last4}</p>
                    </div>
                  </div>
                )}

                {/* Proof of Payment */}
                {selectedDeposit.proofOfPayment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Proof of Payment</label>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <a
                        href={selectedDeposit.proofOfPayment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Proof of Payment
                      </a>
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedDeposit.adminNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-900">{selectedDeposit.adminNotes}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedDeposit.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleStatusUpdate(selectedDeposit._id, 'approved')}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt('Reason for rejection (optional):');
                        handleStatusUpdate(selectedDeposit._id, 'rejected', notes || undefined);
                      }}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </div>
                )}

                {/* Start Investment for Approved Deposits */}
                {selectedDeposit.status === 'approved' && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleStartInvestment(selectedDeposit._id)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Investment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepositsManagement;

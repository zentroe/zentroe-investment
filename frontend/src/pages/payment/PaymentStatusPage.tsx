import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import OnboardingLayout from '@/pages/onboarding/OnboardingLayout';

interface PaymentStatus {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

const PaymentStatusPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentStatus();
  }, [paymentId]);

  const fetchPaymentStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payments/${paymentId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayment(data.data);
      } else {
        setError('Payment not found');
      }
    } catch (err) {
      setError('Failed to fetch payment status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'processing':
        return <Clock className="w-6 h-6 text-blue-600" />;
      case 'pending':
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Your payment has been successfully processed and your investment is active.';
      case 'failed':
        return 'Your payment could not be processed. Please try again or contact support.';
      case 'cancelled':
        return 'This payment was cancelled.';
      case 'processing':
        return 'Your payment is being verified and processed. This usually takes 1-2 business days.';
      case 'pending':
      default:
        return 'Your payment is waiting to be processed.';
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Payment Status - Zentroe Investment</title>
        </Helmet>
        <OnboardingLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment status...</p>
            </div>
          </div>
        </OnboardingLayout>
      </>
    );
  }

  if (error || !payment) {
    return (
      <>
        <Helmet>
          <title>Payment Not Found - Zentroe Investment</title>
        </Helmet>
        <OnboardingLayout>
          <div className="max-w-md mx-auto text-center py-12">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              to="/dashboard"
              className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </OnboardingLayout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Payment Status - Zentroe Investment</title>
      </Helmet>
      <OnboardingLayout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link
              to="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Payment Status</h1>
              <p className="text-gray-600">Track your investment payment</p>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center mb-4">
              {getStatusIcon(payment.status)}
              <div className="ml-3">
                <h2 className="text-lg font-semibold">
                  Payment {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </h2>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                  {payment.status.toUpperCase()}
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              {getStatusMessage(payment.status)}
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-sm">{payment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">
                  {payment.currency} {payment.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span>{new Date(payment.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {payment.status === 'completed' && (
              <button className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </button>
            )}

            <Link
              to="/dashboard"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              Back to Dashboard
            </Link>

            {(payment.status === 'failed' || payment.status === 'cancelled') && (
              <Link
                to={`/payment?amount=${payment.amount}`}
                className="w-full bg-white border border-indigo-300 text-indigo-700 py-3 px-4 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center"
              >
                Try Payment Again
              </Link>
            )}
          </div>

          {/* Support */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 mb-2">
              Questions about your payment?
            </p>
            <a
              href="mailto:support@zentroe.com"
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              Contact Support
            </a>
          </div>
        </div>
      </OnboardingLayout>
    </>
  );
};

export default PaymentStatusPage;

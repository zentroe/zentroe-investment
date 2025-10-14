import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertCircle, Eye, Plus } from 'lucide-react';
import { useUser } from '@/context/UserContext';

const PaymentHistory: React.FC = () => {
  const { paymentHistory, loading, errors, refreshPayments } = useUser();

  const payments = paymentHistory?.payments || [];
  const isLoading = loading.payments;
  const error = errors.payments;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending':
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
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

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'crypto':
        return 'Cryptocurrency';
      case 'card':
        return 'Credit/Debit Card';
      default:
        return method;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        <Link
          to="/dashboard/payments"
          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
        >
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={refreshPayments}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No payments yet</p>
          <Link
            to="/payment"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors border border-transparent"
          >
            <Plus className="w-4 h-4 mr-2" />
            Make Your First Payment
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {payments.slice(0, 3).map((payment) => (
              <div
                key={payment._id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(payment.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        ${payment.amount.toLocaleString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatPaymentMethod(payment.paymentMethod)} • {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/payment/status/${payment._id}`}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {payments.length > 3 && (
            <div className="pt-3 border-t border-gray-100">
              <Link
                to="/dashboard/payments"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                View all payments ({payments.length})
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentHistory;

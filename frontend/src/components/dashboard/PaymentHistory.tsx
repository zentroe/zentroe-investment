import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertCircle, Eye, Plus } from 'lucide-react';

interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockPayments: PaymentItem[] = [
        {
          id: 'pay_123456789',
          amount: 5000,
          currency: 'USD',
          status: 'completed',
          paymentMethod: 'card',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 'pay_123456788',
          amount: 2500,
          currency: 'USD',
          status: 'processing',
          paymentMethod: 'bank_transfer',
          createdAt: '2024-01-10T14:20:00Z'
        },
        {
          id: 'pay_123456787',
          amount: 1000,
          currency: 'USD',
          status: 'completed',
          paymentMethod: 'crypto',
          createdAt: '2024-01-05T09:15:00Z'
        }
      ];

      setPayments(mockPayments);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
        <Link
          to="/payment"
          className="flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Payment
        </Link>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm mb-4">No payments yet</p>
          <Link
            to="/payment"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
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
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(payment.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        ${payment.amount.toLocaleString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatPaymentMethod(payment.paymentMethod)} • {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/payment/status/${payment.id}`}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  title="View details"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {payments.length > 3 && (
            <div className="text-center">
              <Link
                to="/dashboard/payments"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
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

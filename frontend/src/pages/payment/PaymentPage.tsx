import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get amount and investment details from URL params
  const amount = searchParams.get('amount') || '1000';
  const investmentId = searchParams.get('investmentId');
  const portfolioType = searchParams.get('portfolio') || 'balanced';
  const currency = 'USD';

  // Create payment record when component mounts
  useEffect(() => {
    createPaymentRecord();
  }, []);

  const createPaymentRecord = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          investmentId,
          paymentMethod: 'pending' // Will be updated when method is selected
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentId(data.data.paymentId);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create payment record');
      }
    } catch (err) {
      setError('Failed to connect to payment service');
      console.error('Payment creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/invest/payment-amount');
  };

  const handlePaymentSuccess = () => {
    // Navigate to success page with payment details
    navigate(`/payment/success?paymentId=${paymentId}&amount=${amount}`);
  };

  const handleCancel = () => {
    navigate('/invest/payment-amount');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Setting up your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center p-6">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Payment Setup Failed</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={createPaymentRecord}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors mr-3"
          >
            Try Again
          </button>
          <button
            onClick={handleBack}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!paymentId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Complete Payment
            </h1>
            <p className="text-gray-600">
              Investment Amount: ${parseFloat(amount).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Investment Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Investment Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Portfolio Type:</span>
              <span className="font-medium capitalize">{portfolioType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Investment Amount:</span>
              <span className="font-medium">${parseFloat(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee:</span>
              <span className="font-medium">$0.00</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>${parseFloat(amount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-white rounded-lg shadow-sm border">
          <PaymentMethodSelector
            amount={parseFloat(amount)}
            currency={currency}
            paymentId={paymentId}
            onSuccess={handlePaymentSuccess}
            onCancel={handleCancel}
          />
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

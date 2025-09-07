import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

// Payment method components
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';

// Services
import { getPaymentOptions, createPayment, type PaymentOptions } from '@/services/paymentService';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Get parameters from URL
  const amount = searchParams.get('amount') || '1000';
  const portfolioType = searchParams.get('portfolio') || 'balanced';
  const currency = 'USD';

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      setLoading(true);

      // First fetch payment options
      const optionsData = await getPaymentOptions();
      setPaymentOptions(optionsData);

      // Create a payment record
      const paymentData = await createPayment({
        amount: parseFloat(amount),
        currency,
        portfolioType
      });

      setPaymentId(paymentData.paymentId);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initialize payment';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }; const handleBack = () => {
    navigate('/invest/payment-amount');
  };

  const handlePaymentSuccess = (depositId: string) => {
    toast.success('Payment submitted successfully!');
    navigate(`/payment/status/${depositId}`);
  };

  const handleCancel = () => {
    navigate('/invest/payment-amount');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="h-6 w-6 animate-spin text-primary" />
          <span>Loading payment options...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!paymentOptions || !paymentId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-6 w-6 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Complete Payment - Zentroe Investment</title>
        <meta name="description" content="Complete your investment payment securely" />
      </Helmet>

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

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-lg font-semibold mb-6">Choose Payment Method</h2>

            {/* Payment Method Selector Component */}
            <PaymentMethodSelector
              amount={parseFloat(amount)}
              currency={currency}
              paymentId={paymentId}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCancel}
            />
          </div>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              🔒 Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;
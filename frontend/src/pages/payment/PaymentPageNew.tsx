import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
// import { toast } from 'sonner';

// Payment method components (we'll create these next)
// import CryptoPayment from '@/components/payment/CryptoPayment';
// import BankTransferPayment from '@/components/payment/BankTransferPayment';
// import CardPayment from '@/components/payment/CardPayment';

interface PaymentConfig {
  cryptoEnabled: boolean;
  bankTransferEnabled: boolean;
  cardPaymentEnabled: boolean;
}

interface PaymentOptions {
  config: PaymentConfig;
  cryptoWallets: Array<{ _id: string; name: string; icon: string }>;
  bankAccounts: Array<{ _id: string; bankName: string; accountName: string }>;
}

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'crypto' | 'bank' | 'card' | null>(null);

  // Get amount from URL params
  const amount = searchParams.get('amount') || '1000';

  useEffect(() => {
    fetchPaymentOptions();
  }, []);

  const fetchPaymentOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments/options', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentOptions(data);

        // Auto-select the first available payment method
        if (data.config.cryptoEnabled) {
          setSelectedMethod('crypto');
        } else if (data.config.bankTransferEnabled) {
          setSelectedMethod('bank');
        } else if (data.config.cardPaymentEnabled) {
          setSelectedMethod('card');
        }
      } else {
        setError('Failed to load payment options');
      }
    } catch (err) {
      setError('Failed to load payment options');
    } finally {
      setLoading(false);
    }
  };

  // const handlePaymentSuccess = (depositId: string) => {
  //   toast.success('Payment submitted successfully!');
  //   navigate(`/payment/status/${depositId}`);
  // };

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

  const availableMethods = [];
  if (paymentOptions?.config.cryptoEnabled) availableMethods.push('crypto');
  if (paymentOptions?.config.bankTransferEnabled) availableMethods.push('bank');
  if (paymentOptions?.config.cardPaymentEnabled) availableMethods.push('card');

  if (availableMethods.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Payment Methods Available</h2>
          <p className="text-gray-600 mb-4">Please contact support for assistance.</p>
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

  return (
    <>
      <Helmet>
        <title>Payment | Zentroe</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
              <p className="text-gray-600">Investment Amount: ${Number(amount).toLocaleString()}</p>
            </div>
          </div>

          {/* Payment Method Selection */}
          {availableMethods.length > 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Select Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentOptions?.config.cryptoEnabled && (
                  <button
                    onClick={() => setSelectedMethod('crypto')}
                    className={`p-4 border rounded-lg text-center ${selectedMethod === 'crypto'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="text-lg font-medium">Cryptocurrency</div>
                    <div className="text-sm text-gray-500">Pay with crypto wallet</div>
                  </button>
                )}
                {paymentOptions?.config.bankTransferEnabled && (
                  <button
                    onClick={() => setSelectedMethod('bank')}
                    className={`p-4 border rounded-lg text-center ${selectedMethod === 'bank'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="text-lg font-medium">Bank Transfer</div>
                    <div className="text-sm text-gray-500">Wire transfer</div>
                  </button>
                )}
                {paymentOptions?.config.cardPaymentEnabled && (
                  <button
                    onClick={() => setSelectedMethod('card')}
                    className={`p-4 border rounded-lg text-center ${selectedMethod === 'card'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="text-lg font-medium">Credit/Debit Card</div>
                    <div className="text-sm text-gray-500">Pay with card</div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Payment Method Component */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {selectedMethod === 'crypto' && (
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">Cryptocurrency Payment</h3>
                <p className="text-gray-600">Crypto payment component coming soon...</p>
              </div>
            )}
            {selectedMethod === 'bank' && (
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">Bank Transfer Payment</h3>
                <p className="text-gray-600">Bank transfer component coming soon...</p>
              </div>
            )}
            {selectedMethod === 'card' && (
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">Card Payment</h3>
                <p className="text-gray-600">Card payment component coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;

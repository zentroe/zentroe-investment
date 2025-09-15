import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { ArrowLeft, Wallet, Building2, CreditCard, Copy } from 'lucide-react';
import OnboardingLayout from '@/pages/onboarding/OnboardingLayout';
import SimpleCardPaymentForm from '@/components/payment/SimpleCardPaymentForm';
import { getPaymentOptions } from '@/services/paymentService';

interface PaymentConfig {
  cryptoEnabled: boolean;
  bankTransferEnabled: boolean;
  cardPaymentEnabled: boolean;
}

interface CryptoWallet {
  _id: string;
  name: string;
  address: string;
  network?: string;
  icon: string;
  active: boolean;
}

interface BankAccount {
  _id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  country: string;
  currency: string;
  active: boolean;
}

interface PaymentOptions {
  config: PaymentConfig;
  cryptoWallets: CryptoWallet[];
  bankAccounts: BankAccount[];
}

const PaymentPageNew: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'crypto' | 'bank' | 'card' | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);

  // Get amount from URL params
  const amount = searchParams.get('amount') || '1000';

  useEffect(() => {
    fetchPaymentOptions();
  }, []);

  const fetchPaymentOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPaymentOptions();
      setPaymentOptions(data);

      // Auto-select the first available payment method
      if (data.config.cryptoEnabled && data.cryptoWallets.length > 0) {
        setSelectedMethod('crypto');
        setSelectedWallet(data.cryptoWallets[0]);
      } else if (data.config.bankTransferEnabled && data.bankAccounts.length > 0) {
        setSelectedMethod('bank');
        setSelectedBankAccount(data.bankAccounts[0]);
      } else if (data.config.cardPaymentEnabled) {
        setSelectedMethod('card');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load payment options';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (data: any) => {
    toast.success('Payment submitted successfully!');
    navigate('/payment/success', {
      state: {
        paymentId: data.paymentId,
        amount,
        currency: 'USD',
        method: selectedMethod
      }
    });
  };

  const handlePaymentCancel = () => {
    navigate(-1);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const availableMethods = [];
  if (paymentOptions?.config.cryptoEnabled && paymentOptions.cryptoWallets.length > 0) {
    availableMethods.push('crypto');
  }
  if (paymentOptions?.config.bankTransferEnabled && paymentOptions.bankAccounts.length > 0) {
    availableMethods.push('bank');
  }
  if (paymentOptions?.config.cardPaymentEnabled) {
    availableMethods.push('card');
  }

  if (loading) {
    return (
      <OnboardingLayout
      >
        <div className="mt-24 px-4 max-w-xl mx-auto">

          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  if (error) {
    return (
      <OnboardingLayout>
        <div className="mt-24 px-4 max-w-xl mx-auto">

          <div className="text-center py-12">
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
            >
              Go Back
            </button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  if (availableMethods.length === 0) {
    return (
      <OnboardingLayout>
        <div className="mt-24 px-4 max-w-xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">
              No payment methods are currently configured. Please contact support.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
            >
              Go Back
            </button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Payment | Zentroe Investment</title>
      </Helmet>

      <OnboardingLayout>
        <div className="mt-14 px-4 py-8 max-w-xl mx-auto">

          <div className="space-y-6">
            {/* Payment Method Selection */}
            {availableMethods.length > 1 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availableMethods.includes('crypto') && (
                    <button
                      onClick={() => {
                        setSelectedMethod('crypto');
                        setSelectedWallet(paymentOptions?.cryptoWallets[0] || null);
                      }}
                      className={`p-4 border rounded-lg text-center ${selectedMethod === 'crypto'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <Wallet className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">Cryptocurrency</div>
                    </button>
                  )}

                  {availableMethods.includes('bank') && (
                    <button
                      onClick={() => {
                        setSelectedMethod('bank');
                        setSelectedBankAccount(paymentOptions?.bankAccounts[0] || null);
                      }}
                      className={`p-4 border rounded-lg text-center ${selectedMethod === 'bank'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <Building2 className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">Bank Transfer</div>
                    </button>
                  )}

                  {availableMethods.includes('card') && (
                    <button
                      onClick={() => setSelectedMethod('card')}
                      className={`p-4 border rounded-lg text-center ${selectedMethod === 'card'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <CreditCard className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">Credit/Debit Card</div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Payment Method Component */}
            <div>
              {/* Cryptocurrency Payment */}
              {selectedMethod === 'crypto' && selectedWallet && (
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Wallet className="h-5 w-5 mr-2" />
                    Cryptocurrency Payment
                  </h3>

                  {/* Wallet Selection */}
                  {(paymentOptions?.cryptoWallets.length || 0) > 1 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Wallet
                      </label>
                      <select
                        value={selectedWallet._id}
                        onChange={(e) => {
                          const wallet = paymentOptions?.cryptoWallets.find(w => w._id === e.target.value);
                          setSelectedWallet(wallet || null);
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {paymentOptions?.cryptoWallets.map(wallet => (
                          <option key={wallet._id} value={wallet._id}>
                            {wallet.name} {wallet.network && `(${wallet.network})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Wallet Details */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-3">
                      {selectedWallet.icon && (
                        <img
                          src={selectedWallet.icon}
                          alt={selectedWallet.name}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{selectedWallet.name}</h4>
                        {selectedWallet.network && (
                          <p className="text-sm text-gray-500">{selectedWallet.network}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Wallet Address
                      </label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 text-xs bg-white px-3 py-2 rounded border font-mono break-all">
                          {selectedWallet.address}
                        </code>
                        <button
                          onClick={() => copyToClipboard(selectedWallet.address)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Copy address"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Payment Instructions</h4>
                    <ol className="text-sm text-blue-700 space-y-1">
                      <li>1. Send exactly <strong>${Number(amount).toLocaleString()}</strong> worth of {selectedWallet.name} to the address above</li>
                      <li>2. Include your transaction hash/ID when submitting</li>
                      <li>3. Wait for blockchain confirmation (usually 10-30 minutes)</li>
                      <li>4. Your investment will be processed once confirmed</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Bank Transfer Payment */}
              {selectedMethod === 'bank' && selectedBankAccount && (
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Bank Transfer Payment
                  </h3>

                  {/* Bank Account Selection */}
                  {(paymentOptions?.bankAccounts.length || 0) > 1 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Bank Account
                      </label>
                      <select
                        value={selectedBankAccount._id}
                        onChange={(e) => {
                          const account = paymentOptions?.bankAccounts.find(acc => acc._id === e.target.value);
                          setSelectedBankAccount(account || null);
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {paymentOptions?.bankAccounts.map(account => (
                          <option key={account._id} value={account._id}>
                            {account.bankName} - {account.accountName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Bank Account Details */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium mb-3">{selectedBankAccount.bankName}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Name
                        </label>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono">
                            {selectedBankAccount.accountName}
                          </code>
                          <button
                            onClick={() => copyToClipboard(selectedBankAccount.accountName)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="Copy account name"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Number
                        </label>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono">
                            {selectedBankAccount.accountNumber}
                          </code>
                          <button
                            onClick={() => copyToClipboard(selectedBankAccount.accountNumber)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="Copy account number"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {selectedBankAccount.routingNumber && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Routing Number
                          </label>
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono">
                              {selectedBankAccount.routingNumber}
                            </code>
                            <button
                              onClick={() => copyToClipboard(selectedBankAccount.routingNumber!)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                              title="Copy routing number"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedBankAccount.swiftCode && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            SWIFT Code
                          </label>
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono">
                              {selectedBankAccount.swiftCode}
                            </code>
                            <button
                              onClick={() => copyToClipboard(selectedBankAccount.swiftCode!)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                              title="Copy SWIFT code"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedBankAccount.iban && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            IBAN
                          </label>
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono">
                              {selectedBankAccount.iban}
                            </code>
                            <button
                              onClick={() => copyToClipboard(selectedBankAccount.iban!)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                              title="Copy IBAN"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Country:</span>
                        <span className="font-medium">{selectedBankAccount.country}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Currency:</span>
                        <span className="font-medium">{selectedBankAccount.currency}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Wire Transfer Instructions</h4>
                    <ol className="text-sm text-green-700 space-y-1">
                      <li>1. Initiate a wire transfer for <strong>${Number(amount).toLocaleString()}</strong></li>
                      <li>2. Use the bank details provided above</li>
                      <li>3. Include your full name in the transfer reference</li>
                      <li>4. Save your transfer receipt for verification</li>
                      <li>5. Processing time: 1-3 business days</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Card Payment */}
              {selectedMethod === 'card' && (
                <div className="bg-white rounded-lg border p-6">
                  <SimpleCardPaymentForm
                    amount={Number(amount)}
                    currency="USD"
                    onSuccess={handlePaymentSuccess}
                    onCancel={handlePaymentCancel}
                  />
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <button
                onClick={handlePaymentCancel}
                className="flex items-center px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>

              {(selectedMethod === 'crypto' || selectedMethod === 'bank') && (
                <button
                  onClick={() => {
                    toast.success('Payment instructions noted. Please complete the transfer.');
                    navigate('/payment/success', {
                      state: {
                        amount,
                        currency: 'USD',
                        method: selectedMethod,
                        instructions: true
                      }
                    });
                  }}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
                >
                  I've Noted the Instructions
                </button>
              )}
            </div>
          </div>
        </div>
      </OnboardingLayout>
    </>
  );
};

export default PaymentPageNew;

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { ArrowLeft, Wallet, Building2, CreditCard, Copy, Mail, AlertTriangle } from 'lucide-react';
import CryptoQRCode from '@/components/payment/CryptoQRCode';
import OnboardingLayout from '@/pages/onboarding/OnboardingLayout';
import SimpleCardPaymentForm from '@/components/payment/SimpleCardPaymentForm';
import { Button } from '@/components/ui/button';
import { getPaymentOptions, confirmCryptoPayment, confirmBankTransferPayment } from '@/services/paymentService';
import { resendEmailVerification } from '@/services/auth';
import { useOnboarding } from '@/context/OnboardingContext';
import { useAuth } from '@/context/AuthContext';

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
  const { data: userData, loading: contextLoading, updateStatus } = useOnboarding();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'crypto' | 'bank' | 'card' | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [transactionScreenshot, setTransactionScreenshot] = useState<string>('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  // Get amount from context (preferred) or URL params (fallback)
  // Using context ensures data integrity since the amount is fetched from the database
  const contextAmount = userData?.initialInvestmentAmount;
  const urlAmount = searchParams.get('amount');
  const amount = contextAmount || (urlAmount ? Number(urlAmount) : 0);

  // Check if amount is valid
  const isValidAmount = amount > 0;

  // Check email verification status
  useEffect(() => {
    if (user && !user.isEmailVerified) {
      setShowEmailVerificationModal(true);
    }
  }, [user]);

  useEffect(() => {
    fetchPaymentOptions();
  }, []);

  const fetchPaymentOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPaymentOptions();
      // console.log('🔍 Frontend: Received payment options data:', JSON.stringify(data, null, 2));

      setPaymentOptions(data);

      // Auto-select the first available payment method (prioritize card first)
      if (data.config.cardPaymentEnabled) {
        setSelectedMethod('card');
        // console.log('💳 Frontend: Selected card payment method');
      } else if (data.config.cryptoEnabled && data.cryptoWallets.length > 0) {
        setSelectedMethod('crypto');
        setSelectedWallet(data.cryptoWallets[0]);
        // console.log('🏦 Frontend: Selected crypto wallet:', {
        //   name: data.cryptoWallets[0].name,
        //   address: data.cryptoWallets[0].address,
        //   hasAddress: !!data.cryptoWallets[0].address,
        //   addressType: typeof data.cryptoWallets[0].address
        // });
      } else if (data.config.bankTransferEnabled && data.bankAccounts.length > 0) {
        setSelectedMethod('bank');
        setSelectedBankAccount(data.bankAccounts[0]);
        // console.log('🏧 Frontend: Selected bank account');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load payment options';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!user?.email) return;

    setResendingEmail(true);
    try {
      await resendEmailVerification(user.email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send verification email';
      toast.error(errorMessage);
    } finally {
      setResendingEmail(false);
    }
  };

  const handlePaymentSuccess = async (data: any) => {
    try {
      // Update onboarding status to completed since payment is successful/pending
      console.log('🎯 Updating onboarding status to completed after successful payment');
      await updateStatus('completed');
      console.log('✅ Onboarding status successfully updated to completed');
      toast.success('Payment submitted successfully! Welcome to your dashboard!');
    } catch (error) {
      console.error('❌ Error updating onboarding status:', error);
      // Still show success for payment even if status update fails
      toast.success('Payment submitted successfully!');
    }

    navigate('/payment/success', {
      state: {
        paymentId: data.paymentId,
        amount: amount,
        currency: 'USD',
        method: selectedMethod
      }
    });
  };

  const handlePaymentCancel = () => {
    navigate(-1);
  };

  const handleManualPaymentConfirmation = async () => {
    if (confirmingPayment) return; // Prevent double clicks

    setConfirmingPayment(true);
    try {
      let paymentResult = null;

      // Create payment record based on selected method
      if (selectedMethod === 'crypto' && selectedWallet) {
        if (!transactionScreenshot) {
          toast.error('Please upload a screenshot of your transaction');
          setConfirmingPayment(false);
          return;
        }
        console.log('💰 Creating crypto payment record with screenshot');
        paymentResult = await confirmCryptoPayment({
          walletId: selectedWallet._id,
          amount: amount,
          transactionHash: '', // User can provide this later to admin
          userWalletAddress: '', // User can provide this later to admin
          proofOfPayment: transactionScreenshot
        });
        toast.success('Crypto payment recorded! Admin will verify your transaction.');
      } else if (selectedMethod === 'bank' && selectedBankAccount) {
        console.log('🏦 Creating bank transfer payment record');
        paymentResult = await confirmBankTransferPayment({
          accountId: selectedBankAccount._id,
          amount: amount,
          referenceNumber: `REF-${Date.now()}`, // Generate a reference number
          userBankDetails: {
            bankName: '', // User can provide this later to admin
            accountHolderName: user?.firstName + ' ' + user?.lastName || ''
          }
        });
        toast.success('Bank transfer recorded! Admin will verify your payment.');
      }

      if (paymentResult) {
        console.log('✅ Payment record created:', paymentResult);
      }

      // Update onboarding status to completed
      console.log('🎯 Updating onboarding status to completed after payment confirmation');
      await updateStatus('completed');
      console.log('✅ Onboarding status successfully updated to completed');

      // Navigate to success page
      navigate('/payment/success', {
        state: {
          amount: amount,
          currency: 'USD',
          method: selectedMethod,
          paymentId: paymentResult?.paymentId,
          instructions: true
        }
      });
    } catch (error) {
      console.error('❌ Error processing payment confirmation:', error);

      // Still try to update onboarding status even if payment record fails
      try {
        await updateStatus('completed');
        toast.success('Payment instructions noted. Please contact admin if needed.');
        navigate('/dashboard');
      } catch (statusError) {
        console.error('❌ Error updating onboarding status:', statusError);
        toast.error('Error processing confirmation. Please try again or contact support.');
      }
    } finally {
      setConfirmingPayment(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleScreenshotUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingScreenshot(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setTransactionScreenshot(base64);
        toast.success('Screenshot uploaded successfully');
        setUploadingScreenshot(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
        setUploadingScreenshot(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      toast.error('Failed to upload screenshot');
      setUploadingScreenshot(false);
    }
  };

  const availableMethods = [];
  if (paymentOptions?.config.cardPaymentEnabled) {
    availableMethods.push('card');
  }
  if (paymentOptions?.config.cryptoEnabled && paymentOptions.cryptoWallets.length > 0) {
    availableMethods.push('crypto');
  }
  if (paymentOptions?.config.bankTransferEnabled && paymentOptions.bankAccounts.length > 0) {
    availableMethods.push('bank');
  }

  if (loading || contextLoading) {
    return (
      <OnboardingLayout
      >
        <div className="mt-24 px-4 max-w-xl mx-auto">

          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

  if (!isValidAmount) {
    return (
      <OnboardingLayout>
        <div className="mt-24 px-4 max-w-xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Initial Investment Amount Required</h2>
            <p className="text-red-600 mb-6">
              You need to set your initial investment amount before proceeding to payment.
            </p>
            <button
              onClick={() => navigate('/invest/payment-amount')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
            >
              Set Investment Amount
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

          {/* Investment Amount Display */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8 shadow-sm">
            <div className="text-center">
              <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-3">
                Initial Investment Amount
              </h2>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                ${amount.toLocaleString()}
              </div>
              <p className="text-gray-500 text-sm">
                {user?.isEmailVerified
                  ? 'Complete your payment to start investing'
                  : 'Please verify your email address to proceed with payment'
                }
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Payment Method Selection - Only show if email is verified */}
            {user?.isEmailVerified && availableMethods.length > 1 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>
              </div>
            )}

            {/* Payment Method Component */}
            {user?.isEmailVerified ? (
              <div>
                {/* Card Payment */}
                {selectedMethod === 'card' && (
                  <div className="bg-white rounded-lg">
                    <SimpleCardPaymentForm
                      amount={amount}
                      currency="USD"
                      onSuccess={handlePaymentSuccess}
                      onCancel={handlePaymentCancel}
                    />
                  </div>
                )}

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
                            {selectedWallet.address || 'Address not available'}
                          </code>
                          <button
                            onClick={() => copyToClipboard(selectedWallet.address || '')}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Copy address"
                            disabled={!selectedWallet.address}
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        {!selectedWallet.address && (
                          <p className="text-sm text-red-600">
                            ⚠️ Wallet address is not configured. Please contact support.
                          </p>
                        )}
                      </div>

                      {/* QR Code Section */}
                      {selectedWallet.address && (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700 text-center">
                            QR Code Payment
                          </label>
                          <div className="flex justify-center">
                            <CryptoQRCode
                              address={selectedWallet.address}
                              amount={amount}
                              currency={selectedWallet.name}
                              size={180}
                              className=""
                            />
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-800 text-center">
                              💡 <strong>Quick Payment:</strong> Scan this QR code with your {selectedWallet.name} wallet app to auto-fill the payment details.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Payment Instructions</h4>
                      <div className="text-sm text-blue-700 space-y-2">
                        <div className="font-medium text-blue-800">Option 1: QR Code (Recommended)</div>
                        <ul className="space-y-1 ml-4">
                          <li>• Scan the QR code above with your crypto wallet</li>
                          <li>• Verify the amount shows as ${amount.toLocaleString()}</li>
                          <li>• Confirm and send the transaction</li>
                        </ul>

                        <div className="font-medium text-blue-800 mt-3">Option 2: Manual Entry</div>
                        <ol className="space-y-1 ml-4">
                          <li>1. Copy the wallet address above</li>
                          <li>2. Send exactly <strong>${amount.toLocaleString()}</strong> worth of {selectedWallet.name}</li>
                          <li>3. Include your transaction hash/ID when submitting</li>
                          <li>4. Wait for blockchain confirmation (usually 10-30 minutes)</li>
                        </ol>
                      </div>
                    </div>

                    {/* Screenshot Upload Section */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                        Upload Transaction Screenshot
                        <span className="text-red-500 ml-1">*</span>
                      </h4>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-700">
                          After completing your crypto transaction, please upload a screenshot as proof of payment.
                        </p>

                        <div className="flex items-center space-x-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotUpload}
                            disabled={uploadingScreenshot}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 disabled:opacity-50"
                          />
                          {uploadingScreenshot && (
                            <div className="text-sm text-gray-600">Uploading...</div>
                          )}
                        </div>

                        {transactionScreenshot && (
                          <div className="flex items-center text-sm text-green-600">
                            ✅ Screenshot uploaded successfully
                          </div>
                        )}

                        <div className="text-xs text-gray-600">
                          • Supported formats: JPG, PNG, GIF
                          • Maximum file size: 5MB
                          • Make sure transaction details are clearly visible
                        </div>
                      </div>
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
                        <li>1. Initiate a wire transfer for <strong>${amount.toLocaleString()}</strong></li>
                        <li>2. Use the bank details provided above</li>
                        <li>3. Include your full name in the transfer reference</li>
                        <li>4. Save your transfer receipt for verification</li>
                        <li>5. Processing time: 1-3 business days</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Email not verified - show message
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-900">
                    Email Verification Required
                  </h3>
                </div>
                <p className="text-orange-700 mb-4">
                  Please verify your email address before proceeding with payment. We need to send you important payment confirmations and investment updates.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleResendEmail}
                    disabled={resendingEmail}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span>
                      {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}

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
                  title={
                    selectedMethod === 'crypto' && !transactionScreenshot
                      ? 'Please upload a transaction screenshot first'
                      : confirmingPayment
                        ? 'Processing payment...'
                        : uploadingScreenshot
                          ? 'Uploading screenshot...'
                          : 'Confirm your payment'
                  }
                  onClick={handleManualPaymentConfirmation}
                  disabled={
                    confirmingPayment ||
                    uploadingScreenshot ||
                    (selectedMethod === 'crypto' && !transactionScreenshot)
                  }
                  className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${confirmingPayment ||
                      uploadingScreenshot ||
                      (selectedMethod === 'crypto' && !transactionScreenshot)
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                >
                  {confirmingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : uploadingScreenshot ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : selectedMethod === 'crypto' && !transactionScreenshot ? (
                    <>
                      <span>Upload Screenshot First</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Confirm Payment</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Email Verification Modal */}
        {showEmailVerificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Email Verification Required
                  </h3>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  We need to verify your email address before processing payments. This ensures we can send you important payment confirmations and investment updates.
                </p>
                <p className="text-sm text-gray-500">
                  Please check your email <strong>{user?.email}</strong> for a verification link.
                </p>
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  onClick={handleResendEmail}
                  disabled={resendingEmail}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>
                    {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>

                <div className="text-center text-xs text-gray-500">
                  <p>
                    Need help?{' '}
                    <Link
                      to="/resend-confirmation"
                      className="text-primary hover:underline"
                    >
                      Visit our help page
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </OnboardingLayout>
    </>
  );
};

export default PaymentPageNew;

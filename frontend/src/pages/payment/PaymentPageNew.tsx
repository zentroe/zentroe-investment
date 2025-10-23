import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { ArrowLeft, Wallet, Building2, CreditCard, Mail, AlertTriangle } from 'lucide-react';
import OnboardingLayout from '@/pages/onboarding/OnboardingLayout';
import SimpleCardPaymentForm from '@/components/payment/SimpleCardPaymentForm';
import CryptoPaymentDisplay from '@/components/payment/CryptoPaymentDisplay';
import BankTransferDisplay from '@/components/payment/BankTransferDisplay';
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
  bankAddress?: string;
  businessAddress?: string;
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
  const { data: userData, loading: contextLoading, updateStatus, refreshData } = useOnboarding();
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
      setPaymentOptions(data);

      // Auto-select the first available payment method (prioritize card first)
      if (data.config.cardPaymentEnabled) {
        setSelectedMethod('card');
      } else if (data.config.cryptoEnabled && data.cryptoWallets.length > 0) {
        setSelectedMethod('crypto');
        setSelectedWallet(data.cryptoWallets[0]);
      } else if (data.config.bankTransferEnabled && data.bankAccounts.length > 0) {
        setSelectedMethod('bank');
        setSelectedBankAccount(data.bankAccounts[0]);
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
      console.log('✅ [PaymentPageNew] Payment successful, updating status to completed...');

      // Update onboarding status to completed since payment is successful/pending
      await updateStatus('completed');

      // Refresh onboarding data to ensure context has the latest status
      console.log('🔄 [PaymentPageNew] Refreshing onboarding data after status update...');
      await refreshData();
      console.log('✅ [PaymentPageNew] Data refreshed, navigating to success page');

      toast.success('Payment submitted successfully! Welcome to your dashboard!');
    } catch (error) {
      console.error('❌ [PaymentPageNew] Error updating onboarding status:', error);
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
        paymentResult = await confirmCryptoPayment({
          walletId: selectedWallet._id,
          amount: amount,
          transactionHash: '', // User can provide this later to admin
          userWalletAddress: '', // User can provide this later to admin
          proofOfPayment: transactionScreenshot
        });
        toast.success('Crypto payment recorded! Admin will verify your transaction.');
      } else if (selectedMethod === 'bank' && selectedBankAccount) {
        if (!transactionScreenshot) {
          toast.error('Please upload a screenshot of your bank transfer');
          setConfirmingPayment(false);
          return;
        }
        paymentResult = await confirmBankTransferPayment({
          accountId: selectedBankAccount._id,
          amount: amount,
          referenceNumber: user?.paymentReferenceId || `REF-${Date.now()}`, // Use payment reference ID if available
          userBankDetails: {
            bankName: '', // User can provide this later to admin
            accountHolderName: user?.firstName + ' ' + user?.lastName || ''
          },
          proofOfPayment: transactionScreenshot
        });
        toast.success('Bank transfer recorded! Admin will verify your payment.');
      }

      // Update onboarding status to completed
      console.log('✅ [PaymentPageNew] Manual payment confirmed, updating status to completed...');
      await updateStatus('completed');

      // Refresh onboarding data to ensure context has the latest status
      console.log('🔄 [PaymentPageNew] Refreshing onboarding data after manual payment...');
      await refreshData();
      console.log('✅ [PaymentPageNew] Data refreshed, navigating to success page');

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
        console.log('⚠️ [PaymentPageNew] Payment error, still updating status to completed...');
        await updateStatus('completed');
        await refreshData(); // Refresh even in error case
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
                  <CryptoPaymentDisplay
                    cryptoWallets={paymentOptions?.cryptoWallets || []}
                    selectedWallet={selectedWallet}
                    onWalletChange={setSelectedWallet}
                    amount={amount}
                    transactionScreenshot={transactionScreenshot}
                    onScreenshotUpload={handleScreenshotUpload}
                    uploadingScreenshot={uploadingScreenshot}
                  />
                )}

                {/* Bank Transfer Payment */}
                {selectedMethod === 'bank' && selectedBankAccount && (
                  <BankTransferDisplay
                    bankAccounts={paymentOptions?.bankAccounts || []}
                    selectedBankAccount={selectedBankAccount}
                    onBankAccountChange={setSelectedBankAccount}
                    amount={amount}
                    paymentReferenceId={user?.paymentReferenceId}
                    transactionScreenshot={transactionScreenshot}
                    onScreenshotUpload={handleScreenshotUpload}
                    uploadingScreenshot={uploadingScreenshot}
                  />
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
                    !transactionScreenshot
                      ? 'Please upload a payment proof screenshot first'
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
                    !transactionScreenshot
                  }
                  className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${confirmingPayment ||
                    uploadingScreenshot ||
                    !transactionScreenshot
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
                  ) : !transactionScreenshot ? (
                    <>
                      <span>Upload Payment Proof First</span>
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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

                <div className="text-center text-sm text-gray-500">
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

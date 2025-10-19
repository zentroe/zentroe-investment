import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, FileText, Check, Download, Loader2, Wallet, Building2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getInvestmentPlans, type InvestmentPlan } from '@/services/onboardingService';
import { getPaymentOptions, submitCryptoPayment, submitBankTransferPayment } from '@/services/paymentService';
import { saveInitialInvestmentAmount } from '@/services/investmentService';
import { toast } from 'sonner';
import SimpleCardPaymentForm from '@/components/payment/SimpleCardPaymentForm';
import CryptoPaymentDisplay from '@/components/payment/CryptoPaymentDisplay';
import BankTransferDisplay from '@/components/payment/BankTransferDisplay';
import { useAuth } from '@/context/AuthContext';

interface NewInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Stage = 'select-plan' | 'enter-amount' | 'payment' | 'success';

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

export default function NewInvestmentModal({ isOpen, onClose, onSuccess }: NewInvestmentModalProps) {
  const { user } = useAuth();
  const [stage, setStage] = useState<Stage>('select-plan');
  const [loading, setLoading] = useState(false);

  // Stage 1: Select Plan
  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Stage 2: Enter Amount
  const [amount, setAmount] = useState('');
  const [savingAmount, setSavingAmount] = useState(false);

  // Stage 3: Payment
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'crypto' | 'bank' | 'card' | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [transactionScreenshot, setTransactionScreenshot] = useState<string>('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  // Stage 4: Success
  const [paymentId, setPaymentId] = useState('');

  // Load investment plans when modal opens
  useEffect(() => {
    if (isOpen && stage === 'select-plan') {
      fetchInvestmentPlans();
    }
  }, [isOpen, stage]);

  // Load payment options when reaching payment stage
  useEffect(() => {
    if (stage === 'payment') {
      fetchPaymentOptions();
    }
  }, [stage]);

  const fetchInvestmentPlans = async () => {
    try {
      setLoadingPlans(true);
      const data = await getInvestmentPlans();
      // API returns { plans: [], count: number }, extract the plans array
      const plans = data.plans || data || [];
      setInvestmentPlans(Array.isArray(plans) ? plans : []);
    } catch (error) {
      console.error('Error fetching investment plans:', error);
      toast.error('Failed to load investment plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchPaymentOptions = async () => {
    try {
      setLoading(true);
      const data = await getPaymentOptions();
      setPaymentOptions(data);

      // Auto-select the first available payment method
      if (data.config.cardPaymentEnabled) {
        setSelectedMethod('card');
      } else if (data.config.cryptoEnabled && data.cryptoWallets.length > 0) {
        setSelectedMethod('crypto');
        setSelectedWallet(data.cryptoWallets[0]);
      } else if (data.config.bankTransferEnabled && data.bankAccounts.length > 0) {
        setSelectedMethod('bank');
        setSelectedBankAccount(data.bankAccounts[0]);
      }
    } catch (error) {
      console.error('Error fetching payment options:', error);
      toast.error('Failed to load payment options');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setStage('enter-amount');
  };

  const handleAmountContinue = async () => {
    const numericAmount = Number(amount.trim().replace(/[^0-9.]/g, ''));

    if (!selectedPlan) {
      toast.error('Please select an investment plan');
      return;
    }

    if (!numericAmount || numericAmount < selectedPlan.minInvestment) {
      toast.error(`Minimum investment amount is $${selectedPlan.minInvestment.toLocaleString()}`);
      return;
    }

    if (selectedPlan.maxInvestment && numericAmount > selectedPlan.maxInvestment) {
      toast.error(`Maximum investment amount is $${selectedPlan.maxInvestment.toLocaleString()}`);
      return;
    }

    setSavingAmount(true);
    try {
      // Pass the selected plan ID to link it with the amount
      await saveInitialInvestmentAmount(numericAmount, selectedPlan._id);
      console.log(`💰 Saved investment amount $${numericAmount} with plan ${selectedPlan._id}`);
      setStage('payment');
    } catch (error) {
      console.error('Error saving investment amount:', error);
      toast.error('Failed to save investment amount');
    } finally {
      setSavingAmount(false);
    }
  };

  const handlePaymentSuccess = (data: any) => {
    setPaymentId(data.paymentId || `ZTR-${Date.now()}`);
    setStage('success');
  };

  const handleManualPaymentConfirmation = async () => {
    if (confirmingPayment) return;

    if (!selectedPlan) {
      toast.error('Investment plan not selected');
      return;
    }

    setConfirmingPayment(true);
    try {
      let paymentResult = null;
      const numericAmount = Number(amount.trim().replace(/[^0-9.]/g, ''));

      if (selectedMethod === 'crypto' && selectedWallet) {
        if (!transactionScreenshot) {
          toast.error('Please upload a screenshot of your transaction');
          setConfirmingPayment(false);
          return;
        }
        paymentResult = await submitCryptoPayment({
          walletId: selectedWallet._id,
          amount: numericAmount,
          proofOfPayment: transactionScreenshot,
          investmentPlanId: selectedPlan._id // ✅ Pass the selected plan ID
        });
        console.log(`✅ Crypto payment submitted with plan ${selectedPlan._id}`);
        toast.success('Crypto payment recorded! Admin will verify your transaction.');
      } else if (selectedMethod === 'bank' && selectedBankAccount) {
        if (!transactionScreenshot) {
          toast.error('Please upload a screenshot of your transaction');
          setConfirmingPayment(false);
          return;
        }
        paymentResult = await submitBankTransferPayment({
          accountId: selectedBankAccount._id,
          amount: numericAmount,
          proofOfPayment: transactionScreenshot,
          investmentPlanId: selectedPlan._id // ✅ Pass the selected plan ID
        });
        console.log(`✅ Bank transfer submitted with plan ${selectedPlan._id}`);
        toast.success('Bank transfer recorded! Admin will verify your payment.');
      }

      setPaymentId(paymentResult?.paymentId || `ZTR-${Date.now()}`);
      setStage('success');
    } catch (error) {
      console.error('Error processing payment confirmation:', error);
      toast.error('Error processing confirmation. Please try again.');
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleScreenshotUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingScreenshot(true);
    try {
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

  const downloadReceipt = () => {
    try {
      const numericAmount = Number(amount.trim().replace(/[^0-9.]/g, ''));
      const currentDate = new Date();
      const formattedAmount = numericAmount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      });

      const methodDisplay = selectedMethod === 'crypto' ? 'Cryptocurrency' :
        selectedMethod === 'bank' ? 'Bank Transfer' :
          selectedMethod === 'card' ? 'Credit/Debit Card' :
            'Payment';

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow pop-ups to download the receipt');
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Investment Receipt - Zentroe</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .receipt-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #A0522D;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-logo {
              font-size: 28px;
              font-weight: bold;
              color: #A0522D;
              margin-bottom: 5px;
            }
            .receipt-title {
              font-size: 20px;
              color: #666;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #A0522D;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding: 5px 0;
            }
            .detail-label {
              font-weight: 600;
              color: #666;
            }
            .detail-value {
              font-weight: 500;
            }
            .amount-highlight {
              font-size: 18px;
              color: #059669;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="company-logo">ZENTROE INVESTMENT</div>
              <div class="receipt-title">Investment Receipt</div>
              <div style="font-size: 12px; color: #888;">Generated on ${currentDate.toLocaleString()}</div>
            </div>

            <div class="section">
              <div class="section-title">Investment Details</div>
              <div class="detail-row">
                <span class="detail-label">Receipt #:</span>
                <span class="detail-value">${paymentId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Investment Plan:</span>
                <span class="detail-value">${selectedPlan?.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value amount-highlight">${formattedAmount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${selectedPlan?.duration} days</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Expected Return:</span>
                <span class="detail-value">${selectedPlan?.profitPercentage}%</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${methodDisplay}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${currentDate.toLocaleDateString()}</span>
              </div>
            </div>

            <div class="footer">
              <div><strong>Thank you for choosing Zentroe Investment!</strong></div>
              <div style="margin-top: 10px;">support@zentroe.com</div>
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };

      toast.success('Receipt is ready for download!');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const handleClose = () => {
    // Reset all state
    setStage('select-plan');
    setSelectedPlan(null);
    setAmount('');
    setSelectedMethod(null);
    setSelectedWallet(null);
    setSelectedBankAccount(null);
    setTransactionScreenshot('');
    setPaymentId('');
    onClose();
  };

  const handleSuccessComplete = () => {
    handleClose();
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {stage === 'select-plan' && 'Select Investment Plan'}
              {stage === 'enter-amount' && 'Enter Investment Amount'}
              {stage === 'payment' && 'Complete Payment'}
              {stage === 'success' && 'Investment Submitted!'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {stage === 'select-plan' && 'Choose a plan that fits your investment goals'}
              {stage === 'enter-amount' && `Investing in ${selectedPlan?.name}`}
              {stage === 'payment' && 'Complete your payment to activate investment'}
              {stage === 'success' && 'Your investment is being processed'}
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stage 1: Select Plan */}
          {stage === 'select-plan' && (
            <div>
              {loadingPlans ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : investmentPlans.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No investment plans available at the moment
                </div>
              ) : (
                <div className="space-y-3">
                  {investmentPlans.map((plan) => (
                    <button
                      key={plan._id}
                      onClick={() => handlePlanSelect(plan)}
                      className="w-full bg-white hover:bg-gray-50 px-5 py-6 border border-gray-200 rounded-lg text-left flex justify-between items-center transition-all hover:border-primary"
                    >
                      <div className="pr-4 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-lg text-gray-900">{plan.name}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-medium">
                              {plan.profitPercentage}% profit
                            </span>
                            <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium">
                              {plan.duration} days
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                        <p className="text-xs text-gray-500">
                          Min: ${plan.minInvestment.toLocaleString()}
                          {plan.maxInvestment && ` • Max: $${plan.maxInvestment.toLocaleString()}`}
                        </p>
                      </div>
                      <ChevronRight className="text-gray-400 shrink-0" size={24} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stage 2: Enter Amount */}
          {stage === 'enter-amount' && selectedPlan && (
            <div className="max-w-xl mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">{selectedPlan.name}</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Expected Return: <strong>{selectedPlan.profitPercentage}%</strong></p>
                  <p>• Duration: <strong>{selectedPlan.duration} days</strong></p>
                  <p>• Minimum Investment: <strong>${selectedPlan.minInvestment.toLocaleString()}</strong></p>
                  {selectedPlan.maxInvestment && (
                    <p>• Maximum Investment: <strong>${selectedPlan.maxInvestment.toLocaleString()}</strong></p>
                  )}
                </div>
              </div>

              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={`Enter amount (min: $${selectedPlan.minInvestment.toLocaleString()})`}
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                className="mb-4 text-lg"
              />

              {amount && Number(amount.trim().replace(/[^0-9.]/g, '')) > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Investment Amount:</span>
                    <span className="font-semibold text-lg">${Number(amount.trim().replace(/[^0-9.]/g, '')).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expected Profit:</span>
                    <span className="font-semibold text-green-600">
                      ${(Number(amount.trim().replace(/[^0-9.]/g, '')) * selectedPlan.profitPercentage / 100).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-sm flex items-start gap-3 mb-6">
                <FileText className="text-primary mt-1 shrink-0" size={18} />
                <div>
                  <p className="font-medium text-gray-900">Investment Terms</p>
                  <p className="text-gray-600 mt-1">
                    Your investment will be locked for {selectedPlan.duration} days. You can request redemption quarterly.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStage('select-plan')}
                  variant="outline"
                  className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                >
                  <ChevronLeft size={18} className="mr-1" />
                  Back
                </Button>
                <Button
                  onClick={handleAmountContinue}
                  disabled={savingAmount || !amount || Number(amount.trim().replace(/[^0-9.]/g, '')) < selectedPlan.minInvestment}
                  className="flex-1 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingAmount ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Payment
                      <ChevronRight size={18} className="ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Stage 3: Payment */}
          {stage === 'payment' && (
            <div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Investment Amount</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${Number(amount.trim().replace(/[^0-9.]/g, '')).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{selectedPlan?.name}</p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div>
                  {/* Payment Method Selection */}
                  {paymentOptions && (
                    <>
                      {/* Show method selector if more than one method available */}
                      {(() => {
                        const availableMethods = [];
                        if (paymentOptions.config.cardPaymentEnabled) availableMethods.push('card');
                        if (paymentOptions.config.cryptoEnabled && paymentOptions.cryptoWallets.length > 0) availableMethods.push('crypto');
                        if (paymentOptions.config.bankTransferEnabled && paymentOptions.bankAccounts.length > 0) availableMethods.push('bank');

                        return availableMethods.length > 1 ? (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
                            <div className="grid grid-cols-3 gap-3">
                              {availableMethods.includes('card') && (
                                <button
                                  onClick={() => setSelectedMethod('card')}
                                  className={`p-4 border-2 rounded-lg text-center transition-all ${selectedMethod === 'card'
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                    }`}
                                >
                                  <CreditCard className="h-6 w-6 mx-auto mb-2" />
                                  <div className="font-medium text-sm">Card</div>
                                </button>
                              )}

                              {availableMethods.includes('crypto') && (
                                <button
                                  onClick={() => {
                                    setSelectedMethod('crypto');
                                    if (paymentOptions.cryptoWallets.length > 0) {
                                      setSelectedWallet(paymentOptions.cryptoWallets[0]);
                                    }
                                  }}
                                  className={`p-4 border-2 rounded-lg text-center transition-all ${selectedMethod === 'crypto'
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                    }`}
                                >
                                  <Wallet className="h-6 w-6 mx-auto mb-2" />
                                  <div className="font-medium text-sm">Crypto</div>
                                </button>
                              )}

                              {availableMethods.includes('bank') && (
                                <button
                                  onClick={() => {
                                    setSelectedMethod('bank');
                                    if (paymentOptions.bankAccounts.length > 0) {
                                      setSelectedBankAccount(paymentOptions.bankAccounts[0]);
                                    }
                                  }}
                                  className={`p-4 border-2 rounded-lg text-center transition-all ${selectedMethod === 'bank'
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                    }`}
                                >
                                  <Building2 className="h-6 w-6 mx-auto mb-2" />
                                  <div className="font-medium text-sm">Bank</div>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : null;
                      })()}

                      {/* Card Payment */}
                      {selectedMethod === 'card' && paymentOptions.config.cardPaymentEnabled && (
                        <SimpleCardPaymentForm
                          amount={Number(amount.trim().replace(/[^0-9.]/g, ''))}
                          currency="USD"
                          onSuccess={handlePaymentSuccess}
                          onCancel={() => setStage('enter-amount')}
                        />
                      )}

                      {/* Crypto Payment */}
                      {selectedMethod === 'crypto' && selectedWallet && (
                        <div className="space-y-4">
                          <CryptoPaymentDisplay
                            cryptoWallets={paymentOptions?.cryptoWallets || []}
                            selectedWallet={selectedWallet}
                            onWalletChange={setSelectedWallet}
                            amount={Number(amount.trim().replace(/[^0-9.]/g, ''))}
                            transactionScreenshot={transactionScreenshot}
                            onScreenshotUpload={handleScreenshotUpload}
                            uploadingScreenshot={uploadingScreenshot}
                          />

                          <div className="flex gap-3 pt-4">
                            <Button onClick={() => setStage('enter-amount')} variant="outline" className="flex-1">
                              <ChevronLeft size={16} className="mr-2" />
                              Back
                            </Button>
                            <Button
                              onClick={handleManualPaymentConfirmation}
                              disabled={!transactionScreenshot || confirmingPayment}
                              className="flex-1 bg-primary hover:bg-primary/90"
                            >
                              {confirmingPayment ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                'Confirm Payment'
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Bank Transfer */}
                      {selectedMethod === 'bank' && selectedBankAccount && (
                        <div className="space-y-4">
                          <BankTransferDisplay
                            bankAccounts={paymentOptions?.bankAccounts || []}
                            selectedBankAccount={selectedBankAccount}
                            onBankAccountChange={setSelectedBankAccount}
                            amount={Number(amount.trim().replace(/[^0-9.]/g, ''))}
                            paymentReferenceId={user?.paymentReferenceId}
                          />

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Upload Payment Proof *
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleScreenshotUpload}
                              disabled={uploadingScreenshot}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                            />
                            {transactionScreenshot && (
                              <div className="mt-2">
                                <img src={transactionScreenshot} alt="Payment proof" className="max-h-40 rounded border" />
                              </div>
                            )}
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button onClick={() => setStage('enter-amount')} variant="outline" className="flex-1">
                              <ChevronLeft size={16} className="mr-2" />
                              Back
                            </Button>
                            <Button
                              onClick={handleManualPaymentConfirmation}
                              disabled={!transactionScreenshot || confirmingPayment}
                              className="flex-1 bg-primary hover:bg-primary/90"
                            >
                              {confirmingPayment ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                'Confirm Payment'
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Stage 4: Success */}
          {stage === 'success' && (
            <div className="max-w-xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <Check className="w-12 h-12 text-green-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Investment Submitted!
              </h3>
              <p className="text-gray-600 mb-8">
                Your investment is being processed and will be activated after payment verification
              </p>

              <div className="bg-white border rounded-lg p-6 mb-6 text-left">
                <h4 className="font-semibold mb-4">Investment Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Receipt ID:</span>
                    <span className="font-mono">{paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">${Number(amount.trim().replace(/[^0-9.]/g, '')).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Return:</span>
                    <span className="font-semibold text-green-600">{selectedPlan?.profitPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span>{selectedPlan?.duration} days</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Payment will be verified within 1-2 business days</li>
                  <li>• You'll receive an email confirmation</li>
                  <li>• Investment will be activated after verification</li>
                  <li>• Track progress in your portfolio</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={downloadReceipt}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                >
                  <Download size={18} className="mr-2" />
                  Download Receipt
                </Button>
                <Button
                  onClick={handleSuccessComplete}
                  className="w-full bg-primary text-white hover:bg-primary/90"
                >
                  Go to Portfolio
                  <ChevronRight size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

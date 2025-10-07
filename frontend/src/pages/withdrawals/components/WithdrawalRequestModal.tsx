import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import { createWithdrawalRequest, InvestmentWithWithdrawal, PaymentDetails } from '@/services/withdrawalService';
import { formatCurrency } from '../../../utils/formatters';
import { toast } from 'sonner';
import { X, AlertCircle, CreditCard, Wallet, Mail, DollarSign } from 'lucide-react';

interface WithdrawalRequestModalProps {
  investment: InvestmentWithWithdrawal;
  onClose: () => void;
  onSuccess: () => void;
}

const WithdrawalRequestModal: React.FC<WithdrawalRequestModalProps> = ({
  investment,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [loading, setLoading] = useState(false);

  // Form state
  const [withdrawalType, setWithdrawalType] = useState<'profits_only' | 'full_withdrawal' | 'partial_principal'>('profits_only');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'crypto' | 'check'>('bank_transfer');

  // Bank details
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    swiftCode: ''
  });

  // Crypto details
  const [cryptoDetails, setCryptoDetails] = useState({
    walletAddress: '',
    network: 'ethereum',
    currency: 'USDT'
  });

  // Check details
  const [checkDetails, setCheckDetails] = useState({
    mailingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    }
  });

  const eligibility = investment.withdrawalEligibility;

  const getMaxAmount = () => {
    switch (withdrawalType) {
      case 'profits_only':
        return eligibility.maxProfitsWithdraw;
      case 'full_withdrawal':
        return eligibility.availableAmount;
      case 'partial_principal':
        return eligibility.availableAmount;
      default:
        return 0;
    }
  };

  const getWithdrawalTypeDescription = (type: string) => {
    switch (type) {
      case 'profits_only':
        return `Withdraw only the profits earned (max: ${formatCurrency(eligibility.maxProfitsWithdraw)})`;
      case 'full_withdrawal':
        return investment.status === 'completed'
          ? `Withdraw everything - principal and profits (max: ${formatCurrency(eligibility.availableAmount)})`
          : 'Full withdrawal only available for completed investments';
      case 'partial_principal':
        return investment.status === 'completed'
          ? `Withdraw a custom amount from principal and profits (max: ${formatCurrency(eligibility.availableAmount)})`
          : 'Principal withdrawal only available for completed investments';
      default:
        return '';
    }
  };

  const calculateFees = (amount: number, method: string) => {
    switch (method) {
      case 'crypto':
        return amount * 0.01; // 1%
      case 'bank_transfer':
        return amount * 0.005; // 0.5%
      case 'check':
        return 10; // $10 flat fee
      default:
        return 0;
    }
  };

  const handleAmountChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    const maxAmount = getMaxAmount();

    if (numericValue <= maxAmount) {
      setAmount(value);
    } else {
      setAmount(maxAmount.toString());
      toast.error(`Maximum withdrawal amount is ${formatCurrency(maxAmount)}`);
    }
  };

  const validateDetailsStep = () => {
    const numericAmount = parseFloat(amount);

    if (!numericAmount || numericAmount <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return false;
    }

    const maxAmount = getMaxAmount();
    if (numericAmount > maxAmount) {
      toast.error(`Amount cannot exceed ${formatCurrency(maxAmount)}`);
      return false;
    }

    if (withdrawalType !== 'profits_only' && investment.status !== 'completed') {
      toast.error('Principal withdrawal only allowed for completed investments');
      return false;
    }

    return true;
  };

  const validatePaymentStep = () => {
    switch (paymentMethod) {
      case 'bank_transfer':
        if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.routingNumber || !bankDetails.bankName) {
          toast.error('Please fill in all required bank details');
          return false;
        }
        break;
      case 'crypto':
        if (!cryptoDetails.walletAddress || !cryptoDetails.network || !cryptoDetails.currency) {
          toast.error('Please fill in all required crypto details');
          return false;
        }
        break;
      case 'check':
        const addr = checkDetails.mailingAddress;
        if (!addr.street || !addr.city || !addr.state || !addr.zipCode || !addr.country) {
          toast.error('Please fill in all required mailing address details');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateDetailsStep()) {
      setStep('payment');
    }
  };

  const handleSubmit = async () => {
    if (!validatePaymentStep()) return;

    setLoading(true);
    try {
      const paymentDetails: PaymentDetails = {};

      switch (paymentMethod) {
        case 'bank_transfer':
          paymentDetails.bankDetails = bankDetails;
          break;
        case 'crypto':
          paymentDetails.cryptoDetails = cryptoDetails;
          break;
        case 'check':
          paymentDetails.checkDetails = checkDetails;
          break;
      }

      await createWithdrawalRequest({
        userInvestmentId: investment._id,
        amount: parseFloat(amount),
        type: withdrawalType,
        paymentMethod,
        paymentDetails,
        reason: reason || undefined
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error creating withdrawal request:', error);
      toast.error(error.response?.data?.message || 'Failed to create withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const renderDetailsStep = () => {
    const numericAmount = parseFloat(amount) || 0;
    const fees = calculateFees(numericAmount, paymentMethod);
    const netAmount = numericAmount - fees;

    return (
      <div className="space-y-6">
        {/* Investment Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Investment Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Principal:</span>
              <span className="ml-2 font-medium">{formatCurrency(investment.amount)}</span>
            </div>
            <div>
              <span className="text-blue-700">Profits Earned:</span>
              <span className="ml-2 font-medium text-green-600">{formatCurrency(investment.totalProfitsEarned)}</span>
            </div>
            <div>
              <span className="text-blue-700">Already Withdrawn:</span>
              <span className="ml-2 font-medium">{formatCurrency(investment.totalWithdrawn)}</span>
            </div>
            <div>
              <span className="text-blue-700">Available:</span>
              <span className="ml-2 font-medium text-green-600">{formatCurrency(eligibility.availableAmount)}</span>
            </div>
          </div>
        </div>

        {/* Withdrawal Type */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Withdrawal Type</Label>
          <RadioGroup value={withdrawalType} onValueChange={(value: any) => setWithdrawalType(value)}>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="withdrawalType"
                  value="profits_only"
                  checked={withdrawalType === 'profits_only'}
                  onChange={(e) => setWithdrawalType(e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Profits Only</div>
                  <div className="text-sm text-gray-600">{getWithdrawalTypeDescription('profits_only')}</div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${investment.status !== 'completed' ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                <input
                  type="radio"
                  name="withdrawalType"
                  value="full_withdrawal"
                  checked={withdrawalType === 'full_withdrawal'}
                  onChange={(e) => setWithdrawalType(e.target.value as any)}
                  disabled={investment.status !== 'completed'}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Full Withdrawal</div>
                  <div className="text-sm text-gray-600">{getWithdrawalTypeDescription('full_withdrawal')}</div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${investment.status !== 'completed' ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                <input
                  type="radio"
                  name="withdrawalType"
                  value="partial_principal"
                  checked={withdrawalType === 'partial_principal'}
                  onChange={(e) => setWithdrawalType(e.target.value as any)}
                  disabled={investment.status !== 'completed'}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Custom Amount</div>
                  <div className="text-sm text-gray-600">{getWithdrawalTypeDescription('partial_principal')}</div>
                </div>
              </label>
            </div>
          </RadioGroup>
        </div>

        {/* Amount */}
        <div>
          <Label htmlFor="amount" className="text-base font-semibold">Withdrawal Amount</Label>
          <div className="mt-2 relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="pl-10"
              step="0.01"
              min="0"
              max={getMaxAmount()}
            />
          </div>
          <div className="mt-1 text-sm text-gray-600">
            Maximum: {formatCurrency(getMaxAmount())}
          </div>
        </div>

        {/* Fee Calculation */}
        {numericAmount > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Fee Calculation</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Withdrawal Amount:</span>
                <span>{formatCurrency(numericAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee ({paymentMethod === 'crypto' ? '1%' : paymentMethod === 'bank_transfer' ? '0.5%' : '$10'}):</span>
                <span>{formatCurrency(fees)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Net Amount:</span>
                <span>{formatCurrency(netAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Reason (Optional) */}
        <div>
          <Label htmlFor="reason" className="text-base font-semibold">Reason (Optional)</Label>
          <Input
            id="reason"
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
            placeholder="e.g., Monthly profit withdrawal"
            className="mt-2"
          />
        </div>
      </div>
    );
  };

  const renderPaymentStep = () => {
    return (
      <div className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Payment Method</Label>
          <div className="grid gap-3">
            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="bank_transfer"
                checked={paymentMethod === 'bank_transfer'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
              />
              <CreditCard className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium">Bank Transfer</div>
                <div className="text-sm text-gray-600">0.5% processing fee</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="crypto"
                checked={paymentMethod === 'crypto'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
              />
              <Wallet className="w-5 h-5 text-orange-600" />
              <div>
                <div className="font-medium">Cryptocurrency</div>
                <div className="text-sm text-gray-600">1% processing fee</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="check"
                checked={paymentMethod === 'check'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
              />
              <Mail className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">Physical Check</div>
                <div className="text-sm text-gray-600">$10 flat fee</div>
              </div>
            </label>
          </div>
        </div>

        {/* Payment Details Form */}
        {paymentMethod === 'bank_transfer' && (
          <div className="space-y-4">
            <h4 className="font-semibold">Bank Account Details</h4>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="accountName">Account Holder Name *</Label>
                <Input
                  id="accountName"
                  value={bankDetails.accountName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  value={bankDetails.accountNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  placeholder="1234567890"
                />
              </div>
              <div>
                <Label htmlFor="routingNumber">Routing Number *</Label>
                <Input
                  id="routingNumber"
                  value={bankDetails.routingNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
                  placeholder="021000021"
                />
              </div>
              <div>
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  value={bankDetails.bankName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  placeholder="Chase Bank"
                />
              </div>
              <div>
                <Label htmlFor="swiftCode">SWIFT Code (for international transfers)</Label>
                <Input
                  id="swiftCode"
                  value={bankDetails.swiftCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankDetails({ ...bankDetails, swiftCode: e.target.value })}
                  placeholder="CHASUS33"
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'crypto' && (
          <div className="space-y-4">
            <h4 className="font-semibold">Cryptocurrency Details</h4>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="walletAddress">Wallet Address *</Label>
                <Input
                  id="walletAddress"
                  value={cryptoDetails.walletAddress}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCryptoDetails({ ...cryptoDetails, walletAddress: e.target.value })}
                  placeholder="0x742d35cc6634C0532925a3b8D0Bb6464880B4928"
                />
              </div>
              <div>
                <Label htmlFor="network">Network *</Label>
                <select
                  id="network"
                  value={cryptoDetails.network}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCryptoDetails({ ...cryptoDetails, network: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="ERC-20">Ethereum (ERC-20)</option>
                  <option value="BEP-20">Binance Smart Chain (BEP-20)</option>
                  <option value="MATIC">Polygon (MATIC)</option>
                  <option value="TRC-20">Tron (TRC-20)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="currency">Currency *</Label>
                <select
                  id="currency"
                  value={cryptoDetails.currency}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCryptoDetails({ ...cryptoDetails, currency: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                  <option value="BNB">BNB</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'check' && (
          <div className="space-y-4">
            <h4 className="font-semibold">Mailing Address</h4>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={checkDetails.mailingAddress.street}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckDetails({
                    ...checkDetails,
                    mailingAddress: { ...checkDetails.mailingAddress, street: e.target.value }
                  })}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={checkDetails.mailingAddress.city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckDetails({
                      ...checkDetails,
                      mailingAddress: { ...checkDetails.mailingAddress, city: e.target.value }
                    })}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={checkDetails.mailingAddress.state}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckDetails({
                      ...checkDetails,
                      mailingAddress: { ...checkDetails.mailingAddress, state: e.target.value }
                    })}
                    placeholder="NY"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={checkDetails.mailingAddress.zipCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckDetails({
                      ...checkDetails,
                      mailingAddress: { ...checkDetails.mailingAddress, zipCode: e.target.value }
                    })}
                    placeholder="10001"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={checkDetails.mailingAddress.country}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckDetails({
                      ...checkDetails,
                      mailingAddress: { ...checkDetails.mailingAddress, country: e.target.value }
                    })}
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Request Withdrawal</h2>
              <p className="text-gray-600">
                Step {step === 'details' ? '1' : '2'} of 2: {step === 'details' ? 'Withdrawal Details' : 'Payment Information'}
              </p>
            </div>
            <Button variant="outline" onClick={onClose} className="p-2">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center mb-6">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step === 'details' ? 'bg-primary text-white' : 'bg-primary text-white'
              }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step === 'payment' ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step === 'payment' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
              2
            </div>
          </div>

          {/* Form Content */}
          <div className="mb-6">
            {step === 'details' ? renderDetailsStep() : renderPaymentStep()}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {step === 'details' ? (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Next: Payment Details
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </>
            )}
          </div>

          {/* Warning */}
          <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <strong>Important:</strong> Withdrawal requests require admin approval and may take 1-3 business days to process.
              Make sure all information is correct as changes cannot be made after submission.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WithdrawalRequestModal;
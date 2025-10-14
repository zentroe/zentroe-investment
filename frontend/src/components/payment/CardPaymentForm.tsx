import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface CardPaymentFormProps {
  amount: number;
  currency: string;
  paymentId: string;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

interface CardDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  holderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function CardPaymentForm({
  amount,
  currency,
  paymentId,
  onSuccess,
  onCancel
}: CardPaymentFormProps) {
  const [step, setStep] = useState<'card-details' | 'processing' | 'success'>('card-details');
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    }
  });

  // Card validation functions
  const validateCardNumber = (number: string): boolean => {
    const cleaned = number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const getCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'MasterCard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    return 'Unknown';
  };

  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardDetails(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate card details
      const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, '');

      if (!validateCardNumber(cleanCardNumber)) {
        toast.error('Invalid card number');
        setLoading(false);
        return;
      }

      if (!cardDetails.holderName.trim()) {
        toast.error('Cardholder name is required');
        setLoading(false);
        return;
      }

      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        toast.error('Invalid CVV');
        setLoading(false);
        return;
      }

      // First, add the card (tokenize it)
      const addCardResponse = await fetch('/api/payments/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cardNumber: cleanCardNumber,
          expiryMonth: parseInt(cardDetails.expiryMonth),
          expiryYear: parseInt(cardDetails.expiryYear),
          cvv: cardDetails.cvv,
          holderName: cardDetails.holderName,
          billingAddress: cardDetails.billingAddress
        })
      });

      const cardData = await addCardResponse.json();

      if (!addCardResponse.ok) {
        toast.error(cardData.message || 'Failed to add card');
        setLoading(false);
        return;
      }

      setStep('processing');

      // Process the payment with the tokenized card
      const paymentResponse = await fetch('/api/payments/cards/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          paymentId,
          cardTokenId: cardData.card.tokenId,
          cvv: cardDetails.cvv
        })
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok) {
        toast.error(paymentResult.message || 'Payment failed');
        setLoading(false);
        setStep('card-details');
        return;
      }

      setStep('success');
      toast.success('Payment submitted successfully!');

      setTimeout(() => {
        onSuccess(paymentResult);
      }, 2000);

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setLoading(false);
      setStep('card-details');
    }
  };

  if (step === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-orange-600 rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold">Processing Payment</h3>
            <p className="text-gray-600">
              Your payment is being processed securely. This may take a few moments.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-primary to-orange-600 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              Your payment has been submitted for admin verification.
              You'll receive a notification once it's processed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const cardBrand = getCardBrand(cardDetails.cardNumber);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString().padStart(2, '0'), label: month.toString().padStart(2, '0') };
  });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Card Payment
        </CardTitle>
        <div className="text-sm text-gray-600">
          Amount: <span className="font-semibold text-lg">{currency} {amount.toLocaleString()}</span>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Secure Payment</p>
                <p>Your card details are encrypted and never stored on our servers.</p>
              </div>
            </div>
          </div>

          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                required
                className="pr-16"
              />
              {cardBrand !== 'Unknown' && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-sm font-medium text-gray-500">{cardBrand}</span>
                </div>
              )}
            </div>
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">Month</Label>
              <select
                id="expiryMonth"
                value={cardDetails.expiryMonth}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCardDetails(prev => ({ ...prev, expiryMonth: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                type="password"
                placeholder="123"
                value={cardDetails.cvv}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardDetails(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                maxLength={cardBrand === 'American Express' ? 4 : 3}
                required
              />
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="holderName">Cardholder Name</Label>
            <Input
              id="holderName"
              placeholder="John Doe"
              value={cardDetails.holderName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardDetails(prev => ({ ...prev, holderName: e.target.value }))}
              required
            />
          </div>

          {/* Billing Address */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Billing Address</Label>

            <Input
              placeholder="Street Address"
              value={cardDetails.billingAddress.street}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardDetails(prev => ({
                ...prev,
                billingAddress: { ...prev.billingAddress, street: e.target.value }
              }))}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="City"
                value={cardDetails.billingAddress.city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardDetails(prev => ({
                  ...prev,
                  billingAddress: { ...prev.billingAddress, city: e.target.value }
                }))}
                required
              />
              <Input
                placeholder="State"
                value={cardDetails.billingAddress.state}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardDetails(prev => ({
                  ...prev,
                  billingAddress: { ...prev.billingAddress, state: e.target.value }
                }))}
                required
              />
            </div>

            <Input
              placeholder="ZIP Code"
              value={cardDetails.billingAddress.zipCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardDetails(prev => ({
                ...prev,
                billingAddress: { ...prev.billingAddress, zipCode: e.target.value }
              }))}
              required
            />
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Manual Verification Required</p>
                <p>Card payments require admin verification before investment activation.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-orange-600 text-white"
            >
              {loading ? 'Processing...' : `Pay ${currency} ${amount.toLocaleString()}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

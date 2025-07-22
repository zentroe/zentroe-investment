import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Building2, Coins, ArrowLeft } from "lucide-react";
import CardPaymentForm from "./CardPaymentForm";
import BankTransferForm from "./BankTransferForm";
import CryptoPaymentForm from "./CryptoPaymentForm";

interface PaymentMethodSelectorProps {
  amount: number;
  currency: string;
  paymentId: string;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

type PaymentMethod = 'card' | 'bank_transfer' | 'crypto' | null;

export default function PaymentMethodSelector({
  amount,
  currency,
  paymentId,
  onSuccess,
  onCancel
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);

  const paymentMethods = [
    {
      id: 'card' as PaymentMethod,
      name: 'Debit / Credit Card',
      description: 'Instant processing with secure tokenization',
      icon: CreditCard,
      processingTime: 'Instant',
      fees: 'No fees',
      recommended: true
    },
    {
      id: 'bank_transfer' as PaymentMethod,
      name: 'Bank Transfer',
      description: 'Direct bank-to-bank transfer',
      icon: Building2,
      processingTime: '1-3 business days',
      fees: 'No fees',
      recommended: false
    },
    {
      id: 'crypto' as PaymentMethod,
      name: 'Cryptocurrency',
      description: 'Bitcoin, Ethereum, USDT, USDC supported',
      icon: Coins,
      processingTime: '10-60 minutes',
      fees: 'Network fees apply',
      recommended: false
    }
  ];

  const handleBack = () => {
    setSelectedMethod(null);
  };

  if (selectedMethod === 'card') {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payment Methods
        </Button>
        <CardPaymentForm
          amount={amount}
          currency={currency}
          paymentId={paymentId}
          onSuccess={onSuccess}
          onCancel={handleBack}
        />
      </div>
    );
  }

  if (selectedMethod === 'bank_transfer') {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payment Methods
        </Button>
        <BankTransferForm
          amount={amount}
          currency={currency}
          paymentId={paymentId}
          onSuccess={onSuccess}
          onCancel={handleBack}
        />
      </div>
    );
  }

  if (selectedMethod === 'crypto') {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payment Methods
        </Button>
        <CryptoPaymentForm
          amount={amount}
          currency={currency}
          paymentId={paymentId}
          onSuccess={onSuccess}
          onCancel={handleBack}
        />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Choose Payment Method</CardTitle>
        <div className="text-center text-sm text-gray-600">
          Investment Amount: <span className="font-semibold text-lg">{currency} {amount.toLocaleString()}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {paymentMethods.map((method) => {
          const IconComponent = method.icon;
          return (
            <div
              key={method.id}
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 hover:bg-gray-50 ${method.recommended ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              {method.recommended && (
                <div className="absolute -top-2 left-4 bg-primary text-white text-xs px-2 py-1 rounded">
                  Recommended
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${method.recommended ? 'bg-primary/10' : 'bg-gray-100'
                  }`}>
                  <IconComponent className={`w-6 h-6 ${method.recommended ? 'text-primary' : 'text-gray-600'
                    }`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    <Button
                      variant={method.recommended ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMethod(method.id);
                      }}
                      className={method.recommended ? "bg-gradient-to-r from-primary to-orange-600 text-white" : ""}
                    >
                      Select
                    </Button>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{method.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium text-gray-700">Processing Time:</span>
                      <p className="text-gray-600">{method.processingTime}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fees:</span>
                      <p className="text-gray-600">{method.fees}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-blue-900 mb-2">Secure Payment Processing</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• All payments are processed with bank-level security</li>
            <li>• Your investment will be activated upon payment verification</li>
            <li>• You'll receive email confirmation for all transactions</li>
            <li>• Customer support available 24/7 for payment assistance</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel Investment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

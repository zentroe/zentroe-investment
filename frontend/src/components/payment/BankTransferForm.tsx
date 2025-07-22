import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Upload, AlertTriangle, CheckCircle, Copy } from "lucide-react";
import { toast } from "sonner";

interface BankTransferFormProps {
  amount: number;
  currency: string;
  paymentId: string;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  swiftCode?: string;
  referenceCode?: string;
}

export default function BankTransferForm({
  amount,
  currency,
  paymentId,
  onSuccess,
  onCancel
}: BankTransferFormProps) {
  const [step, setStep] = useState<'instructions' | 'details' | 'upload' | 'success'>('instructions');
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    swiftCode: '',
    referenceCode: ''
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Company bank details (these would typically come from your backend/config)
  const companyBankDetails = {
    bankName: "JPMorgan Chase Bank",
    accountName: "Zentroe Investment LLC",
    accountNumber: "1234567890",
    routingNumber: "021000021",
    swiftCode: "CHASUS33",
    address: "270 Park Avenue, New York, NY 10017"
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    });
  };

  const generateReferenceCode = (): string => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `ZEN-${timestamp.slice(-6)}-${random}`;
  };

  const handleContinue = () => {
    const refCode = generateReferenceCode();
    setBankDetails(prev => ({ ...prev, referenceCode: refCode }));
    setStep('details');
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankDetails.bankName.trim()) {
      toast.error('Bank name is required');
      return;
    }

    if (!bankDetails.accountNumber.trim()) {
      toast.error('Account number is required');
      return;
    }

    if (!bankDetails.accountHolderName.trim()) {
      toast.error('Account holder name is required');
      return;
    }

    setStep('upload');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a JPEG, PNG, or PDF file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setReceiptFile(file);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFinalSubmit = async () => {
    if (!receiptFile) {
      toast.error('Please upload a payment receipt');
      return;
    }

    setLoading(true);

    try {
      // Convert file to base64
      const base64Data = await convertFileToBase64(receiptFile);

      // Create JSON payload instead of FormData
      const payload = {
        paymentId,
        amount: amount.toString(),
        currency,
        paymentMethod: 'bank_transfer',
        bankName: bankDetails.bankName,
        accountNumber: bankDetails.accountNumber,
        routingNumber: bankDetails.routingNumber,
        accountHolderName: bankDetails.accountHolderName,
        swiftCode: bankDetails.swiftCode || '',
        referenceCode: bankDetails.referenceCode || '',
        receiptFile: {
          data: base64Data,
          originalName: receiptFile.name
        }
      };

      const response = await fetch('/api/payments/bank-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || 'Failed to submit bank transfer');
        setLoading(false);
        return;
      }

      setStep('success');
      toast.success('Bank transfer submitted successfully!');

      setTimeout(() => {
        onSuccess(result);
      }, 2000);

    } catch (error: any) {
      console.error('Bank transfer error:', error);
      toast.error('Failed to submit bank transfer. Please try again.');
      setLoading(false);
    }
  };

  if (step === 'instructions') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Bank Transfer Instructions
          </CardTitle>
          <div className="text-sm text-gray-600">
            Amount: <span className="font-semibold text-lg">{currency} {amount.toLocaleString()}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Transfer Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Bank Name:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{companyBankDetails.bankName}</span>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(companyBankDetails.bankName, 'Bank name')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-700">Account Name:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{companyBankDetails.accountName}</span>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(companyBankDetails.accountName, 'Account name')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-700">Account Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{companyBankDetails.accountNumber}</span>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(companyBankDetails.accountNumber, 'Account number')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-700">Routing Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{companyBankDetails.routingNumber}</span>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(companyBankDetails.routingNumber, 'Routing number')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-700">SWIFT Code:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{companyBankDetails.swiftCode}</span>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(companyBankDetails.swiftCode, 'SWIFT code')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Important Instructions:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Include the reference code in the transfer description</li>
                  <li>Transfer exactly {currency} {amount.toLocaleString()}</li>
                  <li>Keep your transfer receipt for upload</li>
                  <li>Processing may take 1-3 business days</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1 bg-gradient-to-r from-primary to-orange-600 text-white"
            >
              I've Made the Transfer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'details') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Your Bank Details
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please provide your bank account details for verification
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div className="text-sm text-green-700">
                  <p className="font-medium">Reference Code: {bankDetails.referenceCode}</p>
                  <p className="text-xs">Use this code in your transfer description</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolderName">Account Holder Name</Label>
              <Input
                id="accountHolderName"
                placeholder="John Doe"
                value={bankDetails.accountHolderName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBankDetails(prev => ({ ...prev, accountHolderName: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="Bank of America"
                value={bankDetails.bankName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBankDetails(prev => ({ ...prev, bankName: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="1234567890"
                value={bankDetails.accountNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input
                id="routingNumber"
                placeholder="021000021"
                value={bankDetails.routingNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBankDetails(prev => ({ ...prev, routingNumber: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="swiftCode">SWIFT Code (Optional)</Label>
              <Input
                id="swiftCode"
                placeholder="CHASUS33"
                value={bankDetails.swiftCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBankDetails(prev => ({ ...prev, swiftCode: e.target.value }))
                }
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('instructions')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-orange-600 text-white"
              >
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (step === 'upload') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Receipt
          </CardTitle>
          <p className="text-sm text-gray-600">
            Upload your bank transfer receipt or confirmation
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-700">
              <p className="font-medium">Reference: {bankDetails.referenceCode}</p>
              <p>Amount: {currency} {amount.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Payment Receipt</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                id="receipt"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="receipt" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {receiptFile ? receiptFile.name : 'Click to upload receipt'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPEG, PNG, or PDF (max 5MB)
                </p>
              </label>
            </div>
          </div>

          {receiptFile && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div className="text-sm text-green-700">
                  <p className="font-medium">File uploaded: {receiptFile.name}</p>
                  <p className="text-xs">Size: {(receiptFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="text-xs text-amber-700">
                <p className="font-medium">Verification Required</p>
                <p>Admin will verify your transfer before activating the investment.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setStep('details')}
              disabled={loading}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={loading || !receiptFile}
              className="flex-1 bg-gradient-to-r from-primary to-orange-600 text-white"
            >
              {loading ? 'Submitting...' : 'Submit Transfer'}
            </Button>
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
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-600">Transfer Submitted</h3>
            <p className="text-gray-600">
              Your bank transfer has been submitted for verification.
              You'll receive a notification once it's processed.
            </p>
            <div className="text-sm text-gray-500">
              Reference: {bankDetails.referenceCode}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

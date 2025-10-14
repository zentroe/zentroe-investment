import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Upload, AlertTriangle, CheckCircle, Copy, QrCode } from "lucide-react";
import { toast } from "sonner";

interface CryptoPaymentFormProps {
  amount: number;
  currency: string;
  paymentId: string;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

interface CryptoDetails {
  cryptocurrency: string;
  walletAddress: string;
  transactionHash: string;
  userWalletAddress: string;
  networkFee?: string;
}

interface WalletInfo {
  address: string;
  network: string;
  minimumConfirmations: number;
}

export default function CryptoPaymentForm({
  amount,
  currency,
  paymentId,
  onSuccess,
  onCancel
}: CryptoPaymentFormProps) {
  const [step, setStep] = useState<'select' | 'instructions' | 'details' | 'upload' | 'success'>('select');
  const [loading, setLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');
  const [cryptoDetails, setCryptoDetails] = useState<CryptoDetails>({
    cryptocurrency: '',
    walletAddress: '',
    transactionHash: '',
    userWalletAddress: '',
    networkFee: ''
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Company crypto wallets (these would typically come from your backend/config)
  const cryptoWallets: Record<string, WalletInfo> = {
    bitcoin: {
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      network: "Bitcoin Mainnet",
      minimumConfirmations: 3
    },
    ethereum: {
      address: "0x742d35Cc6634C0532925a3b8D8Ac342AC32B8C88",
      network: "Ethereum Mainnet",
      minimumConfirmations: 12
    },
    usdt: {
      address: "0x742d35Cc6634C0532925a3b8D8Ac342AC32B8C88",
      network: "Ethereum (ERC-20)",
      minimumConfirmations: 12
    },
    usdc: {
      address: "0x742d35Cc6634C0532925a3b8D8Ac342AC32B8C88",
      network: "Ethereum (ERC-20)",
      minimumConfirmations: 12
    }
  };

  const cryptoOptions = [
    { value: 'bitcoin', label: 'Bitcoin (BTC)', icon: '₿' },
    { value: 'ethereum', label: 'Ethereum (ETH)', icon: 'Ξ' },
    { value: 'usdt', label: 'Tether USD (USDT)', icon: '₮' },
    { value: 'usdc', label: 'USD Coin (USDC)', icon: '$' }
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    });
  };

  const calculateCryptoAmount = (crypto: string): string => {
    // Mock exchange rates - in production, these would come from a real API
    const exchangeRates: Record<string, number> = {
      bitcoin: 45000,    // 1 BTC = $45,000
      ethereum: 2500,    // 1 ETH = $2,500
      usdt: 1,          // 1 USDT = $1
      usdc: 1           // 1 USDC = $1
    };

    const rate = exchangeRates[crypto] || 1;
    const cryptoAmount = amount / rate;

    // Format based on crypto type
    if (crypto === 'bitcoin') {
      return cryptoAmount.toFixed(8); // Bitcoin has 8 decimal places
    } else if (crypto === 'ethereum') {
      return cryptoAmount.toFixed(6); // ETH with 6 decimals for readability
    } else {
      return cryptoAmount.toFixed(2); // Stablecoins with 2 decimals
    }
  };

  const handleCryptoSelect = (crypto: string) => {
    setSelectedCrypto(crypto);
    setCryptoDetails(prev => ({
      ...prev,
      cryptocurrency: crypto,
      walletAddress: cryptoWallets[crypto].address
    }));
    setStep('instructions');
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cryptoDetails.transactionHash.trim()) {
      toast.error('Transaction hash is required');
      return;
    }

    if (!cryptoDetails.userWalletAddress.trim()) {
      toast.error('Your wallet address is required');
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
      toast.error('Please upload a transaction proof');
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
        paymentMethod: 'crypto',
        cryptocurrency: cryptoDetails.cryptocurrency,
        walletAddress: cryptoDetails.walletAddress,
        transactionHash: cryptoDetails.transactionHash,
        userWalletAddress: cryptoDetails.userWalletAddress,
        networkFee: cryptoDetails.networkFee || '',
        proofFile: {
          data: base64Data,
          originalName: receiptFile.name
        }
      };

      const response = await fetch('/api/payments/crypto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || 'Failed to submit crypto payment');
        setLoading(false);
        return;
      }

      setStep('success');
      toast.success('Crypto payment submitted successfully!');

      setTimeout(() => {
        onSuccess(result);
      }, 2000);

    } catch (error: any) {
      console.error('Crypto payment error:', error);
      toast.error('Failed to submit crypto payment. Please try again.');
      setLoading(false);
    }
  };

  if (step === 'select') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Select Cryptocurrency
          </CardTitle>
          <div className="text-sm text-gray-600">
            Amount: <span className="font-semibold text-lg">{currency} {amount.toLocaleString()}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {cryptoOptions.map((crypto) => (
              <Button
                key={crypto.value}
                variant="outline"
                onClick={() => handleCryptoSelect(crypto.value)}
                className="flex items-center justify-between p-4 h-auto"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{crypto.icon}</span>
                  <div className="text-left">
                    <p className="font-medium">{crypto.label}</p>
                    <p className="text-sm text-gray-500">
                      ≈ {calculateCryptoAmount(crypto.value)} {crypto.value.toUpperCase()}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Important Notes:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Send exact amount as shown</li>
                  <li>Double-check wallet address before sending</li>
                  <li>Include sufficient network fees</li>
                  <li>Keep transaction proof for upload</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'instructions') {
    const walletInfo = cryptoWallets[selectedCrypto];
    const cryptoOption = cryptoOptions.find(c => c.value === selectedCrypto);
    const cryptoAmount = calculateCryptoAmount(selectedCrypto);

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{cryptoOption?.icon}</span>
            {cryptoOption?.label} Payment
          </CardTitle>
          <div className="text-sm text-gray-600">
            Send: <span className="font-semibold text-lg">{cryptoAmount} {selectedCrypto.toUpperCase()}</span>
            <span className="text-gray-500 ml-2">(≈ {currency} {amount.toLocaleString()})</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Payment Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Wallet Address:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-sm bg-white px-2 py-1 rounded">
                    {walletInfo.address}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(walletInfo.address, 'Wallet address')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-700">Network:</span>
                <span className="font-medium">{walletInfo.network}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-700">Amount:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{cryptoAmount} {selectedCrypto.toUpperCase()}</span>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(cryptoAmount, 'Amount')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-blue-700">Confirmations:</span>
                <span className="font-medium">{walletInfo.minimumConfirmations} required</span>
              </div>
            </div>
          </div>

          <div className="bg-center bg-white border-2 border-gray-200 rounded-lg p-6 text-center">
            <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">QR Code for wallet address</p>
            <div className="font-mono text-sm bg-gray-50 p-2 rounded break-all">
              {walletInfo.address}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Critical Instructions:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Send exactly {cryptoAmount} {selectedCrypto.toUpperCase()}</li>
                  <li>Verify the wallet address before sending</li>
                  <li>Use correct network: {walletInfo.network}</li>
                  <li>Keep transaction hash for verification</li>
                  <li>Processing requires {walletInfo.minimumConfirmations} confirmations</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Warning:</p>
                <p>Cryptocurrency transactions are irreversible. Double-check all details before sending.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setStep('select')}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={() => setStep('details')}
              className="flex-1 bg-gradient-to-r from-primary to-orange-600 text-white"
            >
              I've Sent the Payment
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
            <Coins className="w-5 h-5" />
            Transaction Details
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please provide your transaction information
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-700">
                <p className="font-medium">
                  {cryptoOptions.find(c => c.value === selectedCrypto)?.label}
                </p>
                <p className="text-sm">Amount: {calculateCryptoAmount(selectedCrypto)} {selectedCrypto.toUpperCase()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionHash">Transaction Hash</Label>
              <Input
                id="transactionHash"
                placeholder="0x1234567890abcdef..."
                value={cryptoDetails.transactionHash}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCryptoDetails(prev => ({ ...prev, transactionHash: e.target.value }))
                }
                className="font-mono text-sm"
                required
              />
              <p className="text-sm text-gray-500">
                The transaction ID from your wallet or exchange
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userWalletAddress">Your Wallet Address</Label>
              <Input
                id="userWalletAddress"
                placeholder="Your sending wallet address"
                value={cryptoDetails.userWalletAddress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCryptoDetails(prev => ({ ...prev, userWalletAddress: e.target.value }))
                }
                className="font-mono text-sm"
                required
              />
              <p className="text-sm text-gray-500">
                The wallet address you sent from
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="networkFee">Network Fee (Optional)</Label>
              <Input
                id="networkFee"
                placeholder="0.001"
                value={cryptoDetails.networkFee}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCryptoDetails(prev => ({ ...prev, networkFee: e.target.value }))
                }
                type="number"
                step="0.00000001"
              />
              <p className="text-sm text-gray-500">
                Transaction fee paid (for verification)
              </p>
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
            Upload Transaction Proof
          </CardTitle>
          <p className="text-sm text-gray-600">
            Upload screenshot or proof of your transaction
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-700">
              <p className="font-medium">TX: {cryptoDetails.transactionHash.slice(0, 10)}...</p>
              <p>Crypto: {calculateCryptoAmount(selectedCrypto)} {selectedCrypto.toUpperCase()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof">Transaction Proof</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                id="proof"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="proof" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {receiptFile ? receiptFile.name : 'Click to upload proof'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
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
                  <p className="text-sm">Size: {(receiptFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Blockchain Verification</p>
                <p>Admin will verify the transaction on the blockchain before activating your investment.</p>
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
              {loading ? 'Submitting...' : 'Submit Payment'}
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
            <h3 className="text-lg font-semibold text-green-600">Payment Submitted</h3>
            <p className="text-gray-600">
              Your cryptocurrency payment has been submitted for blockchain verification.
              You'll receive a notification once it's confirmed.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>TX: {cryptoDetails.transactionHash.slice(0, 20)}...</p>
              <p>Amount: {calculateCryptoAmount(selectedCrypto)} {selectedCrypto.toUpperCase()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

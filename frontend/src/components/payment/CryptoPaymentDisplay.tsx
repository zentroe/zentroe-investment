import React from 'react';
import { Wallet, Copy } from 'lucide-react';
import { toast } from 'sonner';
import CryptoQRCode from './CryptoQRCode';

interface CryptoWallet {
  _id: string;
  name: string;
  address: string;
  network?: string;
  icon: string;
  active: boolean;
}

interface CryptoPaymentDisplayProps {
  cryptoWallets: CryptoWallet[];
  selectedWallet: CryptoWallet | null;
  onWalletChange: (wallet: CryptoWallet) => void;
  amount: number;
  transactionScreenshot: string;
  onScreenshotUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingScreenshot: boolean;
}

const CryptoPaymentDisplay: React.FC<CryptoPaymentDisplayProps> = ({
  cryptoWallets,
  selectedWallet,
  onWalletChange,
  amount,
  transactionScreenshot,
  onScreenshotUpload,
  uploadingScreenshot,
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!selectedWallet) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <p className="text-gray-500 text-center">No cryptocurrency wallet available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Wallet className="h-5 w-5 mr-2" />
        Cryptocurrency Payment
      </h3>

      {/* Wallet Selection */}
      {cryptoWallets.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Wallet
          </label>
          <select
            value={selectedWallet._id}
            onChange={(e) => {
              const wallet = cryptoWallets.find(w => w._id === e.target.value);
              if (wallet) onWalletChange(wallet);
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {cryptoWallets.map(wallet => (
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
            <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono break-all">
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
              onChange={onScreenshotUpload}
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

          <div className="text-sm text-gray-600">
            • Supported formats: JPG, PNG, GIF
            • Maximum file size: 5MB
            • Make sure transaction details are clearly visible
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoPaymentDisplay;

import React from 'react';
import { Building2, Copy } from 'lucide-react';
import { toast } from 'sonner';

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

interface BankTransferDisplayProps {
  bankAccounts: BankAccount[];
  selectedBankAccount: BankAccount | null;
  onBankAccountChange: (account: BankAccount) => void;
  amount: number;
  paymentReferenceId?: string; // User's unique payment reference
  transactionScreenshot?: string;
  onScreenshotUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingScreenshot?: boolean;
}

const BankTransferDisplay: React.FC<BankTransferDisplayProps> = ({
  bankAccounts,
  selectedBankAccount,
  onBankAccountChange,
  amount,
  paymentReferenceId,
  transactionScreenshot,
  onScreenshotUpload,
  uploadingScreenshot = false,
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!selectedBankAccount) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <p className="text-gray-500 text-center">No bank account available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Building2 className="h-5 w-5 mr-2" />
        Bank Transfer Payment
      </h3>

      {/* Bank Account Selection */}
      {bankAccounts.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Bank Account
          </label>
          <select
            value={selectedBankAccount._id}
            onChange={(e) => {
              const account = bankAccounts.find(acc => acc._id === e.target.value);
              if (account) onBankAccountChange(account);
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {bankAccounts.map(account => (
              <option key={account._id} value={account._id}>
                {account.bankName} - {account.accountName}
                {account.currency ? ` (${account.currency})` : ''}
                {account.country ? ` - ${account.country}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bank Account Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium mb-3">{selectedBankAccount.bankName}</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Name - Always shown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono">
                {selectedBankAccount.accountName}
              </code>
              <button
                onClick={() => copyToClipboard(selectedBankAccount.accountName)}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Copy account name"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Account Number - Always shown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono">
                {selectedBankAccount.accountNumber}
              </code>
              <button
                onClick={() => copyToClipboard(selectedBankAccount.accountNumber)}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Copy account number"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Routing Number - Show if available */}
          {selectedBankAccount.routingNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Routing Number
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono">
                  {selectedBankAccount.routingNumber}
                </code>
                <button
                  onClick={() => copyToClipboard(selectedBankAccount.routingNumber!)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Copy routing number"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* SWIFT Code - Show if available */}
          {selectedBankAccount.swiftCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SWIFT Code
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono">
                  {selectedBankAccount.swiftCode}
                </code>
                <button
                  onClick={() => copyToClipboard(selectedBankAccount.swiftCode!)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Copy SWIFT code"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* IBAN - Show if available */}
          {selectedBankAccount.iban && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IBAN
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono">
                  {selectedBankAccount.iban}
                </code>
                <button
                  onClick={() => copyToClipboard(selectedBankAccount.iban!)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Copy IBAN"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Bank Address - Show if available */}
          {selectedBankAccount.bankAddress && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Address
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono">
                  {selectedBankAccount.bankAddress}
                </code>
                <button
                  onClick={() => copyToClipboard(selectedBankAccount.bankAddress!)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Copy bank address"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Business Address - Show if available */}
          {selectedBankAccount.businessAddress && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business/Home Address
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono">
                  {selectedBankAccount.businessAddress}
                </code>
                <button
                  onClick={() => copyToClipboard(selectedBankAccount.businessAddress!)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Copy business address"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Country:</span>
            <span className="font-medium">
              {selectedBankAccount.country || 'Not specified'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Currency:</span>
            <span className="font-medium">
              {selectedBankAccount.currency || 'Not specified'}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-green-800 mb-2">Wire Transfer Instructions</h4>
        <ol className="text-sm text-green-700 space-y-1">
          <li>1. Initiate a wire transfer for <strong>${amount.toLocaleString()}</strong></li>
          <li>2. Use the bank details provided above</li>
          {paymentReferenceId && (
            <li>3. <strong className="text-red-600">IMPORTANT:</strong> Include your reference ID in the transfer description</li>
          )}
          <li>{paymentReferenceId ? '4' : '3'}. Save your transfer receipt for verification</li>
          <li>{paymentReferenceId ? '5' : '4'}. Upload proof of transfer below</li>
          <li>{paymentReferenceId ? '6' : '5'}. Processing time: 1-3 business days</li>
        </ol>
      </div>

      {/* Upload Payment Proof */}
      {onScreenshotUpload && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Payment Proof *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={onScreenshotUpload}
            disabled={uploadingScreenshot}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload a screenshot or photo of your bank transfer receipt
          </p>
          {transactionScreenshot && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Preview:</p>
              <img
                src={transactionScreenshot}
                alt="Payment proof"
                className="max-h-48 rounded border border-gray-300 shadow-sm"
              />
            </div>
          )}
        </div>
      )}

      {/* Payment Reference ID - Minimalistic */}
      {paymentReferenceId ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Payment Reference ID
              </p>
              <code className="text-lg font-semibold text-gray-900 font-mono tracking-wide">
                {paymentReferenceId}
              </code>
            </div>
            <button
              onClick={() => copyToClipboard(paymentReferenceId)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
              title="Copy reference ID"
            >
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Include this reference ID in the description/memo field of your bank transfer.
          </p>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            <strong>Note:</strong> Please include your registered email address (<strong>{/* We'll need to pass user email */}</strong>)
            in the bank transfer description to help us identify your payment. Our team will match it manually.
          </p>
        </div>
      )}
    </div>
  );
};

export default BankTransferDisplay;

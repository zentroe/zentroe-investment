import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  ToggleLeft,
  ToggleRight,
  Wallet,
  Building,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { getPaymentConfig, updatePaymentConfig } from '@/services/adminService';

interface PaymentConfig {
  _id?: string;
  cryptoEnabled: boolean;
  bankTransferEnabled: boolean;
  cardPaymentEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const AdminPaymentConfiguration: React.FC = () => {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPaymentConfig();
  }, []);

  const fetchPaymentConfig = async () => {
    try {
      setLoading(true);
      const response = await getPaymentConfig();
      console.log('Payment config response:', response);

      // Handle the response structure { config: {...} }
      const configData = response.config || response.data || response;
      console.log('Extracted config data:', configData);

      setConfig(configData);
    } catch (error) {
      console.error('Failed to fetch payment config:', error);
      setMessage({ type: 'error', text: 'Failed to load payment configuration. Please refresh the page.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);

      // Try to use actual API call
      try {
        const response = await updatePaymentConfig({
          cryptoEnabled: config.cryptoEnabled,
          bankTransferEnabled: config.bankTransferEnabled,
          cardPaymentEnabled: config.cardPaymentEnabled
        });
        console.log('Update payment config response:', response);

        // Refresh the configuration after successful update
        await fetchPaymentConfig();

      } catch (apiError) {
        console.error('API error during update:', apiError);
        throw apiError; // Re-throw to trigger error handling
      }

      setMessage({ type: 'success', text: 'Payment configuration updated successfully!' });
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update payment config:', error);
      setMessage({ type: 'error', text: 'Failed to update payment configuration. Please try again.' });
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const updateConfig = (updates: Partial<PaymentConfig>) => {
    if (config) {
      setConfig({ ...config, ...updates });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Configuration</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure payment methods, limits, and fees for the platform
          </p>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
          <div className="flex">
            <AlertCircle className={`h-5 w-5 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`} />
            <div className="ml-3">
              <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Payment Methods
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Enable or disable payment methods for the platform
          </p>
        </div>
        <div className="p-6 space-y-6">
          {/* Cryptocurrency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Wallet className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Cryptocurrency</h3>
                <p className="text-sm text-gray-500">Bitcoin, Ethereum, and other digital currencies</p>
              </div>
            </div>
            <button
              onClick={() => updateConfig({ cryptoEnabled: !config.cryptoEnabled })}
              className="flex items-center"
            >
              {config.cryptoEnabled ? (
                <ToggleRight className="h-8 w-8 text-green-500" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-gray-400" />
              )}
            </button>
          </div>

          {/* Bank Transfer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Bank Transfer</h3>
                <p className="text-sm text-gray-500">Direct bank transfers and wire transfers</p>
              </div>
            </div>
            <button
              onClick={() => updateConfig({ bankTransferEnabled: !config.bankTransferEnabled })}
              className="flex items-center"
            >
              {config.bankTransferEnabled ? (
                <ToggleRight className="h-8 w-8 text-green-500" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-gray-400" />
              )}
            </button>
          </div>

          {/* Card Payment */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Card Payment</h3>
                <p className="text-sm text-gray-500">Credit and debit card payments</p>
              </div>
            </div>
            <button
              onClick={() => updateConfig({ cardPaymentEnabled: !config.cardPaymentEnabled })}
              className="flex items-center"
            >
              {config.cardPaymentEnabled ? (
                <ToggleRight className="h-8 w-8 text-green-500" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminPaymentConfiguration;

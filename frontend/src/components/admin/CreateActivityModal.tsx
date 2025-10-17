import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { createActivity } from '@/services/adminUserService';
import { toast } from 'sonner';

interface CreateActivityModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  userId,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    activityType: 'deposit' as string,
    date: new Date().toISOString().slice(0, 16),
    description: '',
    amount: 0,
    currency: 'USD',
    transactionId: '',
    status: 'completed' as string,
    paymentMethod: '',
    investmentPlanName: '',
    portfolioType: '',
    referredUserName: '',
    referralBonus: 0,
    returnPercentage: 0,
    principalAmount: 0,
    kycStatus: '',
    ipAddress: '',
    device: '',
    location: '',
    notes: ''
  });
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    try {
      // Validate required fields
      if (!formData.description) {
        toast.error('Description is required');
        return;
      }

      setCreating(true);

      // Build activity data based on type
      const activityData: any = {
        activityType: formData.activityType,
        date: formData.date,
        description: formData.description,
        status: formData.status,
        notes: formData.notes || undefined
      };

      // Add amount if applicable
      if (formData.amount) {
        activityData.amount = formData.amount;
        activityData.currency = formData.currency;
      }

      // Add transaction ID if provided
      if (formData.transactionId) {
        activityData.transactionId = formData.transactionId;
      }

      // Add type-specific fields
      if (formData.activityType === 'deposit' || formData.activityType === 'withdrawal') {
        if (formData.paymentMethod) activityData.paymentMethod = formData.paymentMethod;
      }

      if (formData.activityType === 'investment' || formData.activityType === 'portfolio_change') {
        if (formData.investmentPlanName) activityData.investmentPlanName = formData.investmentPlanName;
        if (formData.portfolioType) activityData.portfolioType = formData.portfolioType;
      }

      if (formData.activityType === 'referral') {
        if (formData.referredUserName) activityData.referredUserName = formData.referredUserName;
        if (formData.referralBonus) activityData.referralBonus = formData.referralBonus;
      }

      if (formData.activityType === 'return' || formData.activityType === 'dividend') {
        if (formData.returnPercentage) activityData.returnPercentage = formData.returnPercentage;
        if (formData.principalAmount) activityData.principalAmount = formData.principalAmount;
      }

      if (formData.activityType === 'kyc_update') {
        if (formData.kycStatus) activityData.kycStatus = formData.kycStatus;
      }

      if (formData.activityType === 'login') {
        if (formData.ipAddress) activityData.ipAddress = formData.ipAddress;
        if (formData.device) activityData.device = formData.device;
        if (formData.location) activityData.location = formData.location;
      }

      await createActivity(userId, activityData);
      toast.success('Activity created successfully!');
      onSuccess();
      resetForm();
    } catch (error: any) {
      console.error('Failed to create activity:', error);
      toast.error(error.response?.data?.message || 'Failed to create activity');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      activityType: 'deposit',
      date: new Date().toISOString().slice(0, 16),
      description: '',
      amount: 0,
      currency: 'USD',
      transactionId: '',
      status: 'completed',
      paymentMethod: '',
      investmentPlanName: '',
      portfolioType: '',
      referredUserName: '',
      referralBonus: 0,
      returnPercentage: 0,
      principalAmount: 0,
      kycStatus: '',
      ipAddress: '',
      device: '',
      location: '',
      notes: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Create New Activity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type *</label>
              <select
                value={formData.activityType}
                onChange={(e) => handleChange('activityType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="investment">Investment</option>
                <option value="return">Return</option>
                <option value="dividend">Dividend</option>
                <option value="referral">Referral</option>
                <option value="kyc_update">KYC Update</option>
                <option value="login">Login</option>
                <option value="portfolio_change">Portfolio Change</option>
                <option value="bonus">Bonus</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter activity description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
              <input
                type="text"
                value={formData.transactionId}
                onChange={(e) => handleChange('transactionId', e.target.value)}
                placeholder="Optional transaction ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Conditional Fields Based on Type */}
          {(formData.activityType === 'deposit' || formData.activityType === 'withdrawal') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Method</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="card">Card</option>
              </select>
            </div>
          )}

          {(formData.activityType === 'investment' || formData.activityType === 'portfolio_change') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investment Plan</label>
                <input
                  type="text"
                  value={formData.investmentPlanName}
                  onChange={(e) => handleChange('investmentPlanName', e.target.value)}
                  placeholder="e.g., Venture Capital Fund"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Type</label>
                <input
                  type="text"
                  value={formData.portfolioType}
                  onChange={(e) => handleChange('portfolioType', e.target.value)}
                  placeholder="e.g., High Growth"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {formData.activityType === 'referral' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referred User Name</label>
                <input
                  type="text"
                  value={formData.referredUserName}
                  onChange={(e) => handleChange('referredUserName', e.target.value)}
                  placeholder="Name of referred user..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referral Bonus</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.referralBonus}
                  onChange={(e) => handleChange('referralBonus', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {(formData.activityType === 'return' || formData.activityType === 'dividend') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Percentage</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.returnPercentage}
                  onChange={(e) => handleChange('returnPercentage', parseFloat(e.target.value))}
                  placeholder="e.g., 5.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Principal Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.principalAmount}
                  onChange={(e) => handleChange('principalAmount', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {formData.activityType === 'kyc_update' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">KYC Status</label>
              <select
                value={formData.kycStatus}
                onChange={(e) => handleChange('kycStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}

          {formData.activityType === 'login' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => handleChange('ipAddress', e.target.value)}
                  placeholder="e.g., 192.168.1.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device</label>
                <input
                  type="text"
                  value={formData.device}
                  onChange={(e) => handleChange('device', e.target.value)}
                  placeholder="e.g., iPhone 14"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g., New York, USA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={creating}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !formData.description}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Activity
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateActivityModal;

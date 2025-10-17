import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Activity, updateActivity } from '@/services/adminUserService';
import { toast } from 'sonner';

interface EditActivityModalProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditActivityModal: React.FC<EditActivityModalProps> = ({
  activity,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Partial<Activity>>({
    activityType: activity.activityType,
    date: activity.date,
    description: activity.description,
    amount: activity.amount,
    currency: activity.currency || 'USD',
    transactionId: activity.transactionId,
    status: activity.status,
    paymentMethod: activity.paymentMethod,
    investmentPlanName: activity.investmentPlanName,
    portfolioType: activity.portfolioType,
    referredUserName: activity.referredUserName,
    referredUserEmail: activity.referredUserEmail,
    referralBonus: activity.referralBonus,
    returnPercentage: activity.returnPercentage,
    principalAmount: activity.principalAmount,
    kycStatus: activity.kycStatus,
    ipAddress: activity.ipAddress,
    device: activity.device,
    location: activity.location,
    notes: activity.notes
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof Activity, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateActivity(activity._id, formData);
      toast.success('Activity updated successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Failed to update activity:', error);
      toast.error(error.response?.data?.message || 'Failed to update activity');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Edit Activity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount || ''}
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
                value={formData.transactionId || ''}
                onChange={(e) => handleChange('transactionId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
                value={formData.paymentMethod || ''}
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
                  value={formData.investmentPlanName || ''}
                  onChange={(e) => handleChange('investmentPlanName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Type</label>
                <input
                  type="text"
                  value={formData.portfolioType || ''}
                  onChange={(e) => handleChange('portfolioType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {formData.activityType === 'referral' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referred User Name</label>
                  <input
                    type="text"
                    value={formData.referredUserName || ''}
                    onChange={(e) => handleChange('referredUserName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referred User Email</label>
                  <input
                    type="email"
                    value={formData.referredUserEmail || ''}
                    onChange={(e) => handleChange('referredUserEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referral Bonus</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.referralBonus || ''}
                  onChange={(e) => handleChange('referralBonus', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          {(formData.activityType === 'return' || formData.activityType === 'dividend') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Percentage</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.returnPercentage || ''}
                  onChange={(e) => handleChange('returnPercentage', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Principal Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.principalAmount || ''}
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
                value={formData.kycStatus || ''}
                onChange={(e) => handleChange('kycStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
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
                  value={formData.ipAddress || ''}
                  onChange={(e) => handleChange('ipAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device</label>
                <input
                  type="text"
                  value={formData.device || ''}
                  onChange={(e) => handleChange('device', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes || ''}
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
            disabled={saving}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditActivityModal;

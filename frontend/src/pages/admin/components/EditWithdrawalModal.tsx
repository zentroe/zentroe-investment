import React, { useState } from 'react';
import { X, Save, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Withdrawal } from '@/services/withdrawalService';
import { formatCurrency } from '../../../utils/formatters';

interface EditWithdrawalModalProps {
  withdrawal: Withdrawal;
  onClose: () => void;
  onSave: (data: { amount?: number; requestedAt?: string }) => void;
  onDelete: () => void;
}

const EditWithdrawalModal: React.FC<EditWithdrawalModalProps> = ({
  withdrawal,
  onClose,
  onSave,
  onDelete
}) => {
  const [amount, setAmount] = useState(withdrawal.amount.toString());
  const [requestedAt, setRequestedAt] = useState(
    new Date(withdrawal.requestedAt).toISOString().slice(0, 16)
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    const updates: { amount?: number; requestedAt?: string } = {};

    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && numericAmount !== withdrawal.amount) {
      updates.amount = numericAmount;
    }

    const newDate = new Date(requestedAt).toISOString();
    const oldDate = new Date(withdrawal.requestedAt).toISOString();
    if (newDate !== oldDate) {
      updates.requestedAt = newDate;
    }

    if (Object.keys(updates).length === 0) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      await onSave(updates);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Edit Withdrawal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Withdrawal Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">User:</span>
              <span className="text-sm font-medium">
                {withdrawal.user ? `${withdrawal.user.firstName} ${withdrawal.user.lastName}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className="text-sm font-medium capitalize">{withdrawal.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Payment Method:</span>
              <span className="text-sm font-medium capitalize">
                {withdrawal.paymentMethod.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Amount Field */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              placeholder="Enter amount"
              step="0.01"
              min="0"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Original amount: {formatCurrency(withdrawal.amount)}
            </p>
          </div>

          {/* Date and Time Field */}
          <div>
            <label htmlFor="requestedAt" className="block text-sm font-medium text-gray-700 mb-2">
              Requested Date & Time *
            </label>
            <Input
              id="requestedAt"
              type="datetime-local"
              value={requestedAt}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequestedAt(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Original date: {new Date(withdrawal.requestedAt).toLocaleString()}
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Changing the amount will recalculate fees and net amount</li>
                <li>Changing the date may affect processing timelines</li>
                <li>Changes are permanent and will be logged</li>
              </ul>
            </div>
          </div>

          {/* Delete Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Danger Zone</h3>
            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                <Trash2 className="w-4 h-4" />
                Delete Withdrawal
              </Button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 mb-1">
                      Are you absolutely sure?
                    </p>
                    <p className="text-sm text-red-700">
                      This action cannot be undone. This will permanently delete the withdrawal
                      request and remove all associated data.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete Withdrawal'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving || deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || deleting}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EditWithdrawalModal;

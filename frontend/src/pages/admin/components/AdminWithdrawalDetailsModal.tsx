import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Withdrawal } from '@/services/withdrawalService';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import {
  X,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  CreditCard,
  Wallet,
  Mail,
  User,
  Calendar,
  Truck,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface AdminWithdrawalDetailsModalProps {
  withdrawal: Withdrawal;
  onClose: () => void;
  onAction: (
    action: 'approve' | 'reject' | 'process',
    transactionId?: string,
    notes?: string,
    rejectionReason?: string
  ) => void;
}

const AdminWithdrawalDetailsModal: React.FC<AdminWithdrawalDetailsModalProps> = ({
  withdrawal,
  onClose,
  onAction
}) => {
  const [showActionForm, setShowActionForm] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'process'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'processing':
        return <Truck className="w-5 h-5 text-orange-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'crypto':
        return <Wallet className="w-5 h-5 text-orange-600" />;
      case 'check':
        return <Mail className="w-5 h-5 text-green-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'crypto':
        return 'Cryptocurrency';
      case 'check':
        return 'Physical Check';
      default:
        return method;
    }
  };

  const formatWithdrawalType = (type: string) => {
    switch (type) {
      case 'profits_only':
        return 'Profits Only';
      case 'full_withdrawal':
        return 'Full Withdrawal';
      case 'partial_principal':
        return 'Custom Amount';
      default:
        return type;
    }
  };

  const canTakeAction = () => {
    return withdrawal.status === 'pending' || withdrawal.status === 'approved';
  };

  const getAvailableActions = () => {
    if (withdrawal.status === 'pending') {
      return ['approve', 'reject'];
    } else if (withdrawal.status === 'approved') {
      return ['process'];
    }
    return [];
  };

  const handleAction = () => {
    if (actionType === 'approve') {
      onAction('approve', undefined, adminNotes);
    } else if (actionType === 'reject') {
      if (!rejectionReason.trim()) {
        alert('Please provide a rejection reason');
        return;
      }
      onAction('reject', undefined, adminNotes, rejectionReason);
    } else if (actionType === 'process') {
      if (!transactionId.trim()) {
        alert('Please provide a transaction ID');
        return;
      }
      onAction('process', transactionId, adminNotes);
    }
  };

  const renderActionForm = () => {
    if (!showActionForm) return null;

    return (
      <div className="border-t mt-6 pt-6">
        <h3 className="font-semibold mb-4">Take Action</h3>

        {/* Action Selection */}
        <div className="mb-4">
          <Label className="block mb-2">Action</Label>
          <div className="flex gap-2">
            {getAvailableActions().map(action => (
              <label key={action} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="actionType"
                  value={action}
                  checked={actionType === action}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionType(e.target.value as any)}
                />
                <div className="flex items-center gap-2">
                  {action === 'approve' && <ThumbsUp className="w-4 h-4 text-green-600" />}
                  {action === 'reject' && <ThumbsDown className="w-4 h-4 text-red-600" />}
                  {action === 'process' && <Truck className="w-4 h-4 text-orange-600" />}
                  <span className="capitalize">{action}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Transaction ID for processing */}
        {actionType === 'process' && (
          <div className="mb-4">
            <Label htmlFor="transactionId" className="block mb-2">Transaction ID *</Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTransactionId(e.target.value)}
              placeholder="Enter the external transaction ID"
              required
            />
            <div className="text-sm text-gray-600 mt-1">
              This should be the transaction ID from your payment processor or bank.
            </div>
          </div>
        )}

        {/* Rejection reason */}
        {actionType === 'reject' && (
          <div className="mb-4">
            <Label htmlFor="rejectionReason" className="block mb-2">Rejection Reason *</Label>
            <textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
              placeholder="Explain why this withdrawal is being rejected..."
              className="w-full p-3 border rounded-md h-24 resize-none"
              required
            />
          </div>
        )}

        {/* Admin Notes */}
        <div className="mb-4">
          <Label htmlFor="adminNotes" className="block mb-2">
            Admin Notes {actionType !== 'reject' ? '(Optional)' : ''}
          </Label>
          <textarea
            id="adminNotes"
            value={adminNotes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)}
            placeholder="Add any additional notes about this decision..."
            className="w-full p-3 border rounded-md h-24 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowActionForm(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            className={`flex-1 ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-orange-600 hover:bg-orange-700'
              }`}
          >
            {actionType === 'approve' ? 'Approve Withdrawal' :
              actionType === 'reject' ? 'Reject Withdrawal' :
                'Process Withdrawal'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Admin: Withdrawal Details</h2>
              <p className="text-gray-600">Request ID: {withdrawal._id}</p>
            </div>
            <Button variant="outline" onClick={onClose} className="p-2">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Status and Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Request Status</h3>
                <div className="flex items-center gap-2 mb-3">
                  {getStatusIcon(withdrawal.status)}
                  <Badge className={getStatusColor(withdrawal.status)}>
                    {withdrawal.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Requested: {formatDate(withdrawal.requestedAt)}</span>
                  </div>
                  {withdrawal.reviewedAt && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Reviewed: {formatDate(withdrawal.reviewedAt)}</span>
                    </div>
                  )}
                  {withdrawal.processedAt && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                      <span>Processed: {formatDate(withdrawal.processedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Financial Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Withdrawal Amount:</span>
                    <span className="font-medium">{formatCurrency(withdrawal.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee:</span>
                    <span className="font-medium">{formatCurrency(withdrawal.fees)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Net Amount:</span>
                    <span className="text-green-600">{formatCurrency(withdrawal.netAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Information */}
            <div>
              <h3 className="font-semibold mb-3">User Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <div className="font-medium">
                      {withdrawal.user ? `${withdrawal.user.firstName || ''} ${withdrawal.user.lastName || ''}`.trim() || 'N/A' : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <div className="font-medium">{withdrawal.user?.email || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount Breakdown */}
            <div>
              <h3 className="font-semibold mb-3">Amount Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-700">Principal Amount</div>
                  <div className="text-xl font-bold text-blue-900">
                    {formatCurrency(withdrawal.principalAmount)}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-700">Profit Amount</div>
                  <div className="text-xl font-bold text-green-900">
                    {formatCurrency(withdrawal.profitAmount)}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-700">Withdrawal Type</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatWithdrawalType(withdrawal.type)}
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Details */}
            <div>
              <h3 className="font-semibold mb-3">Investment Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Investment Amount:</span>
                    <div className="font-medium">{formatCurrency(withdrawal.userInvestment.amount)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Investment Status:</span>
                    <div className="font-medium capitalize">{withdrawal.userInvestment.status}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Start Date:</span>
                    <div className="font-medium">{formatDate(withdrawal.userInvestment.startDate)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">End Date:</span>
                    <div className="font-medium">{formatDate(withdrawal.userInvestment.endDate)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Details */}
            <div>
              <h3 className="font-semibold mb-3">Payment Method</h3>
              <div className="flex items-center gap-2 mb-3">
                {getPaymentMethodIcon(withdrawal.paymentMethod)}
                <span className="font-medium">{formatPaymentMethod(withdrawal.paymentMethod)}</span>
              </div>

              {withdrawal.paymentDetails && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {withdrawal.paymentMethod === 'bank_transfer' && withdrawal.paymentDetails.bankDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Account Name:</span>
                        <div className="font-medium">{withdrawal.paymentDetails.bankDetails.accountName}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Bank Name:</span>
                        <div className="font-medium">{withdrawal.paymentDetails.bankDetails.bankName}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Account Number:</span>
                        <div className="font-medium">****{withdrawal.paymentDetails.bankDetails.accountNumber.slice(-4)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Routing Number:</span>
                        <div className="font-medium">{withdrawal.paymentDetails.bankDetails.routingNumber}</div>
                      </div>
                      {withdrawal.paymentDetails.bankDetails.swiftCode && (
                        <div>
                          <span className="text-gray-600">SWIFT Code:</span>
                          <div className="font-medium">{withdrawal.paymentDetails.bankDetails.swiftCode}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {withdrawal.paymentMethod === 'crypto' && withdrawal.paymentDetails.cryptoDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Network:</span>
                        <div className="font-medium capitalize">{withdrawal.paymentDetails.cryptoDetails.network}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Currency:</span>
                        <div className="font-medium">{withdrawal.paymentDetails.cryptoDetails.currency}</div>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Wallet Address:</span>
                        <div className="font-medium break-all">{withdrawal.paymentDetails.cryptoDetails.walletAddress}</div>
                      </div>
                    </div>
                  )}

                  {withdrawal.paymentMethod === 'check' && withdrawal.paymentDetails.checkDetails && (
                    <div className="text-sm">
                      <span className="text-gray-600">Mailing Address:</span>
                      <div className="font-medium mt-1">
                        {withdrawal.paymentDetails.checkDetails.mailingAddress.street}<br />
                        {withdrawal.paymentDetails.checkDetails.mailingAddress.city}, {withdrawal.paymentDetails.checkDetails.mailingAddress.state} {withdrawal.paymentDetails.checkDetails.mailingAddress.zipCode}<br />
                        {withdrawal.paymentDetails.checkDetails.mailingAddress.country}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Reason */}
            {withdrawal.reason && (
              <div>
                <h3 className="font-semibold mb-3">User's Reason</h3>
                <div className="bg-blue-50 p-4 rounded-lg text-sm">
                  {withdrawal.reason}
                </div>
              </div>
            )}

            {/* Existing Admin Notes */}
            {(withdrawal.adminNotes || withdrawal.rejectionReason) && (
              <div>
                <h3 className="font-semibold mb-3">Admin Notes</h3>
                <div className="space-y-2">
                  {withdrawal.adminNotes && (
                    <div className="bg-blue-50 p-4 rounded-lg text-sm">
                      <div className="font-medium text-blue-900 mb-1">Notes:</div>
                      <div className="text-blue-800">{withdrawal.adminNotes}</div>
                    </div>
                  )}
                  {withdrawal.rejectionReason && (
                    <div className="bg-red-50 p-4 rounded-lg text-sm">
                      <div className="font-medium text-red-900 mb-1">Rejection Reason:</div>
                      <div className="text-red-800">{withdrawal.rejectionReason}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transaction ID */}
            {withdrawal.transactionId && (
              <div>
                <h3 className="font-semibold mb-3">Transaction Information</h3>
                <div className="bg-green-50 p-4 rounded-lg text-sm">
                  <div className="font-medium text-green-900 mb-1">Transaction ID:</div>
                  <div className="text-green-800 break-all">{withdrawal.transactionId}</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {canTakeAction() && !showActionForm && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowActionForm(true)}
                  className="px-8 py-3"
                >
                  Take Action
                </Button>
              </div>
            )}

            {/* Action Form */}
            {renderActionForm()}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminWithdrawalDetailsModal;
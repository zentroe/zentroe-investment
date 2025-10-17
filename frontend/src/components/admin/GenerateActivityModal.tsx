import React, { useState } from 'react';
import { X, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { generateUserActivity } from '@/services/adminUserService';
import { toast } from 'sonner';

interface GenerateActivityModalProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GenerateActivityModal: React.FC<GenerateActivityModalProps> = ({
  userId,
  userName,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedYears, setSelectedYears] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setSummary(null);

      const response = await generateUserActivity(userId, selectedYears);

      toast.success(`Generated ${response.activitiesGenerated} activities successfully!`);
      setSummary(response.summary);

      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 3000);
    } catch (error: any) {
      console.error('Failed to generate activity:', error);
      toast.error(error.response?.data?.message || 'Failed to generate activity');
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    setSummary(null);
    setSelectedYears(2);
    onClose();
  };

  const yearOptions = [
    { value: 1, label: '1 Year', description: 'Recent activity for new accounts' },
    { value: 2, label: '2 Years', description: 'Moderate history for active accounts' },
    { value: 3, label: '3 Years', description: 'Established account with solid history' },
    { value: 4, label: '4 Years', description: 'Mature account with extensive history' },
    { value: 5, label: '5 Years', description: 'Long-term investor with full history' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6 overflow-auto">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Generate Activity History</h2>
              <p className="text-sm text-gray-500">{userName}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!summary ? (
            <>
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">This will generate realistic activity history including:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Deposits and withdrawals</li>
                      <li>Investment transactions</li>
                      <li>Monthly returns and dividends</li>
                      <li>Referral bonuses</li>
                      <li>Login history</li>
                      <li>KYC milestones</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Year Selection */}
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Select Activity Duration
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {yearOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedYears(option.value)}
                      disabled={generating}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${selectedYears === option.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 bg-white'
                        } ${generating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                        {selectedYears === option.value && (
                          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-2 text-sm text-yellow-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>
                    <strong>Note:</strong> This will create a large amount of historical data.
                    You can edit or delete individual activities later if needed.
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Generation Summary */
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity Generated Successfully!</h3>
                <p className="text-sm text-gray-600">The user's activity history has been created.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Deposits:</span>
                  <span className="font-semibold text-gray-900">{summary.totalDeposits} transactions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Investments:</span>
                  <span className="font-semibold text-gray-900">{summary.totalInvestments} transactions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Returns:</span>
                  <span className="font-semibold text-gray-900">{summary.totalReturns} transactions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Withdrawals:</span>
                  <span className="font-semibold text-gray-900">{summary.totalWithdrawals} transactions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Referrals:</span>
                  <span className="font-semibold text-gray-900">{summary.totalReferrals} referrals</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Logins:</span>
                  <span className="font-semibold text-gray-900">{summary.totalLogins} logins</span>
                </div>
                <div className="border-t border-gray-300 my-2"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Deposited:</span>
                  <span className="font-semibold text-green-600">${summary.totalAmountDeposited}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Invested:</span>
                  <span className="font-semibold text-blue-600">${summary.totalAmountInvested}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Returns Earned:</span>
                  <span className="font-semibold text-purple-600">${summary.totalReturnsEarned}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Withdrawn:</span>
                  <span className="font-semibold text-orange-600">${summary.totalAmountWithdrawn}</span>
                </div>
                <div className="border-t border-gray-300 my-2"></div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-900 font-semibold">Net Balance:</span>
                  <span className="font-bold text-gray-900">${summary.netBalance}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!summary && (
          <div className="flex items-center justify-end gap-3 p-6 border-t">
            <button
              onClick={handleClose}
              disabled={generating}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Activity
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateActivityModal;

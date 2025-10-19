import React, { useState } from 'react';
import { X, Sparkles, Loader2, AlertCircle, Check } from 'lucide-react';
import { generateUserActivity } from '@/services/adminUserService';
import { toast } from 'sonner';

interface GenerateActivityModalProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ActivityConfig {
  deposits: { enabled: boolean; count: number; minAmount: number; maxAmount: number };
  investments: { enabled: boolean; count: number };
  withdrawals: { enabled: boolean; count: number };
  returns: { enabled: boolean; count: number };
  referrals: { enabled: boolean; targetTier: string };
  logins: { enabled: boolean; count: number };
  kycUpdates: { enabled: boolean };
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

  const [activityConfig, setActivityConfig] = useState<ActivityConfig>({
    deposits: { enabled: true, count: 6, minAmount: 1000, maxAmount: 50000 },
    investments: { enabled: true, count: 5 },
    withdrawals: { enabled: true, count: 3 },
    returns: { enabled: true, count: 0 },
    referrals: { enabled: true, targetTier: 'silver' },
    logins: { enabled: true, count: 60 },
    kycUpdates: { enabled: true }
  });

  if (!isOpen) return null;

  const toggleAllActivities = (enabled: boolean) => {
    setActivityConfig({
      deposits: { ...activityConfig.deposits, enabled },
      investments: { ...activityConfig.investments, enabled },
      withdrawals: { ...activityConfig.withdrawals, enabled },
      returns: { ...activityConfig.returns, enabled },
      referrals: { ...activityConfig.referrals, enabled },
      logins: { ...activityConfig.logins, enabled },
      kycUpdates: { ...activityConfig.kycUpdates, enabled }
    });
  };

  const allEnabled = Object.values(activityConfig).every(config =>
    typeof config === 'object' && 'enabled' in config ? config.enabled : true
  );

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setSummary(null);

      const response = await generateUserActivity(userId, selectedYears, activityConfig);

      toast.success(`Generated activities successfully!`);
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
    onClose();
  };

  const tierOptions = [
    { value: 'bronze', label: 'Bronze', points: '0-99 pts', color: 'text-orange-700' },
    { value: 'silver', label: 'Silver', points: '100-499 pts', color: 'text-gray-600' },
    { value: 'gold', label: 'Gold', points: '500-1,999 pts', color: 'text-yellow-600' },
    { value: 'platinum', label: 'Platinum', points: '2K-9.9K pts', color: 'text-blue-600' },
    { value: 'diamond', label: 'Diamond', points: '10K-49.9K pts', color: 'text-purple-600' },
    { value: 'shareholder', label: 'Shareholder', points: '50K+ pts', color: 'text-green-600' }
  ];

  const yearOptions = [
    { value: 1, label: '1 Year' },
    { value: 2, label: '2 Years' },
    { value: 3, label: '3 Years' },
    { value: 4, label: '4 Years' },
    { value: 5, label: '5 Years' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6 overflow-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b z-10">
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
                    <p className="font-medium mb-1">Customize activity generation:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Select specific activity types to generate</li>
                      <li>New activities will be added to existing ones (incremental)</li>
                      <li>Customize amounts, counts, and referral targets</li>
                      <li>Withdrawals will use existing deposits as source</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Time Period Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Time Period
                </label>
                <div className="flex gap-2">
                  {yearOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedYears(option.value)}
                      disabled={generating}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedYears === option.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } ${generating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select All / Deselect All */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={allEnabled}
                    onChange={(e) => toggleAllActivities(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <label htmlFor="selectAll" className="text-sm font-medium text-gray-700 cursor-pointer">
                    {allEnabled ? 'Deselect All' : 'Select All'} Activity Types
                  </label>
                </div>
                <span className="text-sm text-gray-500">
                  {Object.values(activityConfig).filter(c => typeof c === 'object' && 'enabled' in c && c.enabled).length} selected
                </span>
              </div>

              {/* Activity Type Configuration */}
              <div className="space-y-4 mb-6">
                {/* Deposits */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="deposits"
                      checked={activityConfig.deposits.enabled}
                      onChange={(e) => setActivityConfig({
                        ...activityConfig,
                        deposits: { ...activityConfig.deposits, enabled: e.target.checked }
                      })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <label htmlFor="deposits" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Deposits
                      </label>
                      {activityConfig.deposits.enabled && (
                        <div className="mt-3 grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Count</label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={activityConfig.deposits.count}
                              onChange={(e) => setActivityConfig({
                                ...activityConfig,
                                deposits: { ...activityConfig.deposits, count: parseInt(e.target.value) || 1 }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Min Amount ($)</label>
                            <input
                              type="number"
                              min="100"
                              value={activityConfig.deposits.minAmount}
                              onChange={(e) => setActivityConfig({
                                ...activityConfig,
                                deposits: { ...activityConfig.deposits, minAmount: parseInt(e.target.value) || 100 }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Max Amount ($)</label>
                            <input
                              type="number"
                              min="100"
                              value={activityConfig.deposits.maxAmount}
                              onChange={(e) => setActivityConfig({
                                ...activityConfig,
                                deposits: { ...activityConfig.deposits, maxAmount: parseInt(e.target.value) || 100 }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Investments */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="investments"
                      checked={activityConfig.investments.enabled}
                      onChange={(e) => setActivityConfig({
                        ...activityConfig,
                        investments: { ...activityConfig.investments, enabled: e.target.checked }
                      })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <label htmlFor="investments" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Investments
                      </label>
                      {activityConfig.investments.enabled && (
                        <div className="mt-3">
                          <label className="block text-xs text-gray-600 mb-1">Count</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={activityConfig.investments.count}
                            onChange={(e) => setActivityConfig({
                              ...activityConfig,
                              investments: { ...activityConfig.investments, count: parseInt(e.target.value) || 1 }
                            })}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Withdrawals */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="withdrawals"
                      checked={activityConfig.withdrawals.enabled}
                      onChange={(e) => setActivityConfig({
                        ...activityConfig,
                        withdrawals: { ...activityConfig.withdrawals, enabled: e.target.checked }
                      })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <label htmlFor="withdrawals" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Withdrawals
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Will use existing deposits/investments as source</p>
                      {activityConfig.withdrawals.enabled && (
                        <div className="mt-3">
                          <label className="block text-xs text-gray-600 mb-1">Count</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={activityConfig.withdrawals.count}
                            onChange={(e) => setActivityConfig({
                              ...activityConfig,
                              withdrawals: { ...activityConfig.withdrawals, count: parseInt(e.target.value) || 1 }
                            })}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Returns */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="returns"
                      checked={activityConfig.returns.enabled}
                      onChange={(e) => setActivityConfig({
                        ...activityConfig,
                        returns: { ...activityConfig.returns, enabled: e.target.checked }
                      })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <label htmlFor="returns" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Monthly Returns
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Auto-generated based on investments</p>
                    </div>
                  </div>
                </div>

                {/* Referrals */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="referrals"
                      checked={activityConfig.referrals.enabled}
                      onChange={(e) => setActivityConfig({
                        ...activityConfig,
                        referrals: { ...activityConfig.referrals, enabled: e.target.checked }
                      })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <label htmlFor="referrals" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Referrals
                      </label>
                      {activityConfig.referrals.enabled && (
                        <div className="mt-3">
                          <label className="block text-xs text-gray-600 mb-1">Target Tier</label>
                          <select
                            value={activityConfig.referrals.targetTier}
                            onChange={(e) => setActivityConfig({
                              ...activityConfig,
                              referrals: { ...activityConfig.referrals, targetTier: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {tierOptions.map((tier) => (
                              <option key={tier.value} value={tier.value}>
                                {tier.label} ({tier.points})
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">Referrals will be generated to reach this tier</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Logins */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="logins"
                      checked={activityConfig.logins.enabled}
                      onChange={(e) => setActivityConfig({
                        ...activityConfig,
                        logins: { ...activityConfig.logins, enabled: e.target.checked }
                      })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <label htmlFor="logins" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Login History
                      </label>
                      {activityConfig.logins.enabled && (
                        <div className="mt-3">
                          <label className="block text-xs text-gray-600 mb-1">Count</label>
                          <input
                            type="number"
                            min="1"
                            max="1000"
                            value={activityConfig.logins.count}
                            onChange={(e) => setActivityConfig({
                              ...activityConfig,
                              logins: { ...activityConfig.logins, count: parseInt(e.target.value) || 1 }
                            })}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* KYC Updates */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="kycUpdates"
                      checked={activityConfig.kycUpdates.enabled}
                      onChange={(e) => setActivityConfig({
                        ...activityConfig,
                        kycUpdates: { ...activityConfig.kycUpdates, enabled: e.target.checked }
                      })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <label htmlFor="kycUpdates" className="text-sm font-medium text-gray-900 cursor-pointer">
                        KYC Milestones
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Account verification history</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex gap-2 text-sm text-yellow-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>
                    <strong>Note:</strong> Activities will be added to existing data (incremental mode).
                    You can edit or delete individual activities later if needed.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={generating}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Activity
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Generation Summary */
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity Generated Successfully!</h3>
                <p className="text-sm text-gray-600">The user's activity history has been created.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Deposits:</span>
                  <span className="font-semibold text-gray-900">{summary.totalDeposits || 0} transactions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Investments:</span>
                  <span className="font-semibold text-gray-900">{summary.totalInvestments || 0} transactions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Returns:</span>
                  <span className="font-semibold text-gray-900">{summary.totalReturns || 0} transactions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Withdrawals:</span>
                  <span className="font-semibold text-gray-900">{summary.totalWithdrawals || 0} transactions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Referrals:</span>
                  <span className="font-semibold text-gray-900">{summary.totalReferrals || 0} referrals</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Logins:</span>
                  <span className="font-semibold text-gray-900">{summary.totalLogins || 0} logins</span>
                </div>
                <div className="border-t border-gray-300 my-2"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Deposited:</span>
                  <span className="font-semibold text-green-600">${summary.totalAmountDeposited || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Invested:</span>
                  <span className="font-semibold text-blue-600">${summary.totalAmountInvested || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Returns Earned:</span>
                  <span className="font-semibold text-purple-600">${summary.totalReturnsEarned || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Withdrawn:</span>
                  <span className="font-semibold text-red-600">${summary.totalAmountWithdrawn || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateActivityModal;

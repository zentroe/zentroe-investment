import { useState, useEffect } from 'react';
import { Users, Share, DollarSign, TrendingUp, Copy, Trophy, Crown, Star, Building, ChevronLeft, ChevronRight } from "lucide-react";
import { useUser } from '@/context/UserContext';
import { getReferralCode, convertPointsToEquity, getTierColor, getTierIcon, formatPoints, getStatusColor } from '@/services/referralService';

export default function ReferralsPage() {
  const { referralData, loading } = useUser();
  const [referralLink, setReferralLink] = useState<string>('');
  const [shareMessage, setShareMessage] = useState<string>('');
  const [conversionAmount, setConversionAmount] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReferralCode();
  }, []);

  const fetchReferralCode = async () => {
    try {
      const data = await getReferralCode();
      setReferralLink(data.referralLink);
      setShareMessage(data.shareMessage);
    } catch (error) {
      console.error('Failed to fetch referral code:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleConvertToEquity = async () => {
    const points = parseInt(conversionAmount);
    if (!points || points < (referralData?.equityConversion.minimumPoints || 10000)) {
      alert(`Minimum ${referralData?.equityConversion.minimumPoints || 10000} points required`);
      return;
    }

    setIsConverting(true);
    try {
      await convertPointsToEquity(points);
      alert('Equity conversion request submitted! You will receive confirmation once approved.');
      setConversionAmount('');
      // Refresh referral data
      // TODO: Add refresh function
    } catch (error) {
      console.error('Failed to convert points:', error);
      alert('Failed to process equity conversion. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  if (loading.referrals) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading referral data...</p>
        </div>
      </div>
    );
  }

  const stats = referralData?.stats;
  const tierInfo = referralData?.tierInfo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Referral Rewards Program</h1>
        <p className="text-sm text-gray-500 mt-1">Earn points and convert to equity ownership in Zentroe</p>
      </div>

      {/* Current Tier Banner */}
      <div className={`rounded-lg p-6 ${getTierColor(stats?.currentTier || 'bronze')}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">
              {getTierIcon(stats?.currentTier || 'bronze')}
            </div>
            <div>
              <h2 className="text-xl font-semibold capitalize">{stats?.currentTier || 'Bronze'} Tier</h2>
              <p className="text-sm opacity-75">
                {formatPoints(stats?.totalPoints || 0)} points • {stats?.pointsToNextTier ? `${stats.pointsToNextTier} to next tier` : 'Highest tier reached!'}
              </p>
            </div>
          </div>
          {/* {stats?.equityPercentage && stats.equityPercentage > 0 && (
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Building size={20} />
                <span className="text-lg font-semibold">{formatEquityPercentage(stats.equityPercentage)}</span>
              </div>
              <p className="text-sm opacity-75">Company Ownership</p>
            </div>
          )} */}
        </div>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Points</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{formatPoints(stats?.totalPoints || 0)}</p>
              <p className="text-sm text-gray-500 mt-2">Lifetime earned</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Star size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Points</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{formatPoints(stats?.availablePoints || 0)}</p>
              <p className="text-sm text-gray-500 mt-2">Ready to convert</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Referred</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats?.totalReferrals || 0}</p>
              <p className="text-sm text-gray-500 mt-2">Friends invited</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
        </div> */}

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Qualified Referrals</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats?.qualifiedReferrals || 0}</p>
              <p className="text-sm text-gray-500 mt-2">Earned points</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <Trophy size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h3>
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleCopyLink}
            className={`px-6 py-3 rounded-lg whitespace-nowrap transition-colors ${copySuccess
              ? 'bg-green-600 text-white'
              : 'bg-primary text-white hover:bg-blue-700'
              }`}
          >
            {copySuccess ? (
              <div className="flex items-center space-x-2">
                <span>✓ Copied!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Copy size={16} />
                <span>Copy</span>
              </div>
            )}
          </button>
          <button
            onClick={() => navigator.share({ url: referralLink, text: shareMessage })}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap flex items-center space-x-2"
          >
            <Share size={16} />
            <span>Share</span>
          </button>
        </div>
        <div className="bg-white rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Share Message:</h4>
          <p className="text-sm text-gray-600">{shareMessage}</p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <TrendingUp size={16} />
            <span>Earn {tierInfo?.pointsPerReferral || 10} points per qualified referral</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign size={16} />
            <span>Friends need $1,000+ investment to qualify</span>
          </div>
        </div>
      </div>

      {/* Equity Conversion */}
      {stats?.availablePoints && stats.availablePoints >= (referralData?.equityConversion.minimumPoints || 50000) && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <Building size={24} className="text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Convert Points to Equity</h3>
          </div>
          <p className="text-gray-600 mb-4">
            You have enough points to become a shareholder! Convert your points to actual equity ownership in Zentroe.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points to Convert (Min: {referralData?.equityConversion.minimumPoints.toLocaleString()})
              </label>
              <input
                type="number"
                value={conversionAmount}
                onChange={(e) => setConversionAmount(e.target.value)}
                min={referralData?.equityConversion.minimumPoints}
                max={stats.availablePoints}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={`Min ${referralData?.equityConversion.minimumPoints.toLocaleString()}`}
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                onClick={handleConvertToEquity}
                disabled={!conversionAmount || parseInt(conversionAmount) < (referralData?.equityConversion.minimumPoints || 10000) || isConverting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isConverting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Crown size={16} />
                    <span>Become Shareholder</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>• {referralData?.equityConversion.currentSharePrice} points = 1 share</p>
            <p>• Equity conversions require admin approval</p>
            <p>• You'll receive legal documentation upon approval</p>
          </div>
        </div>
      )}

      {/* Tier Benefits */}
      {tierInfo && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Tier Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl">{getTierIcon(stats?.currentTier || 'bronze')}</div>
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">{stats?.currentTier || 'Bronze'} Tier</h4>
                  <p className="text-sm text-gray-500">{tierInfo.pointsPerReferral} points per referral</p>
                </div>
              </div>
              <div className="space-y-2">
                {tierInfo.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Points Progress</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Current Points</span>
                  <span className="font-medium">{formatPoints(stats?.totalPoints || 0)}</span>
                </div>
                {stats?.pointsToNextTier && stats.pointsToNextTier > 0 && (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${((tierInfo.maxPoints - stats.pointsToNextTier) / tierInfo.maxPoints) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>To Next Tier</span>
                      <span>{stats.pointsToNextTier} points</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Referral History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral History</h3>
        {referralData?.referrals && referralData.referrals.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Friend</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Points Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {referralData.referrals
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((referral, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {referral.referred?.firstName && referral.referred?.lastName
                                ? `${referral.referred.firstName} ${referral.referred.lastName}`
                                : referral.referred?.email
                                  ? referral.referred.email.split('@')[0]
                                  : 'Unknown User'
                              }
                            </p>
                            <p className="text-sm text-gray-500">
                              {referral.referred?.email || 'No email provided'}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {new Date(referral.signupDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(referral.status)}`}>
                            {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`font-medium ${referral.status === "rewarded" ? "text-green-600" : "text-gray-500"
                            }`}>
                            {referral.pointsEarned > 0 ? formatPoints(referral.pointsEarned) : "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {referralData.referrals.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, referralData.referrals.length)} of {referralData.referrals.length} referrals
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(referralData.referrals.length / itemsPerPage) }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first, last, current, and pages around current
                        const totalPages = Math.ceil(referralData.referrals.length / itemsPerPage);
                        return page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1;
                      })
                      .map((page, idx, arr) => (
                        <div key={page} className="flex items-center">
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium ${currentPage === page
                                ? 'bg-primary text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                              }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(referralData.referrals.length / itemsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(referralData.referrals.length / itemsPerPage)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users size={48} className="mx-auto mb-3 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h4>
            <p>Start sharing your referral link to earn points and build equity!</p>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">How the Points System Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <Share size={24} className="text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">1. Share & Earn</h4>
            <p className="text-sm text-gray-600">Share your link and earn points when friends invest $1,000+</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">2. Climb Tiers</h4>
            <p className="text-sm text-gray-600">Advance through tiers to earn more points per referral</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <Crown size={24} className="text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">3. Own Equity</h4>
            <p className="text-sm text-gray-600">Convert 50K+ points to become a shareholder in Zentroe</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Tier Progression</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between"><span>🥉 Bronze (0-99 pts):</span></div>
            <div className="flex justify-between"><span>🥈 Silver (100-499 pts):</span></div>
            <div className="flex justify-between"><span>🥇 Gold (500-1,999 pts):</span> </div>
            <div className="flex justify-between"><span>💎 Platinum (2K-9.9K pts):</span> </div>
            <div className="flex justify-between"><span>💠 Diamond (10K-49.9K pts):</span> </div>
            <div className="flex justify-between"><span>🏛️ Shareholder (50K+ pts):</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

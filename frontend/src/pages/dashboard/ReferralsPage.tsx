import { Users, Share, DollarSign, Gift } from "lucide-react";

const referralStats = {
  totalReferred: 12,
  totalEarned: 2400,
  pendingRewards: 600,
  thisMonth: 4
};

const referralHistory = [
  {
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    dateJoined: "2024-01-15",
    status: "Active",
    reward: 200,
    investmentAmount: 5000
  },
  {
    name: "Mike Chen",
    email: "mike.chen@email.com",
    dateJoined: "2024-01-10",
    status: "Active",
    reward: 200,
    investmentAmount: 3000
  },
  {
    name: "Lisa Rodriguez",
    email: "lisa.r@email.com",
    dateJoined: "2024-01-08",
    status: "Pending",
    reward: 200,
    investmentAmount: 0
  },
  {
    name: "David Kim",
    email: "david.kim@email.com",
    dateJoined: "2023-12-28",
    status: "Active",
    reward: 200,
    investmentAmount: 8000
  }
];

export default function ReferralsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Referral Program</h1>
        <p className="text-sm text-gray-500 mt-1">Earn rewards by inviting friends to invest with Zentroe</p>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Referred</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{referralStats.totalReferred}</p>
              <p className="text-sm text-gray-500 mt-2">Friends invited</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earned</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">${referralStats.totalEarned.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">All time rewards</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Rewards</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">${referralStats.pendingRewards.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">Awaiting qualification</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <Gift size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{referralStats.thisMonth}</p>
              <p className="text-sm text-gray-500 mt-2">New referrals</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Share size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value="https://zentroe.com/ref/emma-watson-xyz123"
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap">
            Copy Link
          </button>
          <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap">
            Share
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Share this link with friends and earn $200 when they invest $1,000 or more!
        </p>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">How Referrals Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Share size={24} className="text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">1. Share Your Link</h4>
            <p className="text-sm text-gray-600">Send your unique referral link to friends and family</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users size={24} className="text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">2. They Sign Up</h4>
            <p className="text-sm text-gray-600">Your friend creates an account and invests $1,000+</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign size={24} className="text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">3. Earn Rewards</h4>
            <p className="text-sm text-gray-600">You both receive $200 credited to your accounts</p>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Friend</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date Joined</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Investment</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Your Reward</th>
              </tr>
            </thead>
            <tbody>
              {referralHistory.map((referral, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{referral.name}</p>
                      <p className="text-sm text-gray-500">{referral.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {new Date(referral.dateJoined).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${referral.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {referral.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {referral.investmentAmount > 0
                      ? `$${referral.investmentAmount.toLocaleString()}`
                      : "-"
                    }
                  </td>
                  <td className="py-4 px-4">
                    <span className={`font-medium ${referral.status === "Active" ? "text-green-600" : "text-gray-500"
                      }`}>
                      ${referral.reward}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

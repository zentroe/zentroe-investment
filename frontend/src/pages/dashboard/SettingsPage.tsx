import { useState } from "react";
import { User, Shield, Bell, CreditCard, Plus } from "lucide-react";

const userProfile = {
  name: "Emma Watson",
  email: "emma.watson@email.com",
  phone: "+1 (555) 123-4567",
  address: "123 Investment Street, New York, NY 10001",
  accountType: "Premium Investor",
  memberSince: "2023-06-15",
  kycStatus: "Verified"
};

const notificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  investmentUpdates: true,
  marketNews: true,
  monthlyReports: true,
  referralUpdates: false
};

const privacySettings = {
  twoFactorAuth: true,
  sessionTimeout: "30 minutes",
  dataSharing: false,
  profileVisibility: "private"
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState(notificationSettings);
  const [privacy, setPrivacy] = useState(privacySettings);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "payment", label: "Payment Methods", icon: CreditCard }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences and security settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <tab.icon size={16} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-semibold">EW</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{userProfile.name}</h3>
                  <p className="text-sm text-gray-500">{userProfile.accountType}</p>
                  <p className="text-sm text-gray-500">Member since {new Date(userProfile.memberSince).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={userProfile.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={userProfile.phone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">KYC Status</label>
                  <div className="flex items-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      {userProfile.kycStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={userProfile.address}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Changes
                </button>
                <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-sm text-gray-500">
                          {key === 'emailNotifications' && 'Receive updates via email'}
                          {key === 'smsNotifications' && 'Receive updates via SMS'}
                          {key === 'investmentUpdates' && 'Get notified about your investments'}
                          {key === 'marketNews' && 'Stay updated with market trends'}
                          {key === 'monthlyReports' && 'Receive monthly portfolio reports'}
                          {key === 'referralUpdates' && 'Get updates about your referrals'}
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Security</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => setPrivacy(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>Never</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Data Sharing</p>
                      <p className="text-sm text-gray-500">Allow anonymous data sharing for service improvement</p>
                    </div>
                    <button
                      onClick={() => setPrivacy(prev => ({ ...prev, dataSharing: !prev.dataSharing }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy.dataSharing ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.dataSharing ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Account Actions</h4>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Change Password
                  </button>
                  <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Download Account Data
                  </button>
                  <button className="w-full text-left px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === "payment" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">VISA</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                          <p className="text-sm text-gray-500">Expires 12/26</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                        <button className="text-red-600 hover:text-red-700 text-sm">Remove</button>
                      </div>
                    </div>
                  </div>

                  <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400">
                    <Plus size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Add New Payment Method</p>
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Bank Accounts</h4>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Chase Bank •••• 1234</p>
                        <p className="text-sm text-gray-500">Checking Account</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { User, Shield, Bell, CreditCard, Plus, Eye, EyeOff, Save, AlertCircle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getUserSettings,
  updateUserProfile,
  updateNotificationSettings,
  changePassword,
  updatePrivacySettings,
  requestDataDownload,
  deleteAccount,
  type UserSettings,
  type UpdateProfileRequest,
  type ChangePasswordRequest
} from "@/services/userSettingsService";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState<UpdateProfileRequest>({});
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: ''
  });

  // Local state for toggles
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    investmentUpdates: true,
    marketNews: true,
    monthlyReports: true,
    referralUpdates: false
  });

  const [privacy, setPrivacy] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30 minutes",
    dataSharing: false,
    profileVisibility: "private"
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "payment", label: "Payment Methods", icon: CreditCard }
  ];

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await getUserSettings();
      setSettings(userSettings);

      // Initialize form states
      setProfileForm({
        firstName: userSettings.profile.firstName,
        lastName: userSettings.profile.lastName,
        phone: userSettings.profile.phone,
        address: userSettings.profile.address,
        dateOfBirth: userSettings.profile.dateOfBirth || undefined
      });

      setNotifications(userSettings.notifications);
      setPrivacy(userSettings.privacy);
    } catch (error: any) {
      console.error('Error fetching user settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      await updateUserProfile(profileForm);
      toast.success('Profile updated successfully');
      fetchUserSettings(); // Refresh data
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    try {
      setSaving(true);
      await changePassword(passwordForm);
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = async (key: string, value: boolean) => {
    try {
      const updatedNotifications = { ...notifications, [key]: value };
      setNotifications(updatedNotifications);

      await updateNotificationSettings(updatedNotifications);
      toast.success('Notification settings updated');
    } catch (error: any) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update notification settings');
      // Revert on error
      setNotifications(notifications);
    }
  };

  const handlePrivacyToggle = async (key: string, value: boolean) => {
    try {
      const updatedPrivacy = { ...privacy, [key]: value };
      setPrivacy(updatedPrivacy);

      await updatePrivacySettings(updatedPrivacy);
      toast.success('Privacy settings updated');
    } catch (error: any) {
      console.error('Error updating privacy settings:', error);
      toast.error('Failed to update privacy settings');
      // Revert on error
      setPrivacy(privacy);
    }
  };

  const handleDataDownload = async () => {
    try {
      const result = await requestDataDownload();
      toast.success(result.message);
    } catch (error: any) {
      console.error('Error requesting data download:', error);
      toast.error('Failed to request data download');
    }
  };

  const handleAccountDeletion = async () => {
    const password = prompt('Please enter your password to confirm account deletion:');
    if (!password) return;

    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteAccount(password);
      toast.success('Account deleted successfully');
      // Redirect to login or home page
      window.location.href = '/';
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const formatMemberSince = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Settings</h3>
        <p className="text-gray-600 mb-4">We couldn't load your settings. Please try refreshing the page.</p>
        <Button onClick={fetchUserSettings}>Retry</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences and security settings</p>
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? "border-primary text-primary"
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
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-semibold">
                    {settings.profile.firstName?.[0]}{settings.profile.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {settings.profile.firstName} {settings.profile.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">{settings.profile.accountType} Account</p>
                  <p className="text-sm text-gray-500">Member since {formatMemberSince(settings.profile.memberSince)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={profileForm.firstName || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="mt-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={profileForm.lastName || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="mt-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    disabled
                    className="mt-1 bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileForm.phone || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="mt-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">KYC Status</Label>
                  <div className="flex items-center mt-1">
                    <span className={`px-3 py-1 text-sm rounded-full ${settings.profile.kycStatus === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : settings.profile.kycStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                      {settings.profile.kycStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="street" className="text-sm font-medium text-gray-700">Street Address</Label>
                    <Input
                      id="street"
                      type="text"
                      value={profileForm.address?.street || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({
                        ...profileForm,
                        address: { ...profileForm.address, street: e.target.value }
                      })}
                      className="mt-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                    <Input
                      id="city"
                      type="text"
                      value={profileForm.address?.city || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({
                        ...profileForm,
                        address: { ...profileForm.address, city: e.target.value }
                      })}
                      className="mt-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                    <Input
                      id="state"
                      type="text"
                      value={profileForm.address?.state || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({
                        ...profileForm,
                        address: { ...profileForm.address, state: e.target.value }
                      })}
                      className="mt-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      type="text"
                      value={profileForm.address?.zipCode || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({
                        ...profileForm,
                        address: { ...profileForm.address, zipCode: e.target.value }
                      })}
                      className="mt-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country</Label>
                    <Input
                      id="country"
                      type="text"
                      value={profileForm.address?.country || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileForm({
                        ...profileForm,
                        address: { ...profileForm.address, country: e.target.value }
                      })}
                      className="mt-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleProfileUpdate}
                  disabled={saving}
                  className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setProfileForm({
                    firstName: settings.profile.firstName,
                    lastName: settings.profile.lastName,
                    phone: settings.profile.phone,
                    address: settings.profile.address,
                  })}
                >
                  Cancel
                </Button>
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
                        onClick={() => handleNotificationToggle(key, !value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-gradient-to-r from-primary to-orange-600' : 'bg-gray-200'
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
                      onClick={() => handlePrivacyToggle('twoFactorAuth', !privacy.twoFactorAuth)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy.twoFactorAuth ? 'bg-gradient-to-r from-primary to-orange-600' : 'bg-gray-200'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>

                  <div>
                    <Label htmlFor="sessionTimeout" className="text-sm font-medium text-gray-700">Session Timeout</Label>
                    <select
                      id="sessionTimeout"
                      value={privacy.sessionTimeout}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPrivacy({ ...privacy, sessionTimeout: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="15 minutes">15 minutes</option>
                      <option value="30 minutes">30 minutes</option>
                      <option value="1 hour">1 hour</option>
                      <option value="Never">Never</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Data Sharing</p>
                      <p className="text-sm text-gray-500">Allow anonymous data sharing for service improvement</p>
                    </div>
                    <button
                      onClick={() => handlePrivacyToggle('dataSharing', !privacy.dataSharing)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy.dataSharing ? 'bg-gradient-to-r from-primary to-orange-600' : 'bg-gray-200'
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

              {/* Password Change Section */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Change Password</h4>
                <div className="space-y-4 max-w-md">
                  <div>
                    <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="focus:ring-primary focus:border-primary pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="focus:ring-primary focus:border-primary pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={saving}
                    className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90"
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Account Actions</h4>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={handleDataDownload}
                    className="w-full justify-start px-4 py-3 h-auto"
                  >
                    <CheckCircle className="w-4 h-4 mr-3" />
                    Download Account Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAccountDeletion}
                    className="w-full justify-start px-4 py-3 h-auto border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <AlertCircle className="w-4 h-4 mr-3" />
                    Delete Account
                  </Button>
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
                  {/* Placeholder for payment methods - would be populated from real data */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-6 bg-gradient-to-r from-primary to-orange-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">CARD</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                          <p className="text-sm text-gray-500">Expires 12/26</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" className="text-primary hover:bg-primary/5">
                          Edit
                        </Button>
                        <Button variant="outline" className="text-red-600 hover:bg-red-50">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Button
                    variant="outline"
                    className="w-full border-2 border-dashed border-gray-300 p-6 text-center hover:border-primary"
                  >
                    <Plus size={24} className="mx-auto text-gray-400 mb-2" />
                    <span className="text-gray-600">Add New Payment Method</span>
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Bank Accounts</h4>
                <div className="space-y-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Chase Bank •••• 1234</p>
                        <p className="text-sm text-gray-500">Checking Account</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Verified
                      </span>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

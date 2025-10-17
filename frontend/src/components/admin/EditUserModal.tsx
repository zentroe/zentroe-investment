import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { User, updateAdminUserDetails } from '@/services/adminUserService';
import { toast } from 'sonner';

interface EditUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        address: user.address || {
          street: '',
          street2: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'United States'
        },
        kyc: user.kyc || {
          status: 'pending'
        },
        referralStats: user.referralStats || {
          totalReferred: 0,
          qualifiedReferrals: 0,
          totalPointsEarned: 0,
          currentTier: 'bronze'
        }
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev as any)[parent],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await updateAdminUserDetails(user._id, formData);
      toast.success('User updated successfully!');
      onSuccess(response.user);
      onClose();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'address', label: 'Address' },
    { id: 'investment', label: 'Investment Profile' },
    { id: 'account', label: 'Account Settings' },
    { id: 'kyc', label: 'KYC & Compliance' },
    { id: 'referral', label: 'Referral System' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName || ''}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SSN / Tax ID</label>
                  <input
                    type="text"
                    value={formData.socialSecurityNumber || formData.ssn || ''}
                    onChange={(e) => handleChange('socialSecurityNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="XXX-XX-XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country of Residence</label>
                  <input
                    type="text"
                    value={formData.countryOfResidence || ''}
                    onChange={(e) => handleChange('countryOfResidence', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country of Citizenship</label>
                  <input
                    type="text"
                    value={formData.countryOfCitizenship || ''}
                    onChange={(e) => handleChange('countryOfCitizenship', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.address?.street || ''}
                    onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    value={formData.address?.street2 || ''}
                    onChange={(e) => handleNestedChange('address', 'street2', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.address?.city || ''}
                      onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={formData.address?.state || ''}
                      onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                    <input
                      type="text"
                      value={formData.address?.zipCode || ''}
                      onChange={(e) => handleNestedChange('address', 'zipCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.address?.country || ''}
                    onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Investment Profile Tab */}
          {activeTab === 'investment' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <select
                    value={formData.accountType || ''}
                    onChange={(e) => handleChange('accountType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Account Type</option>
                    <option value="general">General</option>
                    <option value="retirement">Retirement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Sub-Type</label>
                  <select
                    value={formData.accountSubType || ''}
                    onChange={(e) => handleChange('accountSubType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Sub-Type</option>
                    <option value="individual">Individual</option>
                    <option value="joint">Joint</option>
                    <option value="trust">Trust</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Investment Amount</label>
                  <input
                    type="number"
                    value={formData.initialInvestmentAmount || ''}
                    onChange={(e) => handleChange('initialInvestmentAmount', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Investment Amount</label>
                  <input
                    type="text"
                    value={formData.annualInvestmentAmount || ''}
                    onChange={(e) => handleChange('annualInvestmentAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., $10,000 - $50,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income</label>
                  <select
                    value={formData.annualIncome || ''}
                    onChange={(e) => handleChange('annualIncome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Income Range</option>
                    <option value="<$50k">Less than $50,000</option>
                    <option value="$50k-$100k">$50,000 - $100,000</option>
                    <option value="$100k-$200k">$100,000 - $200,000</option>
                    <option value="$200k-$500k">$200,000 - $500,000</option>
                    <option value=">$500k">More than $500,000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Net Worth</label>
                  <select
                    value={formData.netWorth || ''}
                    onChange={(e) => handleChange('netWorth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Net Worth Range</option>
                    <option value="<$100k">Less than $100,000</option>
                    <option value="$100k-$500k">$100,000 - $500,000</option>
                    <option value="$500k-$1M">$500,000 - $1,000,000</option>
                    <option value="$1M-$5M">$1,000,000 - $5,000,000</option>
                    <option value=">$5M">More than $5,000,000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Investment Experience</label>
                  <select
                    value={formData.investmentExperience || ''}
                    onChange={(e) => handleChange('investmentExperience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Experience Level</option>
                    <option value="none">None</option>
                    <option value="limited">Limited</option>
                    <option value="moderate">Moderate</option>
                    <option value="extensive">Extensive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Investment Goal</label>
                  <select
                    value={formData.investmentGoal || ''}
                    onChange={(e) => handleChange('investmentGoal', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Investment Goal</option>
                    <option value="diversification">Diversification</option>
                    <option value="fixed_income">Fixed Income</option>
                    <option value="venture_capital">Venture Capital</option>
                    <option value="growth">Growth</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Tolerance</label>
                  <select
                    value={formData.riskTolerance || ''}
                    onChange={(e) => handleChange('riskTolerance', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Risk Tolerance</option>
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Investment Time Horizon</label>
                  <select
                    value={formData.investmentTimeHorizon || ''}
                    onChange={(e) => handleChange('investmentTimeHorizon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Time Horizon</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5-10 years">5-10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
                  <select
                    value={formData.employmentStatus || ''}
                    onChange={(e) => handleChange('employmentStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Employment Status</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="retired">Retired</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employer</label>
                  <input
                    type="text"
                    value={formData.employer || ''}
                    onChange={(e) => handleChange('employer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="accreditedInvestor"
                  checked={formData.isAccreditedInvestor || false}
                  onChange={(e) => handleChange('isAccreditedInvestor', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="accreditedInvestor" className="text-sm font-medium text-gray-700">
                  Accredited Investor
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="politicallyExposed"
                  checked={formData.politicallyExposed || false}
                  onChange={(e) => handleChange('politicallyExposed', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="politicallyExposed" className="text-sm font-medium text-gray-700">
                  Politically Exposed Person (PEP)
                </label>
              </div>
            </div>
          )}

          {/* Account Settings Tab */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Balance</label>
                  <input
                    type="number"
                    value={formData.walletBalance || 0}
                    onChange={(e) => handleChange('walletBalance', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role || 'user'}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Onboarding Status</label>
                  <select
                    value={formData.onboardingStatus || 'started'}
                    onChange={(e) => handleChange('onboardingStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="started">Started</option>
                    <option value="basicInfo">Basic Info</option>
                    <option value="investmentProfile">Investment Profile</option>
                    <option value="verification">Verification</option>
                    <option value="bankConnected">Bank Connected</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referral Source</label>
                  <input
                    type="text"
                    value={formData.referralSource || ''}
                    onChange={(e) => handleChange('referralSource', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="How did they hear about us?"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive !== false}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Account Active
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isEmailVerified"
                    checked={formData.isEmailVerified || false}
                    onChange={(e) => handleChange('isEmailVerified', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isEmailVerified" className="text-sm font-medium text-gray-700">
                    Email Verified
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={formData.emailNotifications !== false}
                    onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
                    Email Notifications Enabled
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    checked={formData.smsNotifications || false}
                    onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="smsNotifications" className="text-sm font-medium text-gray-700">
                    SMS Notifications Enabled
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* KYC & Compliance Tab */}
          {activeTab === 'kyc' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KYC Status</label>
                  <select
                    value={formData.kyc?.status || 'pending'}
                    onChange={(e) => handleNestedChange('kyc', 'status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KYC Submitted At</label>
                  <input
                    type="datetime-local"
                    value={formData.kyc?.submittedAt ? new Date(formData.kyc.submittedAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleNestedChange('kyc', 'submittedAt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KYC Reviewed At</label>
                  <input
                    type="datetime-local"
                    value={formData.kyc?.reviewedAt ? new Date(formData.kyc.reviewedAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleNestedChange('kyc', 'reviewedAt', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KYC Notes</label>
                <textarea
                  value={formData.kyc?.notes || ''}
                  onChange={(e) => handleNestedChange('kyc', 'notes', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Admin notes about KYC review..."
                />
              </div>
            </div>
          )}

          {/* Referral System Tab */}
          {activeTab === 'referral' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referral Code</label>
                  <input
                    type="text"
                    value={formData.referralCode || ''}
                    onChange={(e) => handleChange('referralCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="UNIQUE_CODE"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Referred</label>
                  <input
                    type="number"
                    value={formData.referralStats?.totalReferred || 0}
                    onChange={(e) => handleNestedChange('referralStats', 'totalReferred', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualified Referrals</label>
                  <input
                    type="number"
                    value={formData.referralStats?.qualifiedReferrals || 0}
                    onChange={(e) => handleNestedChange('referralStats', 'qualifiedReferrals', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Points Earned</label>
                  <input
                    type="number"
                    value={formData.referralStats?.totalPointsEarned || 0}
                    onChange={(e) => handleNestedChange('referralStats', 'totalPointsEarned', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Tier</label>
                  <select
                    value={formData.referralStats?.currentTier || 'bronze'}
                    onChange={(e) => handleNestedChange('referralStats', 'currentTier', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond">Diamond</option>
                    <option value="shareholder">Shareholder</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={saving}
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

export default EditUserModal;

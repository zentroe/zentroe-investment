import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Briefcase, DollarSign, TrendingUp, FileText, Users } from 'lucide-react';
import { createUser, getUserDetails } from '@/services/adminUserService';
import { toast } from 'sonner';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cloneFromUserId?: string | null;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess, cloneFromUserId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingClone, setLoadingClone] = useState(false);

  const tabs = [
    { id: 0, name: 'Basic Info', icon: User },
    { id: 1, name: 'Address', icon: MapPin },
    { id: 2, name: 'Account Setup', icon: Briefcase },
    { id: 3, name: 'Financial Profile', icon: DollarSign },
    { id: 4, name: 'Investment Preferences', icon: TrendingUp },
    { id: 5, name: 'KYC & Verification', icon: FileText },
    { id: 6, name: 'Referral & Advanced', icon: Users },
  ];

  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    countryOfResidence: '',
    countryOfCitizenship: '',
    createdAt: new Date().toISOString().split('T')[0],

    // Address
    address: {
      street: '',
      street2: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },

    // Account Setup
    accountType: 'general',
    accountSubType: '',

    // Financial Profile
    socialSecurityNumber: '',
    ssn: '',
    annualIncome: '',
    netWorth: '',
    initialInvestmentAmount: 0,
    investmentExperience: '',
    investmentGoal: '',
    riskTolerance: '',
    investmentTimeHorizon: '',
    portfolioPriority: '',

    // Investment Preferences (optional)
    selectedInvestmentPlan: '',
    recommendedPortfolio: '',
    recurringInvestment: false,
    recurringFrequency: '',
    recurringDay: '',

    // KYC Status
    kycStatus: 'none',

    // Referral & Advanced
    referredBy: '',
    referralSource: '',
    notes: ''
  });

  // Load user data for cloning
  useEffect(() => {
    if (cloneFromUserId && isOpen) {
      loadUserForCloning(cloneFromUserId);
    }
  }, [cloneFromUserId, isOpen]);

  const loadUserForCloning = async (userId: string) => {
    try {
      setLoadingClone(true);
      const response = await getUserDetails(userId);
      const user = response.user;

      // Clone user data but clear sensitive fields
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: '', // Clear email - must be unique
        password: '', // Clear password - admin must set new one
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        countryOfResidence: user.countryOfResidence || '',
        countryOfCitizenship: user.countryOfCitizenship || '',
        createdAt: new Date().toISOString().split('T')[0],

        address: {
          street: user.address?.street || '',
          street2: user.address?.street2 || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || ''
        },

        accountType: user.accountType || 'general',
        accountSubType: user.accountSubType || '',

        socialSecurityNumber: '', // Clear SSN
        ssn: '', // Clear SSN
        annualIncome: user.annualIncome || '',
        netWorth: user.netWorth || '',
        initialInvestmentAmount: user.initialInvestmentAmount || 0,
        investmentExperience: user.investmentExperience || '',
        investmentGoal: user.investmentGoal || '',
        riskTolerance: user.riskTolerance || '',
        investmentTimeHorizon: user.investmentTimeHorizon || '',
        portfolioPriority: user.portfolioPriority || '',

        selectedInvestmentPlan: user.selectedInvestmentPlan?._id || '',
        recommendedPortfolio: user.recommendedPortfolio || '',
        recurringInvestment: user.recurringInvestment || false,
        recurringFrequency: user.recurringFrequency || '',
        recurringDay: user.recurringDay || '',

        kycStatus: 'none', // Reset KYC status
        referredBy: '', // Clear referrer
        referralSource: user.referralSource || '',
        notes: `Cloned from ${user.firstName} ${user.lastName} (${user.email})`
      });

      toast.success(`User data cloned from ${user.firstName} ${user.lastName}`);
    } catch (error: any) {
      console.error('Failed to load user for cloning:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoadingClone(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields (Name, Email, Password)');
      setActiveTab(0);
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setActiveTab(0);
      return false;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Please enter a valid email address');
      setActiveTab(0);
      return false;
    }

    if (!formData.accountType) {
      toast.error('Please select an account type');
      setActiveTab(2);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Clean form data - remove empty strings for optional enum fields
      const cleanedData: any = {
        ...formData,
        // Only include optional fields if they have values
        accountSubType: formData.accountSubType || undefined,
        socialSecurityNumber: formData.socialSecurityNumber || undefined,
        ssn: formData.ssn || undefined,
        annualIncome: formData.annualIncome || undefined,
        netWorth: formData.netWorth || undefined,
        investmentExperience: formData.investmentExperience || undefined,
        investmentGoal: formData.investmentGoal || undefined,
        riskTolerance: formData.riskTolerance || undefined,
        investmentTimeHorizon: formData.investmentTimeHorizon || undefined,
        portfolioPriority: formData.portfolioPriority || undefined,
        selectedInvestmentPlan: formData.selectedInvestmentPlan || undefined,
        recommendedPortfolio: formData.recommendedPortfolio || undefined,
        recurringFrequency: formData.recurringFrequency || undefined,
        recurringDay: formData.recurringDay || undefined,
        referredBy: formData.referredBy || undefined,
        referralSource: formData.referralSource || undefined,
        notes: formData.notes || undefined
      };

      const response = await createUser(cleanedData);

      if (response.success) {
        toast.success(`User ${formData.firstName} ${formData.lastName} created successfully!`);
        onSuccess();
        onClose();
        resetForm();
      }
    } catch (error: any) {
      console.error('Failed to create user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      dateOfBirth: '',
      countryOfResidence: '',
      countryOfCitizenship: '',
      createdAt: new Date().toISOString().split('T')[0],
      address: { street: '', street2: '', city: '', state: '', zipCode: '', country: '' },
      accountType: 'general',
      accountSubType: '',
      socialSecurityNumber: '',
      ssn: '',
      annualIncome: '',
      netWorth: '',
      initialInvestmentAmount: 0,
      investmentExperience: '',
      investmentGoal: '',
      riskTolerance: '',
      investmentTimeHorizon: '',
      portfolioPriority: '',
      selectedInvestmentPlan: '',
      recommendedPortfolio: '',
      recurringInvestment: false,
      recurringFrequency: '',
      recurringDay: '',
      kycStatus: 'none',
      referredBy: '',
      referralSource: '',
      notes: ''
    });
    setActiveTab(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {cloneFromUserId ? 'Create User (Cloned)' : 'Create New User'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Create a new user account with full admin control
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingClone ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading user data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Tab 0: Basic Info */}
              {activeTab === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value.toLowerCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Email will be automatically verified</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country of Residence</label>
                      <input
                        type="text"
                        value={formData.countryOfResidence}
                        onChange={(e) => handleInputChange('countryOfResidence', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country of Citizenship</label>
                      <input
                        type="text"
                        value={formData.countryOfCitizenship}
                        onChange={(e) => handleInputChange('countryOfCitizenship', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Created Date
                    </label>
                    <input
                      type="date"
                      value={formData.createdAt}
                      onChange={(e) => handleInputChange('createdAt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <p className="text-xs text-gray-500 mt-1">Backdate the account creation if needed</p>
                  </div>
                </div>
              )}

              {/* Tab 1: Address */}
              {activeTab === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address Line 2</label>
                    <input
                      type="text"
                      value={formData.address.street2}
                      onChange={(e) => handleInputChange('address.street2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Apt, Suite, Unit, etc."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                      <input
                        type="text"
                        value={formData.address.state}
                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code</label>
                      <input
                        type="text"
                        value={formData.address.zipCode}
                        onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={formData.address.country}
                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Account Setup */}
              {activeTab === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.accountType}
                      onChange={(e) => handleInputChange('accountType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="general">General Investing Account</option>
                      <option value="retirement">Retirement Account</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Sub-Type</label>
                    <select
                      value={formData.accountSubType}
                      onChange={(e) => handleInputChange('accountSubType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None - Leave empty</option>
                      <option value="individual">Individual</option>
                      <option value="joint">Joint</option>
                      <option value="trust">Trust</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Account Status</h4>
                    <p className="text-sm text-blue-700">
                      • Account will be created as <strong>Active</strong><br />
                      • Email and phone will be <strong>automatically verified</strong><br />
                      • Onboarding will be marked as <strong>completed</strong><br />
                      • Referral code will be <strong>auto-generated</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Financial Profile - Continued in next part due to length */}
              {activeTab === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Social Security Number</label>
                      <input
                        type="text"
                        value={formData.socialSecurityNumber}
                        onChange={(e) => handleInputChange('socialSecurityNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="XXX-XX-XXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SSN (Alt)</label>
                      <input
                        type="text"
                        value={formData.ssn}
                        onChange={(e) => handleInputChange('ssn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income</label>
                      <select
                        value={formData.annualIncome}
                        onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Range</option>
                        <option value="0-50k">$0 - $50,000</option>
                        <option value="50k-100k">$50,000 - $100,000</option>
                        <option value="100k-250k">$100,000 - $250,000</option>
                        <option value="250k-500k">$250,000 - $500,000</option>
                        <option value="500k+">$500,000+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Net Worth</label>
                      <select
                        value={formData.netWorth}
                        onChange={(e) => handleInputChange('netWorth', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Range</option>
                        <option value="0-100k">$0 - $100,000</option>
                        <option value="100k-500k">$100,000 - $500,000</option>
                        <option value="500k-1m">$500,000 - $1,000,000</option>
                        <option value="1m-5m">$1,000,000 - $5,000,000</option>
                        <option value="5m+">$5,000,000+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Investment Amount</label>
                    <input
                      type="number"
                      value={formData.initialInvestmentAmount}
                      onChange={(e) => handleInputChange('initialInvestmentAmount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Investment Experience</label>
                      <select
                        value={formData.investmentExperience}
                        onChange={(e) => handleInputChange('investmentExperience', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Experience</option>
                        <option value="none">None</option>
                        <option value="limited">Limited</option>
                        <option value="moderate">Moderate</option>
                        <option value="extensive">Extensive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Investment Goal</label>
                      <select
                        value={formData.investmentGoal}
                        onChange={(e) => handleInputChange('investmentGoal', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Goal</option>
                        <option value="diversification">Diversification & Performance</option>
                        <option value="fixed_income">Consistent Fixed Income</option>
                        <option value="venture_capital">Access to Venture Capital</option>
                        <option value="growth">Growth</option>
                        <option value="income">Income Generation</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Risk Tolerance</label>
                      <select
                        value={formData.riskTolerance}
                        onChange={(e) => handleInputChange('riskTolerance', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Risk Level</option>
                        <option value="conservative">Conservative</option>
                        <option value="moderate">Moderate</option>
                        <option value="aggressive">Aggressive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Investment Time Horizon</label>
                      <select
                        value={formData.investmentTimeHorizon}
                        onChange={(e) => handleInputChange('investmentTimeHorizon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Time Horizon</option>
                        <option value="1-3 years">1-3 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5-10 years">5-10 years</option>
                        <option value="10+ years">10+ years</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Priority</label>
                    <select
                      value={formData.portfolioPriority}
                      onChange={(e) => handleInputChange('portfolioPriority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Priority</option>
                      <option value="long_term">Long-term, Risk-adjusted Returns</option>
                      <option value="short_term">Short-term, Consistent Returns</option>
                      <option value="balanced">Balanced Approach to Risk and Returns</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Tab 4: Investment Preferences */}
              {activeTab === 4 && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Optional:</strong> These investment preferences can be set now or left blank for the user to configure later.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selected Investment Plan (Optional)</label>
                    <input
                      type="text"
                      value={formData.selectedInvestmentPlan}
                      onChange={(e) => handleInputChange('selectedInvestmentPlan', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Investment Plan ID"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter the investment plan ID if you want to pre-assign one</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recommended Portfolio</label>
                    <select
                      value={formData.recommendedPortfolio}
                      onChange={(e) => handleInputChange('recommendedPortfolio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Portfolio</option>
                      <option value="Conservative Growth">Conservative Growth</option>
                      <option value="Balanced Portfolio">Balanced Portfolio</option>
                      <option value="Aggressive Growth">Aggressive Growth</option>
                      <option value="Income Focus">Income Focus</option>
                      <option value="Diversified">Diversified</option>
                    </select>
                  </div>

                  <div className="border-t pt-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.recurringInvestment}
                        onChange={(e) => handleInputChange('recurringInvestment', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable Recurring Investment</span>
                    </label>
                  </div>

                  {formData.recurringInvestment && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Recurring Frequency</label>
                          <select
                            value={formData.recurringFrequency}
                            onChange={(e) => handleInputChange('recurringFrequency', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Frequency</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month/Week</label>
                          <input
                            type="text"
                            value={formData.recurringDay}
                            onChange={(e) => handleInputChange('recurringDay', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 1st, 15th, Monday"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab 5: KYC & Verification */}
              {activeTab === 5 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">KYC Status</label>
                    <select
                      value={formData.kycStatus}
                      onChange={(e) => handleInputChange('kycStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">None - User will submit KYC later</option>
                      <option value="pending">Pending - Under Review</option>
                      <option value="approved">Approved - Pre-approved by Admin</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Auto-Verification</h4>
                    <p className="text-sm text-green-700">
                      ✓ Email will be automatically verified<br />
                      ✓ Phone will be automatically verified<br />
                      ✓ No verification codes will be sent
                    </p>
                  </div>

                  {formData.kycStatus === 'none' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        User will need to submit KYC documents through the normal verification process.
                      </p>
                    </div>
                  )}

                  {formData.kycStatus === 'approved' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-700">
                        User will have full access immediately. KYC will be marked as approved.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 6: Referral & Advanced */}
              {activeTab === 6 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Referred By (User ID)</label>
                    <input
                      type="text"
                      value={formData.referredBy}
                      onChange={(e) => handleInputChange('referredBy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter referrer's user ID"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional: Link this user to a referrer</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Referral Source</label>
                    <select
                      value={formData.referralSource}
                      onChange={(e) => handleInputChange('referralSource', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Source</option>
                      <option value="friend_referral">Friend Referral</option>
                      <option value="social_media">Social Media</option>
                      <option value="search_engine">Search Engine</option>
                      <option value="advertisement">Advertisement</option>
                      <option value="financial_advisor">Financial Advisor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Internal notes about this user account..."
                    />
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Auto-Generated</h4>
                    <p className="text-sm text-gray-700">
                      • Unique referral code will be generated automatically<br />
                      • User will start with Bronze tier (0 points)<br />
                      • ReferralPoints record will be created
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex space-x-2">
            {activeTab > 0 && (
              <button
                onClick={() => setActiveTab(activeTab - 1)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>

            {activeTab < tabs.length - 1 ? (
              <button
                onClick={() => setActiveTab(activeTab + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <User size={18} />
                    <span>Create User</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Building2,
  Search,
  Copy,
  CheckCircle,
  XCircle,
  MapPin
} from 'lucide-react';
import { getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount } from '@/services/adminService';

interface BankAccount {
  _id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode?: string;
  iban?: string;
  country: string;
  currency: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminBankAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    swiftCode: '',
    iban: '',
    country: '',
    currency: 'USD'
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await getBankAccounts();
      console.log('Fetched accounts response:', response);

      // The backend returns { accounts: [...] }
      const accountsData = response.data?.accounts || response.accounts || [];

      console.log('Extracted accounts data:', accountsData);

      if (Array.isArray(accountsData)) {
        setAccounts(accountsData);
      } else {
        console.error('Invalid accounts data format from API:', accountsData);
        setAccounts([]);
      }
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAccount) {
        // Update existing account
        const response = await updateBankAccount(editingAccount._id, formData);
        console.log('Update account response:', response);

        // Extract the updated account from the response
        const updatedAccount = response.data?.account || response.account;
        if (updatedAccount) {
          setAccounts(accounts.map(account =>
            account._id === editingAccount._id ? updatedAccount : account
          ));
        } else {
          // Fallback: use the original approach
          setAccounts(accounts.map(account =>
            account._id === editingAccount._id
              ? { ...account, ...formData, updatedAt: new Date().toISOString() }
              : account
          ));
        }
        setEditingAccount(null);
      } else {
        // Create new account
        const response = await createBankAccount(formData);
        console.log('Create account response:', response);

        // Extract the account from the response
        const newAccount = response.data?.account || response.account;
        if (newAccount) {
          setAccounts([...accounts, newAccount]);
        } else {
          console.error('No account data in response:', response);
          // Fallback: refetch all accounts
          fetchAccounts();
        }
      }

      resetForm();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to save bank account:', error);
      alert('Failed to save bank account. Please try again.');
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;

    try {
      await deleteBankAccount(accountId);
      setAccounts(accounts.filter(account => account._id !== accountId));
    } catch (error) {
      console.error('Failed to delete bank account:', error);
      alert('Failed to delete bank account. Please try again.');
    }
  };

  const handleToggleActive = async (account: BankAccount) => {
    try {
      const response = await updateBankAccount(account._id, { active: !account.active });
      console.log('Toggle account response:', response);

      // Extract the updated account from the response
      const updatedAccount = response.data?.account || response.account;
      if (updatedAccount) {
        setAccounts(accounts.map(a => a._id === account._id ? updatedAccount : a));
      } else {
        // Fallback: use the original approach
        const localUpdatedAccount = { ...account, active: !account.active };
        setAccounts(accounts.map(a => a._id === account._id ? localUpdatedAccount : a));
      }
    } catch (error) {
      console.error('Failed to toggle account status:', error);
      alert('Failed to update account status. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      bankName: '',
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      swiftCode: '',
      iban: '',
      country: '',
      currency: 'USD'
    });
    setEditingAccount(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return '****' + accountNumber.slice(-4);
  };

  // Filter accounts (ensure accounts is always an array)
  const filteredAccounts = (accounts || []).filter(account => {
    const matchesSearch = (account.bankName && account.bankName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (account.accountName && account.accountName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (account.country && account.country.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCountry = countryFilter === 'all' || account.country === countryFilter;

    return matchesSearch && matchesCountry;
  });

  const countries = [...new Set((accounts || []).map(account => account.country).filter(Boolean))];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Accounts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage bank accounts for receiving wire transfers and deposits
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setCountryFilter('all');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAccounts.map((account) => (
          <div key={account._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{account.bankName}</h3>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span>{account.country}</span>
                    <span>•</span>
                    <span>{account.currency}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleActive(account)}
                  className="flex items-center"
                >
                  {account.active ? (
                    <ToggleRight className="h-6 w-6 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Account Name</label>
                <p className="text-sm text-gray-900">{account.accountName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Account Number</label>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm bg-gray-50 px-2 py-1 rounded border text-gray-800">
                      {maskAccountNumber(account.accountNumber)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(account.accountNumber)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Copy account number"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Routing Number</label>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm bg-gray-50 px-2 py-1 rounded border text-gray-800">
                      {account.routingNumber}
                    </code>
                    <button
                      onClick={() => copyToClipboard(account.routingNumber)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Copy routing number"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {(account.swiftCode || account.iban) && (
                <div className="grid grid-cols-2 gap-3">
                  {account.swiftCode && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">SWIFT Code</label>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-50 px-2 py-1 rounded border text-gray-800">
                          {account.swiftCode}
                        </code>
                        <button
                          onClick={() => copyToClipboard(account.swiftCode!)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Copy SWIFT code"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {account.iban && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">IBAN</label>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-50 px-2 py-1 rounded border text-gray-800 break-all">
                          {account.iban}
                        </code>
                        <button
                          onClick={() => copyToClipboard(account.iban!)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Copy IBAN"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                {account.active ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className={`text-sm ${account.active ? 'text-green-600' : 'text-gray-500'}`}>
                  {account.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingAccount(account);
                    setFormData({
                      bankName: account.bankName,
                      accountName: account.accountName,
                      accountNumber: account.accountNumber,
                      routingNumber: account.routingNumber,
                      swiftCode: account.swiftCode || '',
                      iban: account.iban || '',
                      country: account.country,
                      currency: account.currency
                    });
                    setShowCreateModal(true);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Edit account"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(account._id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Delete account"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredAccounts.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bank accounts found</h3>
          <p className="text-gray-500 mb-4">
            {accounts.length === 0
              ? "Get started by creating your first bank account for receiving wire transfers and deposits."
              : "No bank accounts match your current filter criteria."
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Bank Account
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., JPMorgan Chase Bank"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., Zentroe Investment LLC"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter account number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Routing Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.routingNumber}
                      onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter routing number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Country</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Switzerland">Switzerland</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      required
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="CHF">CHF - Swiss Franc</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SWIFT Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.swiftCode}
                      onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., CHASUS33"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IBAN (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., GB82WEST12345698765432"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {editingAccount ? 'Update Account' : 'Create Account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBankAccounts;

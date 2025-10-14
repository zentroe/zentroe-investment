import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Wallet,
  Search,
  Copy,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getCryptoWallets, createCryptoWallet, updateCryptoWallet, deleteCryptoWallet } from '@/services/adminService';

interface CryptoWallet {
  _id: string;
  name: string;
  address: string;
  network?: string;
  icon: string; // Cloudinary URL - required
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminCryptoWallets: React.FC = () => {
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState<CryptoWallet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [networkFilter, setNetworkFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    network: '',
    icon: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [iconPreview, setIconPreview] = useState<string>('');

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const response = await getCryptoWallets();

      // The backend returns { wallets: [...] }
      const walletsData = response.data?.wallets || response.wallets || [];

      console.log('Fetched wallets response:', response);
      console.log('Extracted wallets data:', walletsData);

      // Ensure we have an array
      if (Array.isArray(walletsData)) {
        setWallets(walletsData);
      } else {
        console.error('Invalid data format from API:', walletsData);
        setWallets([]);
      }
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      setWallets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.address) {
      alert('Please fill in all required fields');
      return;
    }

    // For new wallets, icon is required
    if (!editingWallet && !selectedFile && (!formData.icon || formData.icon.trim() === '')) {
      alert('Please select an icon image');
      return;
    }

    // Debug logging
    console.log('Form submission:', {
      editingWallet: !!editingWallet,
      selectedFile: !!selectedFile,
      currentIcon: formData.icon,
      hasIconPreview: !!iconPreview
    });

    try {
      let iconUrl = formData.icon;

      // Upload new icon if a file was selected
      if (selectedFile) {
        console.log('Uploading file to Cloudinary...');
        iconUrl = await uploadIconToCloudinary(selectedFile);
        console.log('Upload completed, received URL:', iconUrl);
      }

      // Ensure we have a valid icon URL
      if (!iconUrl || iconUrl.trim() === '') {
        console.error('No valid icon URL:', iconUrl);
        alert('Failed to get icon URL. Please try uploading the image again.');
        return;
      }

      const walletData = {
        ...formData,
        icon: iconUrl
      };

      console.log('Submitting wallet data:', walletData);

      if (editingWallet) {
        // Update existing wallet
        const response = await updateCryptoWallet(editingWallet._id, walletData);
        console.log('Update wallet response:', response);

        // Extract the updated wallet from the response
        const updatedWallet = response.data?.wallet || response.wallet;
        if (updatedWallet) {
          setWallets(wallets.map(wallet =>
            wallet._id === editingWallet._id ? updatedWallet : wallet
          ));
        } else {
          // Fallback: use the original approach
          setWallets(wallets.map(wallet =>
            wallet._id === editingWallet._id
              ? { ...wallet, ...walletData, updatedAt: new Date().toISOString() }
              : wallet
          ));
        }
        setEditingWallet(null);
      } else {
        // Create new wallet
        const response = await createCryptoWallet(walletData);
        console.log('Create wallet response:', response);

        // Extract the wallet from the response
        const newWallet = response.data?.wallet || response.wallet;
        if (newWallet) {
          setWallets([...wallets, newWallet]);
        } else {
          console.error('No wallet data in response:', response);
          // Fallback: refetch all wallets
          fetchWallets();
        }
      }

      resetForm();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to save wallet:', error);
      alert('Failed to save wallet. Please try again.');
    }
  };

  const handleDelete = async (walletId: string) => {
    if (!confirm('Are you sure you want to delete this wallet?')) return;

    try {
      await deleteCryptoWallet(walletId);
      setWallets(wallets.filter(wallet => wallet._id !== walletId));
    } catch (error) {
      console.error('Failed to delete wallet:', error);
      alert('Failed to delete wallet. Please try again.');
    }
  };

  const handleToggleActive = async (wallet: CryptoWallet) => {
    try {
      const updatedWallet = { ...wallet, active: !wallet.active };
      await updateCryptoWallet(wallet._id, { active: !wallet.active });
      setWallets(wallets.map(w => w._id === wallet._id ? updatedWallet : w));
    } catch (error) {
      console.error('Failed to toggle wallet status:', error);
      alert('Failed to update wallet status. Please try again.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setIconPreview(previewUrl);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadIconToCloudinary = async (file: File): Promise<string> => {
    try {
      setUploadingIcon(true);
      console.log('Starting file upload for:', file.name, file.size, 'bytes');

      // Convert file to base64
      const fileData = await convertFileToBase64(file);
      console.log('File converted to base64, length:', fileData.length);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData,
          folder: 'zentroe/crypto-wallets'
        }),
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload response error:', errorText);
        throw new Error(`Failed to upload image: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Upload response data:', data);

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      console.log('Upload successful, URL:', data.data.secure_url);
      return data.data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    } finally {
      setUploadingIcon(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', address: '', network: '', icon: '' });
    setEditingWallet(null);
    setSelectedFile(null);
    setIconPreview('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Filter wallets
  const filteredWallets = (wallets || []).filter(wallet => {
    const matchesSearch = (wallet.name && wallet.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (wallet.address && wallet.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (wallet.network && wallet.network.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesNetwork = networkFilter === 'all' || wallet.network === networkFilter;

    return matchesSearch && matchesNetwork;
  }); const networks = [...new Set((wallets || []).map(wallet => wallet.network).filter(Boolean))];

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
          <h1 className="text-2xl font-bold text-gray-900">Crypto Wallets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage cryptocurrency wallet addresses for accepting deposits
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Wallet
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
                placeholder="Search wallets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Network</label>
            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Networks</option>
              {networks.map(network => (
                <option key={network} value={network}>{network}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setNetworkFilter('all');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWallets.map((wallet) => (
          <div key={wallet._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center overflow-hidden">
                  {wallet.icon ? (
                    <img
                      src={wallet.icon}
                      alt={`${wallet.name} icon`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Wallet className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{wallet.name}</h3>
                  {wallet.network && <p className="text-sm text-gray-500">{wallet.network}</p>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleActive(wallet)}
                  className="flex items-center"
                >
                  {wallet.active ? (
                    <ToggleRight className="h-6 w-6 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-sm bg-gray-50 px-2 py-1 rounded border text-gray-800 break-all">
                  {wallet.address}
                </code>
                <button
                  onClick={() => copyToClipboard(wallet.address)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Copy address"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {wallet.active ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className={`text-sm ${wallet.active ? 'text-green-600' : 'text-gray-500'}`}>
                  {wallet.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingWallet(wallet);
                    setFormData({
                      name: wallet.name,
                      address: wallet.address,
                      network: wallet.network || '',
                      icon: wallet.icon
                    });
                    setIconPreview(''); // Reset preview since we're showing existing icon
                    setSelectedFile(null);
                    setShowCreateModal(true);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Edit wallet"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(wallet._id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Delete wallet"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredWallets.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No crypto wallets found</h3>
          <p className="text-gray-500 mb-4">
            {wallets.length === 0
              ? "Get started by creating your first crypto wallet for receiving deposits."
              : "No wallets match your current filter criteria."
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Wallet
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingWallet ? 'Edit Wallet' : 'Add New Wallet'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wallet Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., Bitcoin Main Wallet"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Network <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.network}
                      onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., ERC-20, TRC-20, BEP-20 (leave empty for native tokens like BTC, ETH)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter wallet address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon <span className="text-red-500">*</span>
                    </label>

                    {/* Icon Preview */}
                    <div className="mb-3">
                      {(iconPreview || formData.icon) && (
                        <div className="flex items-center space-x-3">
                          <img
                            src={iconPreview || formData.icon}
                            alt="Icon preview"
                            className="w-12 h-12 object-cover rounded-lg border"
                          />
                          <span className="text-sm text-gray-600">
                            {iconPreview ? 'New icon selected' : 'Current icon'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* File Upload */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${!editingWallet && !selectedFile && (!formData.icon || formData.icon.trim() === '')
                          ? 'border border-red-300' : ''
                          }`}
                        required={!editingWallet && (!formData.icon || formData.icon.trim() === '')}
                      />
                      {uploadingIcon && (
                        <div className="text-blue-600 text-sm">Uploading...</div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload an image file (PNG, JPG, SVG). Max 5MB.
                      {!editingWallet && !selectedFile && (!formData.icon || formData.icon.trim() === '') && (
                        <span className="text-red-500 ml-1">This field is required.</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={uploadingIcon || (!editingWallet && !selectedFile && (!formData.icon || formData.icon.trim() === ''))}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploadingIcon ? 'Uploading...' : editingWallet ? 'Update Wallet' : 'Create Wallet'}
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

export default AdminCryptoWallets;

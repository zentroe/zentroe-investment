import React, { useState, useEffect } from 'react';
import {
  Clock,
  User,
  Settings,
  Shield,
  DollarSign,
  Eye,
  Search,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  // Trash2
} from 'lucide-react';

interface ActivityLog {
  id: string;
  timestamp: string;
  userId?: string;
  adminId?: string;
  action: string;
  category: 'auth' | 'user' | 'payment' | 'system' | 'security';
  description: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

const AdminActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(50);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);

      // Mock data - in production, this would come from API
      const mockLogs: ActivityLog[] = [
        {
          id: '1',
          timestamp: '2024-01-15T10:30:00Z',
          adminId: 'admin-1',
          action: 'LOGIN',
          category: 'auth',
          description: 'Admin user logged in successfully',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Chrome)',
          status: 'success'
        },
        {
          id: '2',
          timestamp: '2024-01-15T10:25:00Z',
          userId: 'user-123',
          action: 'DEPOSIT_APPROVED',
          category: 'payment',
          description: 'Deposit of $5,000 approved for user john.doe@email.com',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Chrome)',
          status: 'success',
          metadata: { amount: 5000, currency: 'USD', method: 'bank_transfer' }
        },
        {
          id: '3',
          timestamp: '2024-01-15T10:20:00Z',
          userId: 'user-456',
          action: 'KYC_REJECTED',
          category: 'user',
          description: 'KYC verification rejected for user jane.smith@email.com - Invalid document',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Chrome)',
          status: 'warning',
          metadata: { reason: 'Invalid document', documentType: 'passport' }
        },
        {
          id: '4',
          timestamp: '2024-01-15T10:15:00Z',
          adminId: 'admin-1',
          action: 'PAYMENT_CONFIG_UPDATED',
          category: 'system',
          description: 'Updated payment configuration - Disabled card payments',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Chrome)',
          status: 'success',
          metadata: { field: 'cardPaymentEnabled', oldValue: true, newValue: false }
        },
        {
          id: '5',
          timestamp: '2024-01-15T10:10:00Z',
          userId: 'user-789',
          action: 'FAILED_LOGIN',
          category: 'security',
          description: 'Failed login attempt for user test@example.com - Invalid password',
          ipAddress: '10.0.0.50',
          userAgent: 'Mozilla/5.0 (Firefox)',
          status: 'error',
          metadata: { attempts: 3, locked: false }
        },
        {
          id: '6',
          timestamp: '2024-01-15T10:05:00Z',
          adminId: 'admin-1',
          action: 'CRYPTO_WALLET_CREATED',
          category: 'payment',
          description: 'Created new cryptocurrency wallet for Bitcoin',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Chrome)',
          status: 'success',
          metadata: { network: 'bitcoin', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' }
        },
        {
          id: '7',
          timestamp: '2024-01-15T10:00:00Z',
          userId: 'user-321',
          action: 'PROFILE_UPDATED',
          category: 'user',
          description: 'User updated profile information',
          ipAddress: '203.0.113.10',
          userAgent: 'Mozilla/5.0 (Safari)',
          status: 'success',
          metadata: { fields: ['phone', 'address'] }
        },
        {
          id: '8',
          timestamp: '2024-01-15T09:55:00Z',
          adminId: 'admin-1',
          action: 'BANK_ACCOUNT_DELETED',
          category: 'payment',
          description: 'Deleted bank account for Wells Fargo',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Chrome)',
          status: 'warning',
          metadata: { bankName: 'Wells Fargo', accountNumber: '****1234' }
        }
      ];

      setTimeout(() => {
        setLogs(mockLogs);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'user':
        return <User className="h-4 w-4 text-green-500" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-purple-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />;
      case 'security':
        return <Shield className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor all system activities and user actions
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={fetchActivityLogs}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="auth">Authentication</option>
              <option value="user">User Management</option>
              <option value="payment">Payment</option>
              <option value="system">System</option>
              <option value="security">Security</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <button className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Calendar className="h-4 w-4 mr-2" />
              Last 7 days
            </button>
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity ({filteredLogs.length} logs)
            </h3>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {startIndex + 1}-{Math.min(startIndex + logsPerPage, filteredLogs.length)} of {filteredLogs.length}
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {paginatedLogs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 flex items-center space-x-2">
                  {getStatusIcon(log.status)}
                  {getCategoryIcon(log.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-medium text-gray-900">{log.action}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.category === 'auth' ? 'bg-blue-100 text-blue-800' :
                          log.category === 'user' ? 'bg-green-100 text-green-800' :
                            log.category === 'payment' ? 'bg-purple-100 text-purple-800' :
                              log.category === 'system' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                        }`}>
                        {log.category}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </div>

                  <p className="mt-1 text-sm text-gray-600">{log.description}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span>IP: {log.ipAddress}</span>
                    {log.userId && <span>User ID: {log.userId}</span>}
                    {log.adminId && <span>Admin ID: {log.adminId}</span>}
                    {log.metadata && (
                      <button className="inline-flex items-center text-blue-600 hover:text-blue-800">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + logsPerPage, filteredLogs.length)} of {filteredLogs.length} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredLogs.length === 0 && !loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search criteria or check back later.</p>
          <button
            onClick={fetchActivityLogs}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Logs
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminActivityLogs;

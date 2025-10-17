import React, { useState, useEffect } from 'react';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  UserPlus,
  Shield,
  LogIn,
  Briefcase,
  DollarSign,
  Edit,
  Trash2,
  Filter,
  X,
  Plus,
  Loader2
} from 'lucide-react';
import {
  Activity,
  getUserActivity,
  deleteActivity,
  deleteGeneratedActivities
} from '@/services/adminUserService';
import { toast } from 'sonner';
import EditActivityModal from './EditActivityModal';
import CreateActivityModal from './CreateActivityModal';

interface UserActivityHistoryProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const activityTypeConfig = {
  deposit: { icon: ArrowDownCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Deposit' },
  withdrawal: { icon: ArrowUpCircle, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Withdrawal' },
  investment: { icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Investment' },
  return: { icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Return' },
  dividend: { icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Dividend' },
  referral: { icon: UserPlus, color: 'text-pink-600', bg: 'bg-pink-100', label: 'Referral' },
  kyc_update: { icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'KYC Update' },
  login: { icon: LogIn, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Login' },
  portfolio_change: { icon: Briefcase, color: 'text-cyan-600', bg: 'bg-cyan-100', label: 'Portfolio Change' },
  bonus: { icon: DollarSign, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Bonus' }
};

const UserActivityHistory: React.FC<UserActivityHistoryProps> = ({ userId, isOpen, onClose }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterType, setFilterType] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen, page, filterType, userId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await getUserActivity(userId, {
        page,
        limit: 20,
        activityType: filterType || undefined
      });
      setActivities(response.activities);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      toast.error('Failed to load activity history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      setDeleting(activityId);
      await deleteActivity(activityId);
      toast.success('Activity deleted successfully');
      fetchActivities();
    } catch (error) {
      console.error('Failed to delete activity:', error);
      toast.error('Failed to delete activity');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteGenerated = async () => {
    if (!confirm('Are you sure you want to delete ALL generated activities? This cannot be undone.')) return;

    try {
      setLoading(true);
      const response = await deleteGeneratedActivities(userId);
      toast.success(`Deleted ${response.deletedCount} generated activities`);
      fetchActivities();
    } catch (error) {
      console.error('Failed to delete generated activities:', error);
      toast.error('Failed to delete generated activities');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedActivity(null);
    fetchActivities();
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchActivities();
  };

  if (!isOpen) return null;

  const getActivityIcon = (type: string) => {
    const config = activityTypeConfig[type as keyof typeof activityTypeConfig];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>
    );
  };

  const formatAmount = (amount?: number, currency?: string) => {
    if (!amount) return null;
    return `${amount >= 0 ? '+' : ''}$${Math.abs(amount).toLocaleString()} ${currency || 'USD'}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Activity History</h2>
            <p className="text-sm text-gray-500 mt-1">{total} total activities</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="investment">Investments</option>
                <option value="return">Returns</option>
                <option value="referral">Referrals</option>
                <option value="login">Logins</option>
                <option value="kyc_update">KYC Updates</option>
                <option value="portfolio_change">Portfolio Changes</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Activity
              </button>
              <button
                onClick={handleDeleteGenerated}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 border border-red-200"
              >
                Delete Generated
              </button>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No activities found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity._id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${activity.isGenerated ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {getActivityIcon(activity.activityType)}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {activityTypeConfig[activity.activityType as keyof typeof activityTypeConfig]?.label || activity.activityType}
                          </h3>
                          {activity.isGenerated && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Generated
                            </span>
                          )}
                          {activity.status && (
                            <span className={`px-2 py-0.5 text-xs rounded-full ${activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                                activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  activity.status === 'failed' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                              }`}>
                              {activity.status}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatDate(activity.date)}</span>
                          {activity.transactionId && (
                            <span className="font-mono">{activity.transactionId}</span>
                          )}
                          {activity.amount && (
                            <span className={`font-semibold ${activity.activityType === 'deposit' || activity.activityType === 'return' ? 'text-green-600' :
                                activity.activityType === 'withdrawal' ? 'text-orange-600' :
                                  'text-blue-600'
                              }`}>
                              {formatAmount(activity.amount, activity.currency)}
                            </span>
                          )}
                        </div>

                        {activity.notes && (
                          <p className="text-xs text-gray-500 mt-2 italic">{activity.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(activity)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(activity._id)}
                        disabled={deleting === activity._id}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100 disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === activity._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between p-6 border-t">
            <p className="text-sm text-gray-600">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-1 bg-blue-50 text-blue-600 rounded-md">
                {page}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= total}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditModal && selectedActivity && (
        <EditActivityModal
          activity={selectedActivity}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedActivity(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {showCreateModal && (
        <CreateActivityModal
          userId={userId}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default UserActivityHistory;

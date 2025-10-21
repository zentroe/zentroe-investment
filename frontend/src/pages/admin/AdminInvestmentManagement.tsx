import { useEffect, useState } from 'react';
import axios from '@/utils/axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Pause,
  Play,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Trash2,
  Edit2,
  Calendar,
  Check,
  X
} from 'lucide-react';
import { updateUserInvestmentDetails } from '@/services/adminService';
import { toast } from 'sonner';

interface Investment {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  investmentPlan: {
    name: string;
    profitPercentage: number;
    duration: number;
  };
  amount: number;
  status: 'pending' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  totalProfitsEarned: number;
  dailyProfitRate: number;
  createdAt: string;
}

export default function AdminInvestmentManagement() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [editedStartDate, setEditedStartDate] = useState('');
  const [editedProfits, setEditedProfits] = useState('');

  useEffect(() => {
    fetchInvestments();
  }, [statusFilter, searchTerm]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '50',
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      console.log('🔍 Fetching investments with URL:', `/admin/investments?${params}`);

      const response = await axios.get(`/admin/investments?${params}`);
      console.log('� Raw API response:', response.data);

      let filteredInvestments = response.data.investments || [];
      console.log('💼 Investments array:', filteredInvestments);
      console.log('🔢 Number of investments:', filteredInvestments.length);

      // Client-side search filter
      if (searchTerm) {
        filteredInvestments = filteredInvestments.filter((inv: Investment) =>
          `${inv.user.firstName} ${inv.user.lastName} ${inv.user.email}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      }

      setInvestments(filteredInvestments);
    } catch (error) {
      console.error('❌ Failed to fetch investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvestmentAction = async (investmentId: string, action: 'pause' | 'resume' | 'complete') => {
    try {
      await axios.put(`/admin/investments/${investmentId}/${action}`, {
        reason: action === 'pause' ? 'Admin action' : undefined
      });

      fetchInvestments(); // Refresh the list
      alert(`Investment ${action}d successfully!`);
    } catch (error) {
      console.error(`Failed to ${action} investment:`, error);
      alert(`Failed to ${action} investment`);
    }
  };

  const handleDeleteInvestment = async (investment: Investment) => {
    const confirmMessage = `Are you sure you want to delete this investment?\n\n` +
      `User: ${investment.user.firstName} ${investment.user.lastName}\n` +
      `Amount: ${formatCurrency(investment.amount)}\n` +
      `Plan: ${investment.investmentPlan.name}\n` +
      `Status: ${investment.status}\n\n` +
      `This action cannot be undone!`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await axios.delete(`/admin/investments/${investment._id}`);
      fetchInvestments(); // Refresh the list
      alert('Investment deleted successfully!');
    } catch (error) {
      console.error('Failed to delete investment:', error);
      alert('Failed to delete investment. Please try again.');
    }
  };

  const startEditingInvestment = (investment: Investment) => {
    setEditingInvestment(investment);

    // Format the date for the datetime-local input
    const date = new Date(investment.startDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

    setEditedStartDate(formattedDate);
    setEditedProfits(investment.totalProfitsEarned.toString());
  };

  const cancelEditingInvestment = () => {
    setEditingInvestment(null);
    setEditedStartDate('');
    setEditedProfits('');
  };

  const handleUpdateInvestment = async () => {
    if (!editingInvestment) return;

    try {
      const updateData: { startDate?: string; totalProfitsEarned?: number } = {};

      // Check if start date changed
      const originalDate = new Date(editingInvestment.startDate);
      const newDate = new Date(editedStartDate);
      if (editedStartDate && newDate.getTime() !== originalDate.getTime()) {
        updateData.startDate = editedStartDate;
      }

      // Check if profits changed
      const newProfits = parseFloat(editedProfits);
      if (!isNaN(newProfits) && newProfits !== editingInvestment.totalProfitsEarned) {
        updateData.totalProfitsEarned = newProfits;
      }

      // Only make the API call if something changed
      if (Object.keys(updateData).length === 0) {
        toast.info('No changes detected');
        cancelEditingInvestment();
        return;
      }

      await updateUserInvestmentDetails(editingInvestment._id, updateData);
      toast.success('Investment updated successfully!');

      // Refresh the investments list to get the updated end date
      await fetchInvestments();

      cancelEditingInvestment();
    } catch (error: any) {
      console.error('Failed to update investment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update investment';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investment Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all user investments</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchInvestments()}
            className="bg-green-600 hover:bg-green-700"
          >
            🔄 Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Investments</p>
                <p className="text-2xl font-bold">{investments.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {investments.filter(inv => inv.status === 'active').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(investments.reduce((sum, inv) => sum + inv.amount, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Profits</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(investments.reduce((sum, inv) => sum + inv.totalProfitsEarned, 0))}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>All Investments ({investments.length})</CardTitle>
              <CardDescription>Manage and monitor user investments with real-time controls</CardDescription>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : investments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No investments found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {investments.map((investment) => (
                <div
                  key={investment._id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {investment.user.firstName} {investment.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{investment.user.email}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Investment ID: {investment._id.slice(-8)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(investment.status)}>
                        {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatCurrency(investment.amount)}</p>
                        <p className="text-sm text-gray-600">
                          {investment.investmentPlan.name}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          {investment.investmentPlan.profitPercentage}% APY
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          onClick={() => startEditingInvestment(investment)}
                          className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Button>

                        {investment.status === 'active' && (
                          <Button
                            variant="outline"
                            onClick={() => handleInvestmentAction(investment._id, 'pause')}
                            className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                          >
                            <Pause className="h-4 w-4" />
                            Pause
                          </Button>
                        )}

                        {investment.status === 'paused' && (
                          <Button
                            variant="outline"
                            onClick={() => handleInvestmentAction(investment._id, 'resume')}
                            className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Play className="h-4 w-4" />
                            Resume
                          </Button>
                        )}

                        {(investment.status === 'active' || investment.status === 'paused') && (
                          <Button
                            onClick={() => handleInvestmentAction(investment._id, 'complete')}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Complete
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          onClick={() => handleDeleteInvestment(investment)}
                          className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Start Date</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {formatDate(investment.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">End Date</p>
                      <p className="font-medium">{formatDate(investment.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Profits Earned</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(investment.totalProfitsEarned)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Daily Rate</p>
                      <p className="font-medium">{investment.dailyProfitRate.toFixed(4)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Duration</p>
                      <p className="font-medium">{investment.investmentPlan.duration} days</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Investment Modal */}
      {editingInvestment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Investment Details</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {editingInvestment.user.firstName} {editingInvestment.user.lastName} - {editingInvestment.investmentPlan.name}
                </p>
              </div>
              <button
                onClick={cancelEditingInvestment}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Investment Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Investment Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700">Investment Amount</p>
                    <p className="font-bold text-blue-900">{formatCurrency(editingInvestment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Status</p>
                    <Badge className={getStatusColor(editingInvestment.status)}>
                      {editingInvestment.status.charAt(0).toUpperCase() + editingInvestment.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-blue-700">Plan</p>
                    <p className="font-medium text-blue-900">{editingInvestment.investmentPlan.name}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Duration</p>
                    <p className="font-medium text-blue-900">{editingInvestment.investmentPlan.duration} days</p>
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editedStartDate}
                    onChange={(e) => setEditedStartDate(e.target.value)}
                    max={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {formatDate(editingInvestment.startDate)}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Note: Changing the start date will automatically recalculate the end date based on the plan duration ({editingInvestment.investmentPlan.duration} days)
                  </p>
                </div>

                {/* Total Profits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="h-4 w-4 inline mr-2" />
                    Total Profits Earned
                  </label>
                  <Input
                    type="number"
                    value={editedProfits}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedProfits(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full"
                    placeholder="Enter total profits"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {formatCurrency(editingInvestment.totalProfitsEarned)}
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Warning:</strong> These changes will directly affect the user's investment.
                  Make sure you have verified the information before saving.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <Button
                onClick={cancelEditingInvestment}
                variant="outline"
                className="border-gray-300"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleUpdateInvestment}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
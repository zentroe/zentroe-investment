import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Plus,
  Pencil,
  Trash2,
  Power,
  Search,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getAllInvestmentPlans,
  createInvestmentPlan,
  updateInvestmentPlan,
  deleteInvestmentPlan,
  toggleInvestmentPlanStatus,
  type InvestmentPlan,
  type PieChartData,
  type TabContent
} from '@/services/adminService';

interface InvestmentPlanFormData {
  name: string;
  description: string;
  category: 'retirement' | 'starter' | 'highGrowth' | 'default';
  profitPercentage: number;
  duration: number; // Investment duration in days
  minInvestment: number;
  maxInvestment: number | '';
  pieChartData: PieChartData[];
  supplementalTabs: {
    best: TabContent[];
    strategy: TabContent[];
    assets: TabContent[];
  };
  priority: number;
  targetIncomeRanges: string[];
  targetInvestmentAmounts: string[];
  targetAccountTypes: string[];
}

const defaultFormData: InvestmentPlanFormData = {
  name: '',
  description: '',
  category: 'default',
  profitPercentage: 8,
  duration: 365, // Default 1 year
  minInvestment: 1000,
  maxInvestment: '',
  pieChartData: [
    { name: 'Private credit', value: 80, color: '#6B8FAE' },
    { name: 'Real estate', value: 20, color: '#B4C8D1' }
  ],
  supplementalTabs: {
    best: [
      { title: '', desc: '' },
      { title: '', desc: '' }
    ],
    strategy: [
      { title: '', desc: '' },
      { title: '', desc: '' }
    ],
    assets: [
      { title: '', desc: '' },
      { title: '', desc: '' }
    ]
  },
  priority: 0,
  targetIncomeRanges: [],
  targetInvestmentAmounts: [],
  targetAccountTypes: []
};

const AdminInvestmentPlans: React.FC = () => {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);
  const [formData, setFormData] = useState<InvestmentPlanFormData>(defaultFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await getAllInvestmentPlans();
      setPlans(response.investmentPlans || []);
    } catch (error) {
      console.error('Error fetching investment plans:', error);
      toast.error('Failed to fetch investment plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setFormData(defaultFormData);
    setShowForm(true);
  };

  const handleEditPlan = (plan: InvestmentPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      category: plan.category,
      profitPercentage: plan.profitPercentage,
      duration: plan.duration,
      minInvestment: plan.minInvestment,
      maxInvestment: plan.maxInvestment || '',
      pieChartData: plan.pieChartData,
      supplementalTabs: plan.supplementalTabs,
      priority: plan.priority,
      targetIncomeRanges: plan.targetIncomeRanges,
      targetInvestmentAmounts: plan.targetInvestmentAmounts,
      targetAccountTypes: plan.targetAccountTypes
    });
    setShowForm(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        maxInvestment: formData.maxInvestment === '' ? undefined : formData.maxInvestment
      };

      if (editingPlan) {
        await updateInvestmentPlan(editingPlan._id, submitData);
        toast.success('Investment plan updated successfully');
      } else {
        await createInvestmentPlan(submitData);
        toast.success('Investment plan created successfully');
      }

      setShowForm(false);
      setEditingPlan(null);
      setFormData(defaultFormData);
      fetchPlans();
    } catch (error) {
      console.error('Error saving investment plan:', error);
      toast.error('Failed to save investment plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this investment plan? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteInvestmentPlan(planId);
      toast.success('Investment plan deleted successfully');
      fetchPlans();
    } catch (error) {
      console.error('Error deleting investment plan:', error);
      toast.error('Failed to delete investment plan');
    }
  };

  const handleToggleStatus = async (planId: string) => {
    try {
      await toggleInvestmentPlanStatus(planId);
      toast.success('Investment plan status updated successfully');
      fetchPlans();
    } catch (error) {
      console.error('Error toggling investment plan status:', error);
      toast.error('Failed to update investment plan status');
    }
  };

  const updatePieChartData = (index: number, field: keyof PieChartData, value: string | number) => {
    const newPieData = [...formData.pieChartData];
    newPieData[index] = { ...newPieData[index], [field]: value };
    setFormData({ ...formData, pieChartData: newPieData });
  };

  const addPieChartEntry = () => {
    setFormData({
      ...formData,
      pieChartData: [...formData.pieChartData, { name: '', value: 0, color: '#000000' }]
    });
  };

  const removePieChartEntry = (index: number) => {
    const newPieData = formData.pieChartData.filter((_, i) => i !== index);
    setFormData({ ...formData, pieChartData: newPieData });
  };

  const updateTabContent = (tabType: 'best' | 'strategy' | 'assets', index: number, field: keyof TabContent, value: string) => {
    const newTabs = { ...formData.supplementalTabs };
    newTabs[tabType][index] = { ...newTabs[tabType][index], [field]: value };
    setFormData({ ...formData, supplementalTabs: newTabs });
  };

  const addTabContent = (tabType: 'best' | 'strategy' | 'assets') => {
    const newTabs = { ...formData.supplementalTabs };
    newTabs[tabType].push({ title: '', desc: '' });
    setFormData({ ...formData, supplementalTabs: newTabs });
  };

  const removeTabContent = (tabType: 'best' | 'strategy' | 'assets', index: number) => {
    const newTabs = { ...formData.supplementalTabs };
    newTabs[tabType] = newTabs[tabType].filter((_, i) => i !== index);
    setFormData({ ...formData, supplementalTabs: newTabs });
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || plan.category === filterCategory;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && plan.isActive) ||
      (filterStatus === 'inactive' && !plan.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Investment Plans Management | Zentroe Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Investment Plans</h1>
              <p className="text-gray-600 mt-2">Create and manage investment recommendation plans</p>
            </div>
            <button
              onClick={handleCreatePlan}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Plan
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="retirement">Retirement</option>
                  <option value="starter">Starter</option>
                  <option value="highGrowth">High Growth</option>
                  <option value="default">Default</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchPlans}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Plans List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Investment Plans ({filteredPlans.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Returns & Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investment Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlans.map((plan) => (
                    <tr key={plan._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{plan.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${plan.category === 'retirement' ? 'bg-blue-100 text-blue-800' :
                          plan.category === 'starter' ? 'bg-green-100 text-green-800' :
                            plan.category === 'highGrowth' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {plan.category === 'highGrowth' ? 'High Growth' : plan.category.charAt(0).toUpperCase() + plan.category.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{plan.profitPercentage}%</div>
                        <div className="text-sm text-gray-500">
                          in {plan.duration} days
                          {plan.duration === 365 ? ' (1 year)' :
                            plan.duration === 30 ? ' (1 month)' :
                              plan.duration === 7 ? ' (1 week)' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${plan.minInvestment.toLocaleString()}
                          {plan.maxInvestment ? ` - $${plan.maxInvestment.toLocaleString()}` : '+'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {plan.priority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditPlan(plan)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit plan"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(plan._id)}
                            className={`${plan.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} transition-colors`}
                            title={plan.isActive ? 'Deactivate plan' : 'Activate plan'}
                          >
                            <Power className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete plan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPlans.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">No investment plans found</div>
                  <button
                    onClick={handleCreatePlan}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Create Your First Plan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingPlan ? 'Edit Investment Plan' : 'Create Investment Plan'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Retirement Income Strategy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="retirement">Retirement</option>
                    <option value="starter">Starter</option>
                    <option value="highGrowth">High Growth</option>
                    <option value="default">Default</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Percentage (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1000"
                    value={formData.profitPercentage}
                    onChange={(e) => setFormData({ ...formData, profitPercentage: parseFloat(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="8.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">Profit percentage after duration completes</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Duration (Days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="365"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Duration in days (365 = 1 year, 30 = 1 month, 7 = 1 week)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Higher numbers appear first in recommendations</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Investment *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minInvestment}
                    onChange={(e) => setFormData({ ...formData, minInvestment: parseInt(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Investment
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxInvestment}
                    onChange={(e) => setFormData({ ...formData, maxInvestment: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Leave empty for no maximum"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Designed for long-term income generation and portfolio stability..."
                />
              </div>

              {/* Pie Chart Data */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Asset Allocation</h3>
                  <button
                    type="button"
                    onClick={addPieChartEntry}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Asset
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.pieChartData.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-3 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updatePieChartData(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Private credit"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.value}
                          onChange={(e) => updatePieChartData(index, 'value', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="80"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                        <div className="flex gap-2 items-center">
                          <div className="relative">
                            <input
                              type="color"
                              value={item.color}
                              onChange={(e) => updatePieChartData(index, 'color', e.target.value)}
                              className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                              style={{
                                background: item.color,
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                appearance: 'none'
                              }}
                            />
                          </div>
                          <input
                            type="text"
                            value={item.color}
                            onChange={(e) => {
                              let value = e.target.value;
                              // Ensure it starts with # and only contains valid hex characters
                              if (!value.startsWith('#')) {
                                value = '#' + value.replace('#', '');
                              }
                              // Limit to 7 characters max (#FFFFFF)
                              value = value.substring(0, 7);
                              // Only allow valid hex characters
                              const hexPattern = /^#[0-9A-Fa-f]*$/;
                              if (hexPattern.test(value)) {
                                updatePieChartData(index, 'color', value);
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="#6B8FAE"
                            pattern="^#[0-9A-Fa-f]{6}$"
                          />
                          {formData.pieChartData.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePieChartEntry(index)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove entry"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Use color picker or enter hex code</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supplemental Tabs */}
              {(['best', 'strategy', 'assets'] as const).map((tabType) => (
                <div key={tabType}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 capitalize">
                      {tabType === 'best' ? 'Best For' : tabType} Content
                    </h3>
                    <button
                      type="button"
                      onClick={() => addTabContent(tabType)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add {tabType === 'best' ? 'Best For' : tabType}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.supplementalTabs[tabType].map((content, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={content.title}
                              onChange={(e) => updateTabContent(tabType, index, 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={`${tabType === 'best' ? 'Those near or in retirement' : 'Long-term income generation'}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={content.desc}
                              onChange={(e) => updateTabContent(tabType, index, 'desc', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Detailed description of this point..."
                            />
                          </div>
                          {formData.supplementalTabs[tabType].length > 1 && (
                            <div className="text-right">
                              <button
                                type="button"
                                onClick={() => removeTabContent(tabType, index)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminInvestmentPlans;
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { getProfitDashboard } from "@/services/userInvestmentService";
import NewInvestmentModal from "@/components/modals/NewInvestmentModal";
import { Button } from "@/components/ui/button";

export default function PortfolioPage() {
  const { investments, investmentSummary, loading, refreshInvestments } = useUser();
  const [performanceData, setPerformanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewInvestmentModal, setShowNewInvestmentModal] = useState(false);

  // Color palette for different investment types
  const investmentColors = {
    'Real Estate': '#2563eb',
    'Private Credit': '#06b6d4',
    'Venture Capital': '#8b5cf6',
    'Agriculture': '#10b981',
    'Fixed Income': '#f59e0b',
    'Technology': '#ef4444',
    'Healthcare': '#84cc16',
    'Energy': '#f97316',
    'default': '#6b7280'
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);
      const data = await getProfitDashboard(180); // 6 months of data

      if (data.chartData && data.chartData.length > 0) {
        const transformedData = data.chartData.map((item: any) => ({
          month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
          value: item.totalProfit || 0
        }));
        setPerformanceData(transformedData);
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate portfolio allocation data from investments
  const generatePortfolioData = () => {
    if (!investments || investments.length === 0) return [];

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const allocationMap = new Map();

    investments.forEach(investment => {
      const planName = investment.investmentPlan?.name || 'Other';
      const amount = investment.amount;

      if (allocationMap.has(planName)) {
        allocationMap.set(planName, allocationMap.get(planName) + amount);
      } else {
        allocationMap.set(planName, amount);
      }
    });

    return Array.from(allocationMap.entries()).map(([name, amount]) => ({
      name,
      value: Math.round((amount / totalInvested) * 100),
      color: investmentColors[name as keyof typeof investmentColors] || investmentColors.default
    }));
  };

  // Generate holdings data from investments
  const generateHoldingsData = () => {
    if (!investments || investments.length === 0) return [];

    const totalValue = investmentSummary?.totalInvested || investments.reduce((sum, inv) => sum + inv.amount, 0);

    return investments.map(investment => {
      const allocation = ((investment.amount / totalValue) * 100).toFixed(1);
      const currentValue = investment.amount + (investment.totalProfitsEarned || 0);
      const profitLoss = investment.totalProfitsEarned || 0;
      const profitPercent = investment.amount > 0 ? ((profitLoss / investment.amount) * 100).toFixed(1) : '0.0';

      return {
        name: investment.investmentPlan?.name || 'Investment Plan',
        allocation: `${allocation}%`,
        value: `$${currentValue.toLocaleString()}`,
        change: `${profitLoss >= 0 ? '+' : ''}${profitPercent}%`,
        isPositive: profitLoss >= 0
      };
    });
  };

  // Calculate summary metrics
  const totalInvested = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
  const portfolioValue = totalInvested + (investmentSummary?.totalProfits || 0);
  const totalReturns = investmentSummary?.totalProfits || 0;
  const returnPercentage = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(1) : '0.0';
  const monthlyIncome = totalReturns / 12; // Estimated monthly income

  const portfolioChartData = generatePortfolioData();
  const holdingsData = generateHoldingsData();

  if (loading.investments) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  const handleInvestmentSuccess = () => {
    // Refresh investments data after successful investment
    refreshInvestments();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Portfolio Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Track your investment performance and allocation</p>
        </div>
        <Button
          onClick={() => setShowNewInvestmentModal(true)}
          className="bg-primary flex flex-col md:flex-row items-center hover:bg-primary/90 text-white"
        >
          <Plus size={16} className="mr-2" />
          New Investment
        </Button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                ${portfolioValue.toLocaleString()}
              </p>
              <div className={`flex items-center mt-2 ${parseFloat(returnPercentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(returnPercentage) >= 0 ? (
                  <TrendingUp size={16} className="mr-1" />
                ) : (
                  <TrendingDown size={16} className="mr-1" />
                )}
                <span className="text-sm font-medium">{returnPercentage}%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Briefcase size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Invested</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                ${totalInvested.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {investments?.length || 0} investments
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Returns</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                ${totalReturns.toLocaleString()}
              </p>
              <div className={`flex items-center mt-2 ${totalReturns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalReturns >= 0 ? (
                  <TrendingUp size={16} className="mr-1" />
                ) : (
                  <TrendingDown size={16} className="mr-1" />
                )}
                <span className="text-sm font-medium">
                  {totalReturns >= 0 ? '+' : ''}${Math.abs(totalReturns).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Est. Monthly Income</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                ${Math.round(monthlyIncome).toLocaleString()}
              </p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp size={16} className="mr-1" />
                <span className="text-sm font-medium">
                  {((monthlyIncome / totalInvested) * 100 * 12).toFixed(1)}% annual
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <DollarSign size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
          {portfolioChartData.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {portfolioChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {portfolioChartData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p>No investment data available</p>
                <p className="text-sm mt-1">Make your first investment to see allocation</p>
              </div>
            </div>
          )}
        </div>

        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h3>
          {performanceData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-gray-500">Loading performance data...</div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p>No performance data available</p>
                <p className="text-sm mt-1">Performance data will appear after your first investment</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Holdings</h3>
        {holdingsData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Investment</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Allocation</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Performance</th>
                </tr>
              </thead>
              <tbody>
                {holdingsData.map((holding, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">{holding.name}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{holding.allocation}</td>
                    <td className="py-4 px-4 font-medium text-gray-900">{holding.value}</td>
                    <td className="py-4 px-4">
                      <span className={`flex items-center ${holding.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {holding.isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                        {holding.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Briefcase size={48} className="mx-auto mb-3 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No investments yet</h4>
            <p>Start building your portfolio by making your first investment.</p>
            <Button
              onClick={() => setShowNewInvestmentModal(true)}
              className="mt-4 bg-primary text-white hover:bg-primary/90"
            >
              <Plus size={16} className="mr-2" />
              Start Investing
            </Button>
          </div>
        )}
      </div>

      {/* New Investment Modal */}
      <NewInvestmentModal
        isOpen={showNewInvestmentModal}
        onClose={() => setShowNewInvestmentModal(false)}
        onSuccess={handleInvestmentSuccess}
      />
    </div>
  );
}

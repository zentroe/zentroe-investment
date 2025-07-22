import { TrendingUp, TrendingDown, DollarSign, Briefcase } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const portfolioData = [
  { name: "Real Estate", value: 45, color: "#2563eb" },
  { name: "Private Credit", value: 30, color: "#06b6d4" },
  { name: "Venture Capital", value: 15, color: "#8b5cf6" },
  { name: "Agriculture", value: 10, color: "#10b981" },
];

const performanceData = [
  { month: "Jan", value: 4000 },
  { month: "Feb", value: 4200 },
  { month: "Mar", value: 4100 },
  { month: "Apr", value: 4300 },
  { month: "May", value: 4500 },
  { month: "Jun", value: 4700 },
];

const holdings = [
  {
    name: "European Real Estate Fund",
    allocation: "35%",
    value: "$87,500",
    change: "+12.5%",
    isPositive: true
  },
  {
    name: "Private Credit Portfolio",
    allocation: "30%",
    value: "$75,000",
    change: "+8.2%",
    isPositive: true
  },
  {
    name: "Tech Venture Fund",
    allocation: "15%",
    value: "$37,500",
    change: "-2.1%",
    isPositive: false
  },
  {
    name: "Agricultural Assets",
    allocation: "20%",
    value: "$50,000",
    change: "+15.3%",
    isPositive: true
  }
];

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Portfolio Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Track your investment performance and allocation</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">$250,000</p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp size={16} className="mr-1" />
                <span className="text-sm font-medium">+8.5%</span>
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
              <p className="text-2xl font-semibold text-gray-900 mt-1">$230,000</p>
              <p className="text-sm text-gray-500 mt-2">Since inception</p>
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
              <p className="text-2xl font-semibold text-gray-900 mt-1">$20,000</p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp size={16} className="mr-1" />
                <span className="text-sm font-medium">+8.7%</span>
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
              <p className="text-sm font-medium text-gray-600">Monthly Income</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">$1,850</p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp size={16} className="mr-1" />
                <span className="text-sm font-medium">+3.2%</span>
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
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {portfolioData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h3>
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
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Holdings</h3>
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
              {holdings.map((holding, index) => (
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
      </div>
    </div>
  );
}

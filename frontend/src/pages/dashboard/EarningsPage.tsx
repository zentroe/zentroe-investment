import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react";

const earningsData = [
  {
    date: "2024-01-15",
    source: "European Real Estate Fund",
    type: "Dividend",
    amount: 1250.00,
    status: "Paid"
  },
  {
    date: "2024-01-10",
    source: "Private Credit Portfolio",
    type: "Interest",
    amount: 850.00,
    status: "Paid"
  },
  {
    date: "2024-01-05",
    source: "Agricultural Assets",
    type: "Distribution",
    amount: 420.00,
    status: "Paid"
  },
  {
    date: "2023-12-28",
    source: "Tech Venture Fund",
    type: "Capital Gain",
    amount: 2100.00,
    status: "Paid"
  },
  {
    date: "2023-12-15",
    source: "European Real Estate Fund",
    type: "Dividend",
    amount: 1250.00,
    status: "Paid"
  }
];

const upcomingPayments = [
  {
    date: "2024-02-15",
    source: "European Real Estate Fund",
    type: "Dividend",
    estimated: 1300.00
  },
  {
    date: "2024-02-10",
    source: "Private Credit Portfolio",
    type: "Interest",
    estimated: 875.00
  }
];

export default function EarningsPage() {
  const totalEarnings = earningsData.reduce((sum, earning) => sum + earning.amount, 0);
  const monthlyAverage = totalEarnings / 12;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Earnings</h1>
          <p className="text-sm text-gray-500 mt-1">Track your investment income and distributions</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download size={16} className="mr-2" />
          Export Report
        </button>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings YTD</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">${totalEarnings.toLocaleString()}</p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp size={16} className="mr-1" />
                <span className="text-sm font-medium">+12.5%</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Average</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">${monthlyAverage.toFixed(0)}</p>
              <p className="text-sm text-gray-500 mt-2">Last 12 months</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">$1,850</p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp size={16} className="mr-1" />
                <span className="text-sm font-medium">+8.2%</span>
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <DollarSign size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Yield Rate</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">8.7%</p>
              <p className="text-sm text-gray-500 mt-2">Annualized</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Payments */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Payments</h3>
        <div className="space-y-4">
          {upcomingPayments.map((payment, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{payment.source}</p>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <Calendar size={14} className="mr-1" />
                  <span>{new Date(payment.date).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>{payment.type}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${payment.estimated.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Estimated</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Source</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {earningsData.map((earning, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-600">
                    {new Date(earning.date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900">{earning.source}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {earning.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-gray-900">
                    ${earning.amount.toFixed(2)}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {earning.status}
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

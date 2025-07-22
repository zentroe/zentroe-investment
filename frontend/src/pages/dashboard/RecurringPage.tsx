import { useState } from "react";
import { Play, Pause, Edit, Plus, Calendar, DollarSign } from "lucide-react";

const recurringInvestments = [
  {
    id: 1,
    name: "European Real Estate Fund",
    amount: 1000,
    frequency: "Monthly",
    nextDate: "2024-02-01",
    status: "Active",
    totalInvested: 12000
  },
  {
    id: 2,
    name: "Private Credit Portfolio",
    amount: 500,
    frequency: "Bi-weekly",
    nextDate: "2024-01-28",
    status: "Active",
    totalInvested: 13000
  },
  {
    id: 3,
    name: "Tech Venture Fund",
    amount: 250,
    frequency: "Weekly",
    nextDate: "2024-01-25",
    status: "Paused",
    totalInvested: 3250
  }
];

export default function RecurringPage() {
  const [investments, setInvestments] = useState(recurringInvestments);

  const toggleStatus = (id: number) => {
    setInvestments(prev => prev.map(inv =>
      inv.id === id
        ? { ...inv, status: inv.status === "Active" ? "Paused" : "Active" }
        : inv
    ));
  };

  const totalMonthlyInvestment = investments
    .filter(inv => inv.status === "Active")
    .reduce((sum, inv) => {
      const multiplier = inv.frequency === "Monthly" ? 1 : inv.frequency === "Bi-weekly" ? 2 : 4;
      return sum + (inv.amount * multiplier);
    }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Recurring Investments</h1>
          <p className="text-sm text-gray-500 mt-1">Automate your investment strategy</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={16} className="mr-2" />
          Add New Plan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Investment</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">${totalMonthlyInvestment.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">Across all active plans</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Plans</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {investments.filter(inv => inv.status === "Active").length}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {investments.filter(inv => inv.status === "Paused").length} paused
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Play size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Investment</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">Jan 25</p>
              <p className="text-sm text-gray-500 mt-2">Tech Venture Fund</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <Calendar size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Investment Plans */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Investment Plans</h3>

        <div className="space-y-4">
          {investments.map((investment) => (
            <div key={investment.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{investment.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        ${investment.amount} • {investment.frequency} • Next: {investment.nextDate}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${investment.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                          }`}>
                          {investment.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Invested</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        ${investment.totalInvested.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Monthly Est.</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        ${(investment.amount * (investment.frequency === "Monthly" ? 1 : investment.frequency === "Bi-weekly" ? 2 : 4)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-6">
                  <button
                    onClick={() => toggleStatus(investment.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title={investment.status === "Active" ? "Pause" : "Resume"}
                  >
                    {investment.status === "Active" ? (
                      <Pause size={20} className="text-gray-600" />
                    ) : (
                      <Play size={20} className="text-green-600" />
                    )}
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
                    <Edit size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Recurring Investments Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-semibold">1</span>
            </div>
            <h4 className="font-medium text-gray-900">Set Your Schedule</h4>
            <p className="text-sm text-gray-600 mt-1">Choose how much and how often you want to invest</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-semibold">2</span>
            </div>
            <h4 className="font-medium text-gray-900">Automated Investing</h4>
            <p className="text-sm text-gray-600 mt-1">We automatically invest your chosen amount on schedule</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-semibold">3</span>
            </div>
            <h4 className="font-medium text-gray-900">Track Progress</h4>
            <p className="text-sm text-gray-600 mt-1">Monitor your investments and adjust as needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

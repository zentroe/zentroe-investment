import { useState } from "react";
import { TrendingUp, ArrowUpRight } from "lucide-react";

export default function TotalSales() {
  const [timeframe, setTimeframe] = useState("Monthly");

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Investment Returns</h3>
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option>Monthly</option>
            <option>Weekly</option>
            <option>Yearly</option>
          </select>
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
            <TrendingUp size={16} className="text-white" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Investment Metrics */}
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-white rounded-xl border">
            <div>
              <span className="text-sm text-gray-600">Real Estate Portfolio</span>
              <div className="flex items-center mt-1">
                <ArrowUpRight size={14} className="text-green-600 mr-1" />
                <span className="text-xs text-green-600 font-medium">+8.2%</span>
              </div>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">$245,500</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-primary to-orange-600 h-2.5 rounded-full shadow-sm" style={{ width: '75%' }}></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-white rounded-xl border">
            <div>
              <span className="text-sm text-gray-600">Private Credit</span>
              <div className="flex items-center mt-1">
                <ArrowUpRight size={14} className="text-green-600 mr-1" />
                <span className="text-xs text-green-600 font-medium">+15.7%</span>
              </div>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">$89,200</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 h-2.5 rounded-full shadow-sm" style={{ width: '60%' }}></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-white rounded-xl border">
            <div>
              <span className="text-sm text-gray-600">Agriculture Fund</span>
              <div className="flex items-center mt-1">
                <ArrowUpRight size={14} className="text-green-600 mr-1" />
                <span className="text-xs text-green-600 font-medium">+12.1%</span>
              </div>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">$67,100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2.5 rounded-full shadow-sm" style={{ width: '68%' }}></div>
          </div>
        </div>

        {/* Summary */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl">
            <div>
              <span className="text-sm font-medium text-gray-900">Total Portfolio Value</span>
              <div className="flex items-center mt-1">
                <TrendingUp size={14} className="text-green-600 mr-1" />
                <span className="text-sm font-semibold text-green-600">+12.5% growth</span>
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">$401,800</span>
          </div>
        </div>
      </div>
    </div>
  );
}

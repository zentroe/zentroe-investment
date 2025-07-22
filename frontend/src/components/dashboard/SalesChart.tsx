import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const salesData = [
  { month: "Jan", sales: 18, cost: 13 },
  { month: "Feb", sales: 33, cost: 26 },
  { month: "Mar", sales: 28, cost: 14 },
  { month: "Apr", sales: 10, cost: 8 },
  { month: "May", sales: 33, cost: 9 },
  { month: "Jun", sales: 16, cost: 22 },
  { month: "Jul", sales: 18, cost: 29 },
  { month: "Aug", sales: 26, cost: 18 },
  { month: "Sep", sales: 20, cost: 16 },
  { month: "Oct", sales: 10, cost: 12 },
  { month: "Nov", sales: 12, cost: 11 },
];

export default function SalesChart() {
  const [timeframe, setTimeframe] = useState("Monthly");

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">$855.8K</h3>
          <p className="text-sm text-gray-500">Gross Sales</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Sales</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Cost</span>
            </div>
          </div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Monthly</option>
            <option>Weekly</option>
            <option>Yearly</option>
          </select>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              domain={[0, 35]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar
              dataKey="sales"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
              name="Sales"
            />
            <Bar
              dataKey="cost"
              fill="#fb923c"
              radius={[4, 4, 0, 0]}
              name="Cost"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

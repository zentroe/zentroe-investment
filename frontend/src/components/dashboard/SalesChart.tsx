import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getProfitDashboard } from "@/services/userInvestmentService";

export default function SalesChart() {
  const [timeframe, setTimeframe] = useState("Monthly");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get days based on timeframe
      let days = 30;
      if (timeframe === "Weekly") days = 7;
      if (timeframe === "Yearly") days = 365;

      const data = await getProfitDashboard(days);

      // Transform data for chart
      if (data.chartData && data.chartData.length > 0) {
        const transformedData = data.chartData.map((item: any) => ({
          date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: timeframe === "Weekly" ? 'numeric' : undefined
          }),
          profits: item.totalProfit || 0,
          investments: item.count || 0
        }));
        setChartData(transformedData);
        setTotalValue(data.summary?.totalProfits || 0);
      } else {
        // Fallback empty data
        setChartData([]);
        setTotalValue(0);
      }
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      setChartData([]);
      setTotalValue(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">${totalValue.toLocaleString()}</h3>
          <p className="text-sm text-gray-500">Total Profits Earned</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Profits</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Count</span>
            </div>
          </div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option>Monthly</option>
            <option>Weekly</option>
            <option>Yearly</option>
          </select>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No profit data available yet
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="profits" fill="#3b82f6" radius={4} />
              <Bar dataKey="investments" fill="#fb923c" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { getProfitDashboard } from '@/services/userInvestmentService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Calendar, Activity } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProfitData {
  date: string;
  totalProfit: number;
  count: number;
}

interface DashboardSummary {
  totalProfits: number;
  totalInvestments: number;
  activeInvestments: number;
  totalInvested: number;
  avgDailyProfit: number;
  profitDays: number;
}

export default function InvestmentGrowthChart() {
  const [chartData, setChartData] = useState<ProfitData[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState(30);

  useEffect(() => {
    fetchProfitData();
  }, [timeframe]);

  const fetchProfitData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfitDashboard(timeframe);
      setChartData(data.chartData || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError('Failed to load profit data');
      console.error('Fetch profit data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    const dates = chartData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Calculate cumulative profits
    let cumulativeProfit = 0;
    const cumulativeData = chartData.map(item => {
      cumulativeProfit += item.totalProfit;
      return cumulativeProfit;
    });

    return {
      labels: dates,
      datasets: [
        {
          label: 'Daily Profit',
          data: chartData.map(item => item.totalProfit),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        },
        {
          label: 'Cumulative Profit',
          data: cumulativeData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(16, 185, 129)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold' as const
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: $${value.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          },
          callback: (value: any) => '$' + value.toFixed(0)
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Investment Growth
          </CardTitle>
          <CardDescription>Daily profit tracking and cumulative growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Investment Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Total Profits</p>
                  <p className="text-2xl font-bold text-green-600">${summary.totalProfits.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Active Investments</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.activeInvestments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Avg Daily Profit</p>
                  <p className="text-2xl font-bold text-purple-600">${summary.avgDailyProfit.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Profit Days</p>
                  <p className="text-2xl font-bold text-orange-600">{summary.profitDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Investment Growth
              </CardTitle>
              <CardDescription>Daily profit tracking and cumulative growth</CardDescription>
            </div>
            <div className="flex gap-2">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setTimeframe(days)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${timeframe === days
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-80">
              <Line data={prepareChartData()} options={chartOptions} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No profit data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
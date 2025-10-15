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
import { TrendingUp } from 'lucide-react';

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
    const isMobile = window.innerWidth < 640;

    const labels = chartData.map(item => {
      const date = new Date(item.date);
      return isMobile
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).replace(' ', '\n')
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const dailyProfits = chartData.map(item => item.totalProfit);

    // Calculate cumulative profits
    const cumulativeData = [];
    let cumulative = 0;
    for (const profit of dailyProfits) {
      cumulative += profit;
      cumulativeData.push(cumulative);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Daily Profit',
          data: dailyProfits,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: isMobile ? 1.5 : 2,
          fill: true,
          tension: 0.4,
          pointRadius: isMobile ? 2 : 3,
          pointHoverRadius: isMobile ? 5 : 6,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: isMobile ? 1 : 2,
        },
        {
          label: 'Cumulative Profit',
          data: cumulativeData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: isMobile ? 1.5 : 2,
          fill: false,
          tension: 0.4,
          pointRadius: isMobile ? 2 : 3,
          pointHoverRadius: isMobile ? 5 : 6,
          pointBackgroundColor: 'rgb(16, 185, 129)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: isMobile ? 1 : 2,
        }
      ]
    };
  };

  // Mobile-responsive chart options
  const getChartOptions = () => {
    const isMobile = window.innerWidth < 640; // sm breakpoint

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      plugins: {
        legend: {
          position: isMobile ? 'bottom' as const : 'top' as const,
          labels: {
            usePointStyle: true,
            padding: isMobile ? 12 : 20,
            font: {
              size: isMobile ? 10 : 12,
              weight: 'bold' as const
            },
            boxWidth: isMobile ? 8 : 12,
            boxHeight: isMobile ? 8 : 12
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
          padding: isMobile ? 8 : 12,
          titleFont: {
            size: isMobile ? 12 : 14
          },
          bodyFont: {
            size: isMobile ? 11 : 13
          },
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: $${value.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            color: 'rgba(156, 163, 175, 0.1)',
            display: !isMobile, // Hide grid on mobile for cleaner look
          },
          ticks: {
            color: '#6b7280',
            font: {
              size: isMobile ? 10 : 11
            },
            maxTicksLimit: isMobile ? 5 : 10, // Fewer ticks on mobile
          }
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        y: {
          display: true,
          grid: {
            color: 'rgba(156, 163, 175, 0.1)',
          },
          ticks: {
            color: '#6b7280',
            font: {
              size: isMobile ? 10 : 11
            },
            callback: (value: any) => '$' + value.toFixed(0)
          }
        }
      },

      elements: {
        point: {
          hoverRadius: isMobile ? 6 : 8,
          radius: isMobile ? 2 : 3,
        },
      },
    };
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            Investment Growth
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Daily profit tracking and cumulative growth
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 space-y-3">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-gray-500">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm border-red-200">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-red-600">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            Investment Growth
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 space-y-3 text-center">
            <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
            <div>
              <p className="text-red-500 font-medium text-sm sm:text-base">Failed to load chart</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Stats - Currently Commented Out */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* <Card>
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
          </Card> */}
        </div>
      )}

      {/* Main Chart - Mobile Responsive */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                Investment Growth
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-1">
                Daily profit tracking and cumulative growth
              </CardDescription>
            </div>

            {/* Time Frame Selector - Mobile Optimized */}
            <div className="flex gap-1.5 sm:gap-2 bg-gray-100 rounded-lg p-1">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setTimeframe(days)}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-all duration-200 font-medium min-w-[40px] sm:min-w-[44px] ${timeframe === days
                      ? 'bg-primary text-white shadow-sm transform scale-105'
                      : 'text-gray-700 hover:bg-white hover:shadow-sm'
                    }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-6 pt-0">
          {chartData.length > 0 ? (
            <div className="h-64 sm:h-80 lg:h-96">
              <Line data={prepareChartData()} options={getChartOptions()} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 sm:h-64 space-y-3 text-center">
              <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              <div>
                <p className="text-gray-500 font-medium text-sm sm:text-base">No profit data available yet</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Start investing to see your growth chart
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
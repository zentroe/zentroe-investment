import { TrendingUp, DollarSign, Activity } from "lucide-react";
import { useUser } from "@/context/UserContext";

interface StatCard {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  isLoading?: boolean;
}

export default function DashboardStats() {
  const { investmentSummary, investments, loading, errors } = useUser();

  // Calculate total invested from individual investments if summary is missing it
  const calculateTotalInvested = () => {
    if (investmentSummary?.totalInvested) {
      return investmentSummary.totalInvested;
    }
    // Fallback: calculate from individual investments
    return investments.reduce((total, investment) => total + investment.amount, 0);
  };

  const generateStats = (): StatCard[] => {
    if (!investmentSummary && investments.length === 0) {
      return [
        {
          title: "Total Invested",
          value: "$0",
          icon: DollarSign,
          iconColor: "text-emerald-600",
          isLoading: loading.investments,
        },
        {
          title: "Total Profits",
          value: "$0",
          icon: TrendingUp,
          iconColor: "text-blue-600",
          isLoading: loading.investments,
        },
        {
          title: "Active Investments",
          value: "0",
          icon: Activity,
          iconColor: "text-orange-600",
          isLoading: loading.investments,
        }
      ];
    }

    return [
      {
        title: "Total Invested",
        value: `$${calculateTotalInvested()?.toLocaleString() || '0'}`,
        icon: DollarSign,
        iconColor: "text-emerald-600",
      },
      {
        title: "Total Profits",
        value: `$${investmentSummary?.totalProfits?.toLocaleString() || '0'}`,
        icon: TrendingUp,
        iconColor: "text-blue-600",
        change: (investmentSummary?.profitToday && investmentSummary.profitToday > 0) ? `+$${investmentSummary.profitToday}` : undefined,
        isPositive: (investmentSummary?.profitToday || 0) > 0,
      },
      {
        title: "Active Investments",
        value: investmentSummary?.activeInvestments?.toString() || investments.filter(inv => inv.status === 'active').length.toString() || '0',
        icon: Activity,
        iconColor: "text-orange-600",
      },
    ];
  };

  const stats = generateStats();

  if (errors.investments) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center py-4">
              <p className="text-red-500 text-sm">{errors.investments}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg bg-gray-50 ${stat.iconColor}`}>
              <stat.icon size={24} />
            </div>
            {stat.change && (
              <div
                className={`flex items-center text-sm font-medium ${stat.isPositive ? "text-green-600" : "text-red-600"
                  }`}
              >
                <span className="mr-1">{stat.isPositive ? "↗" : "↘"}</span>
                {stat.change}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              {stat.title}
            </h3>
            {stat.isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

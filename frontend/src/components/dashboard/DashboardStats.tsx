import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Users, BarChart3 } from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
}

const statsData: StatCard[] = [
  {
    title: "Total Orders",
    value: "16,520",
    change: "1.5%",
    isPositive: false,
    icon: ShoppingBag,
    iconColor: "text-pink-500",
  },
  {
    title: "Total Earnings",
    value: "67,000",
    change: "1.5%",
    isPositive: true,
    icon: DollarSign,
    iconColor: "text-green-500",
  },
  {
    title: "Total Revenue",
    value: "23,900",
    change: "1.5%",
    isPositive: true,
    icon: TrendingUp,
    iconColor: "text-orange-500",
  },
  {
    title: "Total Expenses",
    value: "12,500",
    change: "1.5%",
    isPositive: true,
    icon: BarChart3,
    iconColor: "text-blue-500",
  },
  {
    title: "Total Customer",
    value: "45,876",
    change: "1.5%",
    isPositive: true,
    icon: Users,
    iconColor: "text-blue-500",
  },
  {
    title: "Growth",
    value: "34,678",
    change: "1.5%",
    isPositive: false,
    icon: BarChart3,
    iconColor: "text-purple-500",
  },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statsData.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <div className="flex items-center mt-2">
                <span className="text-2xl font-semibold text-gray-900">{stat.value}</span>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-xs text-gray-500">Since Last Month</span>
                <div className={`flex items-center ml-2 ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.isPositive ? (
                    <TrendingUp size={12} className="mr-1" />
                  ) : (
                    <TrendingDown size={12} className="mr-1" />
                  )}
                  <span className="text-xs font-medium">{stat.change}</span>
                </div>
              </div>
            </div>
            <div className={`p-3 rounded-full bg-gray-50`}>
              <stat.icon size={24} className={stat.iconColor} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

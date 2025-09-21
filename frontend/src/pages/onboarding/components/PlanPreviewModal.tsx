import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { X } from "lucide-react";
import { type InvestmentPlan } from "@/services/onboardingService";

interface PlanPreviewModalProps {
  plan: InvestmentPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: InvestmentPlan) => void;
  loading?: boolean;
}

export default function PlanPreviewModal({
  plan,
  isOpen,
  onClose,
  onSelectPlan,
  loading = false
}: PlanPreviewModalProps) {
  const [tab, setTab] = useState("best");

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !plan) {
    return null;
  }

  const tabs = plan.supplementalTabs;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-sectra text-darkPrimary">Investment Plan Preview</h2>
            <p className="text-sm text-gray-600">Review the details of this investment plan</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="rounded-lg border p-6 gap-10">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-sectra text-darkPrimary">{plan.name}</h3>
                <Button
                  onClick={() => onSelectPlan(plan)}
                  disabled={loading}
                  className="bg-primary hover:bg-[#8c391e] text-white text-sm px-5 py-2"
                >
                  {loading ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Select This Plan"
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-600">{plan.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="font-semibold text-green-600">
                  {plan.profitPercentage}% return in {Math.round(plan.duration / 365 * 10) / 10} year{plan.duration !== 365 ? 's' : ''}
                </span>
                <span>
                  Min: ${plan.minInvestment.toLocaleString()}
                  {plan.maxInvestment && ` - Max: $${plan.maxInvestment.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between py-6 gap-6">
              <Tabs value={tab} onValueChange={setTab} className="w-full md:w-2/3">
                <TabsList className="bg-muted border rounded-full overflow-hidden">
                  <TabsTrigger value="best" className="px-4 py-1.5 text-xs md:text-sm cursor-pointer">
                    Best for
                  </TabsTrigger>
                  <TabsTrigger value="strategy" className="px-4 py-1.5 text-xs md:text-sm cursor-pointer">
                    Strategy
                  </TabsTrigger>
                  <TabsTrigger value="assets" className="px-4 py-1.5 text-xs md:text-sm cursor-pointer">
                    Asset classes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="best" className="mt-4 space-y-4">
                  {tabs.best.map((item, index) => (
                    <div key={index}>
                      <p className="text-sm font-semibold text-darkPrimary">{item.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="strategy" className="mt-4 space-y-4">
                  {tabs.strategy.map((item, index) => (
                    <div key={index}>
                      <p className="text-sm font-semibold text-darkPrimary">{item.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="assets" className="mt-4 space-y-4">
                  {tabs.assets.map((item, index) => (
                    <div key={index}>
                      <p className="text-sm font-semibold text-darkPrimary">{item.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              <div className="w-full md:w-64">
                <p className="text-sm text-gray-500 font-medium mb-2 uppercase">Asset Allocation</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={plan.pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {plan.pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="mt-4 text-sm text-gray-700 space-y-1">
                  {plan.pieChartData.map((item) => (
                    <li key={item.name} className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </span>
                      <span>{item.value}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
          <p className="text-sm text-gray-600">
            You can change your selection at any time during the onboarding process
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 py-2 text-sm"
            >
              Close Preview
            </Button>
            <Button
              onClick={() => onSelectPlan(plan)}
              disabled={loading}
              className="bg-primary hover:bg-[#8c391e] text-white text-sm px-5 py-2"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Select This Plan"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
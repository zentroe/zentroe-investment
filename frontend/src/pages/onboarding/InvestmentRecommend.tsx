import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import OnboardingLayout from "./OnboardingLayout";
import OtherPlans from "./components/OtherPlans";
import PlanPreviewModal from "./components/PlanPreviewModal";
import { useNavigate } from "react-router-dom";
import { saveRecommendedPortfolio, getInvestmentPlans, getUserOnboardingData, type InvestmentPlan } from "@/services/onboardingService";
import { toast } from "sonner";

// New recommendation logic using database plans
function getRecommendedPlan(userData: any, investmentPlans: InvestmentPlan[]): InvestmentPlan | null {
  console.log("🔍 getRecommendedPlan called with:", { userData, planCount: investmentPlans.length });

  if (!userData || investmentPlans.length === 0) {
    console.log("❌ No userData or no plans available");
    return null;
  }

  // Convert user's investment range to numeric values for comparison
  const getUserInvestmentRange = (rangeString: string): { min: number, max: number } => {
    // Normalize the string to handle both formats: "- " and " to "
    const normalizedRange = rangeString.replace(/ to /g, ' - ');

    const ranges: Record<string, { min: number, max: number }> = {
      'Less than $1,000': { min: 0, max: 999 },
      '$1,000 - $10,000': { min: 1000, max: 10000 },
      '$10,000 - $50,000': { min: 10000, max: 50000 },
      '$50,000 - $100,000': { min: 50000, max: 100000 },
      '$100,000 - $1,000,000': { min: 100000, max: 1000000 },
      'More than $1,000,000': { min: 1000000, max: Infinity }
    };

    console.log(`📊 Converting range string: "${rangeString}"`);
    console.log(`   Normalized to: "${normalizedRange}"`);
    const result = ranges[normalizedRange];
    if (!result) {
      console.warn(`⚠️ Unknown range string: "${normalizedRange}", using default`);
      return { min: 0, max: Infinity };
    }
    console.log(`   → min: ${result.min}, max: ${result.max}`);
    return result;
  };

  // Get user's investment range from their selection or actual amount
  const userRange = userData.annualInvestmentAmount
    ? getUserInvestmentRange(userData.annualInvestmentAmount)
    : { min: userData.initialInvestmentAmount || 0, max: userData.initialInvestmentAmount || Infinity };

  console.log(`💰 User's investment range: $${userRange.min.toLocaleString()} - $${userRange.max === Infinity ? '∞' : userRange.max.toLocaleString()}`);
  console.log(`   Based on annualInvestmentAmount: "${userData.annualInvestmentAmount}"`);
  console.log(`   initialInvestmentAmount: ${userData.initialInvestmentAmount || 'not set'}`);

  // Filter plans based on user profile matching
  const matchingPlans = investmentPlans.filter(plan => {
    console.log(`🔍 Checking plan "${plan.name}" against user profile:`);

    // CRITICAL: Check if there's ANY overlap between user's range and plan's range
    const planMin = plan.minInvestment || 0;
    const planMax = plan.maxInvestment || Infinity;

    console.log(`  - Plan min/max from DB: minInvestment=${plan.minInvestment}, maxInvestment=${plan.maxInvestment}`);

    // Special check: if user's minimum is above plan's maximum (and plan has a defined max), no match
    if (plan.maxInvestment && userRange.min > plan.maxInvestment) {
      console.log(`  ❌ User minimum ($${userRange.min.toLocaleString()}) is above plan maximum ($${plan.maxInvestment.toLocaleString()})`);
      return false;
    }

    // Ranges overlap if: userMin <= planMax AND userMax >= planMin
    const hasOverlap = userRange.min <= planMax && userRange.max >= planMin;

    console.log(`  - Range overlap check: ${hasOverlap}`);
    console.log(`    User range: $${userRange.min.toLocaleString()} - $${userRange.max === Infinity ? '∞' : userRange.max.toLocaleString()}`);
    console.log(`    Plan range: $${planMin.toLocaleString()} - $${planMax === Infinity ? '∞' : planMax.toLocaleString()}`);

    // If no overlap, exclude this plan immediately
    if (!hasOverlap) {
      console.log(`  ❌ No overlap between user range and plan range`);
      return false;
    }

    // Check account type matching
    const accountTypeMatch = !plan.targetAccountTypes.length ||
      plan.targetAccountTypes.includes(userData.accountType);
    console.log(`  - Account type match: ${accountTypeMatch} (user: ${userData.accountType}, targets: [${plan.targetAccountTypes.join(', ')}])`);

    // Check income range matching
    const incomeMatch = !plan.targetIncomeRanges.length ||
      plan.targetIncomeRanges.includes(userData.annualIncome);
    console.log(`  - Income match: ${incomeMatch} (user: ${userData.annualIncome}, targets: [${plan.targetIncomeRanges.join(', ')}])`);

    // Check investment amount matching (this is about their annual investment preference, not actual amount)
    const investmentMatch = !plan.targetInvestmentAmounts.length ||
      plan.targetInvestmentAmounts.includes(userData.annualInvestmentAmount);
    console.log(`  - Investment amount match: ${investmentMatch} (user: ${userData.annualInvestmentAmount}, targets: [${plan.targetInvestmentAmounts.join(', ')}])`);

    const isMatch = hasOverlap && accountTypeMatch && incomeMatch && investmentMatch;
    console.log(`  ✨ Overall match: ${isMatch}`);

    return isMatch;
  });

  console.log(`🎯 Found ${matchingPlans.length} matching plans:`, matchingPlans.map(p => p.name));

  // If we have matching plans, return the highest priority one
  if (matchingPlans.length > 0) {
    const topPlan = matchingPlans.sort((a, b) => b.priority - a.priority)[0];
    console.log(`✅ Returning top priority matching plan: ${topPlan.name} (priority: ${topPlan.priority})`);
    return topPlan;
  }

  console.log("🔄 No exact matches, trying fallback logic...");

  // Fallback: return highest priority plan that matches account type or category
  // BUT still respect the amount range overlap
  const fallbackPlans = investmentPlans.filter(plan => {
    // CRITICAL: Still check range overlap in fallback
    const planMin = plan.minInvestment || 0;
    const planMax = plan.maxInvestment || Infinity;
    const hasOverlap = userRange.min <= planMax && userRange.max >= planMin;

    if (!hasOverlap) {
      console.log(`🔍 Fallback: Skipping ${plan.name} - no range overlap`);
      console.log(`   User: $${userRange.min.toLocaleString()} - $${userRange.max === Infinity ? '∞' : userRange.max.toLocaleString()}`);
      console.log(`   Plan: $${planMin.toLocaleString()} - $${planMax === Infinity ? '∞' : planMax.toLocaleString()}`);
      return false;
    }

    if (userData.accountType === 'retirement') {
      console.log(`🔍 Fallback: Checking retirement plan ${plan.name}, category: ${plan.category}`);
      return plan.category === 'retirement';
    }
    if (userData.annualInvestmentAmount === 'Less than $1,000') {
      console.log(`🔍 Fallback: Checking starter plan ${plan.name}, category: ${plan.category}`);
      return plan.category === 'starter';
    }
    if (userData.annualIncome === 'More than $200,000') {
      console.log(`🔍 Fallback: Checking high growth plan ${plan.name}, category: ${plan.category}`);
      return plan.category === 'highGrowth';
    }
    console.log(`🔍 Fallback: Checking default plan ${plan.name}, category: ${plan.category}`);
    return plan.category === 'default';
  });

  console.log(`🔄 Found ${fallbackPlans.length} fallback plans:`, fallbackPlans.map(p => `${p.name} (${p.category})`));

  if (fallbackPlans.length > 0) {
    const topFallback = fallbackPlans.sort((a, b) => b.priority - a.priority)[0];
    console.log(`✅ Returning top fallback plan: ${topFallback.name} (priority: ${topFallback.priority})`);
    return topFallback;
  }

  console.log("🔄 No fallback matches, returning highest priority plan within range overlap...");

  // Final fallback: return highest priority active plan that has range overlap
  const plansInRange = investmentPlans.filter(plan => {
    const planMin = plan.minInvestment || 0;
    const planMax = plan.maxInvestment || Infinity;
    const hasOverlap = userRange.min <= planMax && userRange.max >= planMin;

    if (hasOverlap) {
      console.log(`✅ Plan ${plan.name} has range overlap`);
      console.log(`   User: $${userRange.min.toLocaleString()} - $${userRange.max === Infinity ? '∞' : userRange.max.toLocaleString()}`);
      console.log(`   Plan: $${planMin.toLocaleString()} - $${planMax === Infinity ? '∞' : planMax.toLocaleString()}`);
    }
    return hasOverlap;
  });

  if (plansInRange.length > 0) {
    const finalPlan = plansInRange.sort((a, b) => b.priority - a.priority)[0];
    console.log(`✅ Returning highest priority plan in range: ${finalPlan.name} (priority: ${finalPlan.priority})`);
    return finalPlan;
  }

  // Absolute final fallback: ONLY if no plans exist at all
  if (investmentPlans.length === 0) {
    console.log("❌ No plans available at all");
    return null;
  }

  // If we get here, it means NO plans match the user's range
  console.log("⚠️ CRITICAL: No plans match user's investment range!");
  console.log(`   User range: $${userRange.min.toLocaleString()} - $${userRange.max === Infinity ? '∞' : userRange.max.toLocaleString()}`);
  console.log(`   Available plans:`);
  investmentPlans.forEach(plan => {
    const planMin = plan.minInvestment || 0;
    const planMax = plan.maxInvestment || Infinity;
    console.log(`     - ${plan.name}: $${planMin.toLocaleString()} - $${planMax === Infinity ? '∞' : planMax.toLocaleString()}`);
  });

  // Don't return a mismatched plan - return null to show error message
  console.log("❌ Returning null - no suitable plans available");
  return null;
} export default function InvestmentRecommendation() {
  const [tab, setTab] = useState("best");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [recommendedPlan, setRecommendedPlan] = useState<InvestmentPlan | null>(null);

  // Modal state
  const [selectedPlanForPreview, setSelectedPlanForPreview] = useState<InvestmentPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  // Fetch user data to determine recommendation
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserOnboardingData();
        console.log('✅ User data response:', response);

        // The user data might be directly in response or in response.user
        const userData = response.user || response;
        console.log('👤 User object:', userData);
        console.log('🔍 User data keys:', Object.keys(userData || {}));

        setUserData(userData);
      } catch (error) {
        console.error('❌ Error fetching user data:', error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, []);  // Fetch investment plans from database
  useEffect(() => {
    const fetchInvestmentPlans = async () => {
      try {
        console.log("🔍 Fetching investment plans...");
        const response = await getInvestmentPlans();
        console.log("📊 Investment plans response:", response);
        console.log("📋 Plans array:", response.plans);
        console.log("🔢 Plans count:", response.count);

        // Log each plan's isActive status
        response.plans.forEach((plan: InvestmentPlan, index: number) => {
          console.log(`📋 Plan ${index + 1}: "${plan.name}" - isActive:`, plan.isActive, typeof plan.isActive);
        });

        // Since backend already filters for active plans, we can use all returned plans
        console.log("✅ Using all plans returned from backend (should already be active)");
        setInvestmentPlans(response.plans);
      } catch (error) {
        console.error("❌ Error fetching investment plans:", error);
        toast.error("Failed to load investment plans");
      } finally {
        setPlansLoading(false);
      }
    };

    fetchInvestmentPlans();
  }, []);

  // Update recommended plan when user data and plans are loaded
  useEffect(() => {
    if (userData && investmentPlans.length > 0) {
      console.log("🎯 Matching user data:", userData);
      console.log("📋 Available plans for matching:", investmentPlans);

      const recommended = getRecommendedPlan(userData, investmentPlans);
      console.log("✨ Recommended plan result:", recommended);

      setRecommendedPlan(recommended);
    } else {
      console.log("⏳ Waiting for data - userData:", !!userData, "plans count:", investmentPlans.length);
    }
  }, [userData, investmentPlans]);

  const handleSelectRecommendation = async () => {
    if (!recommendedPlan) {
      toast.error("No investment plan selected");
      return;
    }

    setLoading(true);
    try {
      await saveRecommendedPortfolio(recommendedPlan._id);
      toast.success("Investment recommendation saved");
      navigate("/onboarding/personal-intro");
    } catch (error) {
      console.error("Failed to save investment recommendation:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handlePlanPreview = (plan: InvestmentPlan) => {
    setSelectedPlanForPreview(plan);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPlanForPreview(null);
  };

  const handleSelectFromModal = async (plan: InvestmentPlan) => {
    setLoading(true);
    try {
      await saveRecommendedPortfolio(plan._id);
      toast.success("Investment plan selected successfully");
      navigate("/onboarding/personal-intro");
    } catch (error) {
      console.error("Failed to save selected investment plan:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setIsModalOpen(false);
      setSelectedPlanForPreview(null);
    }
  };

  if (userLoading || plansLoading) {
    return (
      <OnboardingLayout>
        <div className="mt-16 px-4 max-w-4xl py-6 mx-auto flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </OnboardingLayout>
    );
  }

  if (!recommendedPlan) {
    return (
      <OnboardingLayout>
        <div className="mt-16 px-4 max-w-4xl py-6 mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Investment Plans Available</h2>
          <p className="text-gray-600">Please check back later or contact support.</p>
        </div>
      </OnboardingLayout>
    );
  }

  const tabs = recommendedPlan.supplementalTabs;

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Investment Recommendation | Zentroe</title>
      </Helmet>

      <div className="mt-16 px-4 max-w-4xl py-6 mx-auto space-y-10">
        <h2 className="text-xl text-gray-800 font-sectra font-medium">
          Based on your answers, here's our recommendation for you:
        </h2>

        <div className="rounded-lg border p-6 gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-sectra text-darkPrimary">{recommendedPlan.name}</h3>
              <Button
                onClick={handleSelectRecommendation}
                disabled={loading}
                className="bg-primary hover:bg-[#8c391e] text-white text-sm px-5 py-2"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Select"
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600">{recommendedPlan.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-semibold text-green-600">
                {recommendedPlan.profitPercentage}% return in {Math.round(recommendedPlan.duration / 365 * 10) / 10} year{recommendedPlan.duration !== 365 ? 's' : ''}
              </span>
              <span>
                Min: ${recommendedPlan.minInvestment.toLocaleString()}
                {recommendedPlan.maxInvestment && ` - Max: $${recommendedPlan.maxInvestment.toLocaleString()}`}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between py-6 gap-6">
            <Tabs value={tab} onValueChange={setTab} className="w-full md:w-2/3">
              <TabsList className="bg-muted border rounded-full overflow-hidden">
                <TabsTrigger value="best" className="px-4 py-1.5 text-sm md:text-sm cursor-pointer">
                  Best for
                </TabsTrigger>
                <TabsTrigger value="strategy" className="px-4 py-1.5 text-sm md:text-sm cursor-pointer">
                  Strategy
                </TabsTrigger>
                <TabsTrigger value="assets" className="px-4 py-1.5 text-sm md:text-sm cursor-pointer">
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
                    data={recommendedPlan.pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {recommendedPlan.pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-4 text-sm text-gray-700 space-y-1">
                {recommendedPlan.pieChartData.map((item) => (
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

        <div>
          <OtherPlans
            investmentPlans={investmentPlans}
            recommendedPlanId={recommendedPlan?._id}
            onPlanPreview={handlePlanPreview}
          />
        </div>
      </div>

      {/* Plan Preview Modal */}
      <PlanPreviewModal
        plan={selectedPlanForPreview}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSelectPlan={handleSelectFromModal}
        loading={loading}
      />
    </OnboardingLayout>
  );
}
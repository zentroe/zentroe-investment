import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import OnboardingLayout from "./OnboardingLayout";
import OtherPlans from "./components/OtherPlans";
import { Link } from "react-router-dom";
import { useOnboarding } from "@/context/OnboardingContext";

// Pie chart config
const pieData = [
  { name: "Private credit", value: 80, color: "#6B8FAE" },
  { name: "Real estate", value: 20, color: "#B4C8D1" },
];

// Tab content based on strategy
const supplementalTabs = {
  retirement: {
    best: [
      {
        title: "Those near or in retirement",
        desc:
          "This strategy offers reliable income streams designed to support living expenses during retirement, helping retirees preserve capital while meeting ongoing financial needs in a stable and predictable manner.",
      },
      {
        title: "Investors focused on stability",
        desc:
          "Perfect for individuals seeking low-volatility returns and a conservative growth approach, prioritizing capital preservation and peace of mind over chasing high but uncertain profits.",
      },
    ],
    strategy: [
      {
        title: "Long-term income generation",
        desc:
          "Focused on generating steady, dependable cash flow through diversified, income-producing assets that align with the financial goals of long-term retirees and conservative investors alike.",
      },
      {
        title: "Risk-managed allocation",
        desc:
          "Employs a cautious approach that diversifies across stable asset classes, aiming to minimize short-term losses while maintaining consistent performance over long horizons.",
      },
    ],
    assets: [
      {
        title: "Income-oriented real estate",
        desc:
          "Focuses on properties like apartments and industrial spaces that generate consistent rental income, offering a dependable foundation for income-focused investors.",
      },
      {
        title: "Private credit",
        desc:
          "Provides fixed-interest returns by lending to qualified borrowers, often with collateral backing, offering reduced volatility and consistent monthly income.",
      },
    ],
  },

  highGrowth: {
    best: [
      {
        title: "High-net-worth investors",
        desc:
          "Ideal for affluent individuals seeking aggressive expansion beyond traditional investments, balancing portfolio risk with exposure to alternative, high-yield private market opportunities.",
      },
      {
        title: "Those tolerant of market swings",
        desc:
          "Best suited for investors willing to endure short-term volatility in exchange for the potential of outsized, long-term gains in dynamic and high-growth sectors.",
      },
    ],
    strategy: [
      {
        title: "Aggressive diversification",
        desc:
          "Combines multiple alternative investment classes like real estate, private equity, and venture capital to pursue significant long-term capital appreciation and resilience across economic cycles.",
      },
      {
        title: "Access to exclusive deals",
        desc:
          "Enables exposure to premium private market opportunities, including tech startups and strategic funding rounds, typically reserved for institutional or accredited investors.",
      },
    ],
    assets: [
      {
        title: "Private tech & equity",
        desc:
          "Includes direct investment in venture-backed startups and pre-IPO companies that offer strong growth prospects but carry higher risk due to market fluctuations.",
      },
      {
        title: "Mixed-use real estate",
        desc:
          "Invests in commercial and residential properties in high-demand markets, targeting capital appreciation and diverse income sources from multi-use development projects.",
      },
    ],
  },

  starter: {
    best: [
      {
        title: "New & cautious investors",
        desc:
          "Tailored for first-time or cautious investors who prefer stability over high risk, allowing them to grow wealth gradually through secure and predictable investments.",
      },
      {
        title: "Those building capital",
        desc:
          "Suited for those in early wealth-building stages who want simple, repeatable investment structures that generate modest, but reliable returns for future reinvestment.",
      },
    ],
    strategy: [
      {
        title: "Lower risk entry point",
        desc:
          "Focused on safety and simplicity, this strategy balances affordability with financial growth, helping investors build confidence before progressing into more complex investments.",
      },
      {
        title: "Simple asset mix",
        desc:
          "Utilizes a balanced combination of low-volatility real estate and conservative credit products that require minimal management but still offer meaningful results over time.",
      },
    ],
    assets: [
      {
        title: "Low-volatility REITs",
        desc:
          "Real estate investment trusts (REITs) with consistent performance and minimal risk, ideal for generating returns without exposure to extreme market ups and downs.",
      },
      {
        title: "Secured credit notes",
        desc:
          "Short-duration, collateral-backed lending instruments that provide predictable income and lower risk than unsecured alternatives, making them ideal for cautious investors.",
      },
    ],
  },

  default: {
    best: [
      {
        title: "Steady income seekers",
        desc:
          "Ideal for individuals aiming to generate passive income monthly, while still maintaining exposure to long-term value growth through real estate and credit-based strategies.",
      },
      {
        title: "Working professionals",
        desc:
          "Designed for busy professionals who need hands-off investment solutions that provide regular earnings and steady wealth accumulation in the background.",
      },
    ],
    strategy: [
      {
        title: "Cash-flow optimization",
        desc:
          "Targets assets that deliver frequent income with limited downside, allowing investors to reinvest, save, or spend without compromising overall portfolio stability.",
      },
      {
        title: "Opportunistic lending",
        desc:
          "Leverages current credit tightness to lend at attractive terms, generating high-yield interest income with calculated exposure to well-vetted borrowers.",
      },
    ],
    assets: [
      {
        title: "Private credit",
        desc:
          "Involves lending to private businesses or real estate developers, typically with strong collateral backing and higher interest rates than traditional savings products.",
      },
      {
        title: "Sunbelt real estate",
        desc:
          "Focuses on fast-growing regions in the southern Europe, where population growth drives stable demand for residential and industrial rental assets.",
      },
    ],
  },
};


// Decision logic
function getRecommendation({
  accountType,
  annualIncome,
  annualInvestmentAmount,
}: {
  accountType?: string;
  annualIncome?: string;
  annualInvestmentAmount?: string;
}) {
  if (accountType === "retirement") {
    return {
      key: "retirement",
      title: "Retirement Income Strategy",
      desc: "Designed for long-term income generation and portfolio stability to support your retirement goals.",
    };
  }

  if (
    annualIncome === "Less than $75,000" ||
    annualInvestmentAmount === "Less than $1,000"
  ) {
    return {
      key: "starter",
      title: "Starter Income Strategy",
      desc: "An accessible plan ideal for new investors seeking to build consistent cash flow and minimize risk.",
    };
  }

  if (
    annualIncome === "More than $500,000" ||
    annualInvestmentAmount === "More than $1,000,000"
  ) {
    return {
      key: "highGrowth",
      title: "High-Growth Diversified Strategy",
      desc: "Tailored for high-capacity investors seeking aggressive diversification and long-term growth.",
    };
  }

  return {
    key: "default",
    title: "Supplemental Income",
    desc: "An opportunistic strategy for income-focused investors looking to generate current cash flow.",
  };
}

export default function InvestmentRecommendation() {
  const { onboarding } = useOnboarding();
  const [tab, setTab] = useState("best");

  const recommendation = getRecommendation({
    accountType: onboarding.accountType,
    annualIncome: onboarding.annualIncome,
    annualInvestmentAmount: onboarding.annualInvestmentAmount,
  });

  const tabs = supplementalTabs[recommendation.key as keyof typeof supplementalTabs];

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Investment Recommendation | Zentroe</title>
      </Helmet>

      <div className="mt-16 px-4 max-w-4xl py-6 mx-auto space-y-10">
        <h2 className="text-xl text-gray-800 font-sectra font-medium">
          Based on your answers, here’s our recommendation for you:
        </h2>

        <div className="rounded-lg border p-6 gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-sectra text-darkPrimary">{recommendation.title}</h3>
              <Link to={"/onboarding/personal-intro"}>
                <Button className="bg-primary hover:bg-[#8c391e] text-white text-sm px-5 py-2">
                  Select
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-600">{recommendation.desc}</p>
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
              <p className="text-sm text-gray-500 font-medium mb-2 uppercase">Current Allocation</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-4 text-sm text-gray-700 space-y-1">
                {pieData.map((item) => (
                  <li key={item.name} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>{item.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <OtherPlans />
        </div>
      </div>
    </OnboardingLayout>
  );
}

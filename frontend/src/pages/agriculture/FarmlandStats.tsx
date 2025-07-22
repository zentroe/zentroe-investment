import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Data
const data = [
  { year: "1991", Farmland: 100, SP500: 100, REITs: 100 },
  { year: "1995", Farmland: 130, SP500: 180, REITs: 200 },
  { year: "2000", Farmland: 190, SP500: 270, REITs: 260 },
  { year: "2005", Farmland: 300, SP500: 280, REITs: 420 },
  { year: "2010", Farmland: 450, SP500: 320, REITs: 500 },
  { year: "2015", Farmland: 850, SP500: 720, REITs: 1300 },
  { year: "2020", Farmland: 1800, SP500: 1600, REITs: 2900 },
  { year: "2021", Farmland: 2300, SP500: 2900, REITs: 3700 },
];

export default function FarmlandStats() {
  const chartRef = useRef(null);
  const isInView = useInView(chartRef, { once: true });
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isInView) setAnimate(true);
  }, [isInView]);

  return (
    <section className="bg-[#0e0e0e] py-24 text-white">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        {/* Heading */}
        <h2 className="text-5xl md:text-6xl font-atlantix text-white text-center">
          The Future is Growing
        </h2>
        <p className="text-white/80 text-center mt-4 text-lg max-w-2xl mx-auto">
          Alongside a rapidly growing global population and demand for food, farmland offers a truly diversified investment opportunity with attractive long-term returns.
        </p>
        {/* Chart */}
        <div
          ref={chartRef}
          className="bg-white rounded-xl shadow-xl p-6 w-full h-[250px] md:h-[550px] transition-opacity duration-500"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: "#fff", borderColor: "#ccc", color: "#000" }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="Farmland"
                stroke="#388e3c"
                strokeWidth={3}
                dot={false}
                isAnimationActive={animate}
              />
              <Line
                type="monotone"
                dataKey="SP500"
                stroke="#d32f2f"
                strokeWidth={2}
                dot={false}
                isAnimationActive={animate}
              />
              <Line
                type="monotone"
                dataKey="REITs"
                stroke="#1976d2"
                strokeWidth={2}
                dot={false}
                isAnimationActive={animate}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-12 px-4 max-w-6xl mx-auto text-left text-[11px] text-muted-foreground leading-relaxed">
          <p><span className="font-bold text-[12px]">Past performance does not guarantee future results and there is no guarantee this trend will continue.</span> Note: Covers periods 12/31/1990 - 12/31/2021. All returns are estimates and assume reinvestment of dividends. Index information is provided for illustrative purposes only and is not meant to represent the results of an actual investment. Returns do not include any management fees, transaction costs or expenses. Volatility is measured as the standard deviation using the monthly total returns of each index or asset class. The historical performance of each index cited is provided to illustrate historical market trends. Risk/reward profile for each asset class varies significantly. This should not be construed as a recommendation of any specific security. You cannot invest directly in an index</p>
          <p className="mt-2">Each investment vehicle has differences in fee structure, liquidity, risk and tax factors, and objectives. Private equities are considered illiquid with a longer time horizon. Bonds are subject to interest rate, credit and call risks. CDs are short-term investments, FDIC insured and are subject to interest rate risk. Commercial Real Estate is subject to credit, liquidity, interest rate, and inflation risks. The S&P 500 is liquid, but subject to valuation and inflation risks. Gold can experience high volatility. REITS are subject to liquidity and legal risks.
          </p>
        </div>
      </div>
    </section>
  );
}

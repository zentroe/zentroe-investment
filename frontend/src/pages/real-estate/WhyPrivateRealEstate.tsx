// src/pages/real-estate/WhyPrivateRealEstate.tsx
import { motion } from "framer-motion";
import { ShieldCheck, DollarSign, Layers, Building2 } from "lucide-react"; // Lucide Icons!

export default function WhyPrivateRealEstate() {
  return (
    <section className="md:py-40 py-12 bg-[#E4E3DF]">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-16">

        {/* Left Column - Sticky Heading */}
        <div className="w-full md:w-1/3">
          <div className="md:sticky md:top-48 space-y-6">
            <h2 className="md:text-7xl text-4xl font-atlantix text-darkPrimary leading-tight">
              Why private real estate
            </h2>
            <p className="text-darkPrimary max-w-md font-extralight text-xl">
              Historically, private market real estate has featured a combination of traits not found
              in other asset classes: long-term earning potential and effective diversification beyond
              the stock market.
            </p>
          </div>
        </div>

        {/* Right Column - Scrolling Info Boxes */}
        <div className="w-full md:w-2/3 md:pl-12 flex flex-col gap-8">
          {infoBoxes.map((box, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white px-8 py-14 rounded-xl shadow-sm flex md:flex-row-reverse flex-col items-start gap-6"
            >
              <div className="p-4 bg-muted rounded-lg">
                <box.icon className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-3xl font-atlantix tracking-normal text-darkPrimary mb-2">{box.title}</h3>
                <p className=" text-md">{box.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

// Info boxes with Lucide Icons
const infoBoxes = [
  {
    title: "Wealth preservation and growth",
    description: "Alternative assets like private real estate have historically offered a unique combination of lower volatility than stocks and higher potential returns than bonds. This mixture can anchor your portfolio.",
    icon: ShieldCheck,
  },
  {
    title: "Income generation",
    description: "Real estate income comes through rental payments, one of the most attractive aspects of investing in physical property ownership.",
    icon: DollarSign,
  },
  {
    title: "Superior diversification",
    description: "Private market assets are less likely to be affected by public market swings, offering long-term financial stability even during recessions.",
    icon: Layers,
  },
  {
    title: "Built for the future",
    description: "We target high-demand sectors like residential housing and logistics real estate, tapping into long-term macroeconomic growth trends.",
    icon: Building2,
  },
];

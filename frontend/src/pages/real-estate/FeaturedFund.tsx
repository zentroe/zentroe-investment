// src/pages/real-estate/FeaturedFund.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, Building2, Factory } from "lucide-react";

export default function FeaturedFund() {
  return (
    <section className="md:py-28 py-12 bg-[#151513] text-white">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-16">

        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-2 md:w-2/3"
        >
          <div className="uppercase text-sm tracking-widest text-gray-400">Featured Fund</div>
          <h2 className="md:text-6xl text-4xl font-atlantix leading-tight">Flagship Fund</h2>

          <p className="text-gray-300 text-md">
            Our Flagship Real Estate Fund is designed to deliver long-term appreciation from a
            diversified portfolio of our most favored real estate investment strategies: build-for-rent
            housing communities and multifamily and industrial assets in the Sunbelt.
          </p>

          {/* Stat Cards */}
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            {stats.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-[#222221] px-6 md:py-8 py-4 flex md:flex-col flex-row-reverse justify-between md:justify-center items-start text-left cursor-pointer transition"
              >
                <div className="text-4xl font-atlantix tracking-wider font-bold">{item.value}</div>
                <div className="text-xs text-orange-100 py-1 border-b-1 border-amber-100/30 mt-2 leading-tight">{item.label}</div>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <Link to="/signup" className="text-primary font-semibold hover:border-b-1 hover:border-primary inline-flex items-center gap-1">
              Get Started
              <span className="text-xl">&#8594;</span>
            </Link>
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-8 md:w-1/3 md:pl-10 md:mt-14"
        >
          <h3 className="uppercase text-sm tracking-widest text-gray-400 mb-4">Asset Types</h3>
          <ul className="flex flex-col gap-6">
            {assets.map((asset, index) => (
              <li key={index} className="flex items-center gap-4">
                <asset.icon size={24} className="text-primary" />
                <span className="font-sectra text-white text-md">{asset.label}</span>
              </li>
            ))}
          </ul>
        </motion.div>

      </div>
    </section>
  );
}

const stats = [
  { value: "4.6%", label: "Annualized return since inception" },
  { value: "$1.2B", label: "Net asset value (NAV)" },
  { value: "0.21%", label: "Annualized distribution rate" },
];

const assets = [
  { label: "Build for rent", icon: Home },
  { label: "Multifamily apartments", icon: Building2 },
  { label: "Industrial properties", icon: Factory },
];

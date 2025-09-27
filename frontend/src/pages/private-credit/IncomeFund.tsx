// src/pages/private-credit/IncomeFund.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Hammer,
  Landmark,
  BadgeDollarSign,
  Banknote,
  Building2
} from "lucide-react";
import FeaturedFundImage from "@/assets/waypoint-spotlight.png";

export default function IncomeFund() {
  return (
    <section className="md:py-28 py-16 gap-10 w-full flex flex-col bg-[#151513] text-white">
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
          <h2 className="md:text-6xl text-4xl font-atlantix leading-tight">Income Fund</h2>

          <p className="text-gray-300 text-md">
            Our Income Real Estate Fund is designed to deliver high current yields from a diversified portfolio
            of our most favored real estate backed fixed income strategies, primarily gap financing to stabilized
            and ground-up multifamily and to the acquisition and development of housing in the Sunbelt. The fund
            is heavily focused on capitalizing on the current dislocation in real estate credit markets.
          </p>

          {/* Stat Cards */}
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            {stats.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-[#222221] px-6 md:py-8 py-4 flex md:flex-col flex-row-reverse justify-between md:justify-center items-start text-left transition"
              >
                <div className="text-4xl font-atlantix font-bold">{item.value}</div>
                <div className="text-xs text-orange-100 border-b border-amber-100/30 mt-2 leading-tight">{item.label}</div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-8">
            <Link to="/signup" className="text-primary font-semibold hover:border-b hover:border-primary inline-flex items-center gap-1">
              Get started with the Income Real Estate Fund
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
      <div className="max-w-6xl w-full mx-auto p-2 py-6 md:p-10 bg-[#222221] rounded-lg">
        <div className="flex flex-col md:flex-row gap-6 items-center ">
          {/* Left Picture  */}
          <div className="p-4">
            <img
              src={FeaturedFundImage}
              alt="Income Fund"
              className="w-full h-auto rounded-sm "
            />
          </div>
          {/* Right Text  */}
          <div className="p-4">
            <h3 className="text-sm uppercase tracking-widest text-gray-300 mb-4">
              Income Fund
            </h3>
            <h2 className="text-5xl font-atlantix leading-tight mb-6">
              Waypoint
            </h2>
            <p className="d text-base leading-relaxed mt-4 max-w-3xl mx-auto">
              As part of our new private credit strategy, we’ve invested roughly $20.8 million to provide financing in the form of preferred equity for the development of the Mason at Daytona Beach, a 300-unit multifamily community on 65.4 acres of centrally located land in Daytona Beach, Florida. Under the terms of the investment agreement, the borrower has agreed to pay us a 13.5% fixed annual rate that will accrue for as long as it takes to finish the project, and our investment will be paid back upon its completion. This is one of many projects in the Income Fund's Portfolio.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const stats = [
  { value: "7.5%", label: "Annualized return since inception" },
  { value: "$616M", label: "Net asset value (NAV)" },
  { value: "7.52%", label: "Annualized distribution rate" },
];

const assets = [
  { label: "Homebuilder finance", icon: Hammer },
  { label: "Real estate debt", icon: Landmark },
  { label: "Preferred equity", icon: BadgeDollarSign },
  { label: "Public REIT equities", icon: Banknote },
  { label: "Multifamily", icon: Building2 },
];

// src/components/landing/RewardsSection.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BadgePercent, Users, Wallet } from "lucide-react";

export default function RewardsSection() {
  return (
    <section className="bg-gradient-to-r from-[#2b211b] to-[#251c15] text-white py-20 px-6 md:px-12">
      <div className="max-w-6xl md:p-4 mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center flex flex-col md:text-left space-y-2"
        >
          <h2 className="text-4xl tracking-tight md:text-5xl font-atlantix ">
            Get rewarded for <br></br>growing with Zentroe
          </h2>
          <p className="text-gray-100 font-extralight text-sm md:text-base max-w-md mx-auto md:mx-0">
            Unlock exclusive benefits when you invest $100,000 or more
          </p>
          <Link
            to="/about"
            className="inline-block md:max-w-40 text-center mt-10 bg-[#c89c62] text-[#251c15] font-medium px-6 py-3 rounded-sm text-sm md:text-base hover:bg-[#b68b54] transition"
          >
            Learn more
          </Link>
        </motion.div>

        {/* Right Content */}
        <div className="flex flex-col items-center justify-center w-full">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col space-y-8"
          >
            {[
              {
                icon: BadgePercent,
                title: "Exclusive investments",
                description: "Access unique and opportunistic offerings."
              },
              {
                icon: Users,
                title: "White-glove support",
                description: "Get dedicated, priority service from our expert team."
              },
              {
                icon: Wallet,
                title: "12-month fee waiver",
                description: "Enjoy a year with no advisory fees (0.15%)."
              },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="p-2 rounded-md">
                  <item.icon size={18} className="text-[#c89c62]" />
                </div>
                <div>
                  <h4 className="text-lg font-cabinet mb-1">{item.title}</h4>
                  <p className="text-gray-200 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>


      </div>
    </section>
  );
}

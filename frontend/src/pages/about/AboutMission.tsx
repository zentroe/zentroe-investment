// src/pages/about/AboutMission.tsx
import { motion } from "framer-motion";

export default function AboutMission() {
  return (
    <section className="py-16 px-6 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Mission Statement */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-4">
              Our Mission
            </h2>
            <h3 className="text-3xl md:text-4xl font-sectra font-medium text-darkPrimary leading-tight">
              Democratizing access to alternative investments
            </h3>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              We believe everyone deserves access to the same high-quality investment opportunities that have historically been reserved for institutions and the ultra-wealthy.
            </p>
            <p className="text-gray-600 text-base leading-relaxed">
              Through innovative technology and rigorous investment selection, we're breaking down traditional barriers and making alternative investments accessible, transparent, and affordable for individual investors.
            </p>
          </motion.div>

          {/* Right Side - Stats/Values */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-8"
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">£2.5B+</div>
              <div className="text-sm text-gray-600">Assets Under Management</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">50K+</div>
              <div className="text-sm text-gray-600">Active Investors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">4.7★</div>
              <div className="text-sm text-gray-600">Investopedia Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">2012</div>
              <div className="text-sm text-gray-600">Founded</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
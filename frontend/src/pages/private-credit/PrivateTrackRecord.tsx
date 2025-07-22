import { motion } from "framer-motion";

const stats = [
  { label: "Capital Deployed into Debt Projects", value: "$516 million" },
  { label: "# of Deals", value: "90" },
  { label: "# of Units", value: "20,194" },
  { label: "Avg. Net Interest Rate", value: "10.8%" },
];

export default function PrivateTrackRecord() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-6xl mx-auto px-6 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="uppercase text-sm tracking-wide text-gray-500 font-medium">
            Our Track Record
          </p>
          <h2 className="text-4xl md:text-5xl font-atlantix text-gray-900 mt-2">
            Billion-dollar experience
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mt-4 max-w-3xl mx-auto">
            While this strategy is newly calibrated for this environment, we’re able to draw on a deep well of executional experience. Since 2012, we’ve acquired or financed over 37,000 residential units and have made more than 71 unique mezzanine and preferred equity investments in real estate.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mt-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="space-y-2"
            >
              <div className="text-2xl md:text-4xl font-atlantix text-gray-900">{stat.value}</div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Leaf, Droplet, Globe } from "lucide-react";
// import { Link } from "react-router-dom";

export default function WhyInvestFarmland() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center space-y-16">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-4"
        >
          <h2 className="text-5xl md:text-6xl font-atlantix text-darkPrimary">
            Why Invest in Farmland?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Steady returns. Inflation protection. Sustainable growth.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">

          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 bg-muted/30 rounded-xl shadow-sm hover:shadow-lg transition"
          >
            <Leaf className="h-12 w-12 text-primary mb-6 mx-auto" />
            <h3 className="text-2xl font-normal font-atlantix text-darkPrimary mb-3">Stability and Resilience</h3>
            <p className="text-muted-foreground text-sm">
              Farmland consistently delivers steady returns across market cycles, making it a cornerstone for long-term portfolios.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 bg-muted/30 rounded-xl shadow-sm hover:shadow-lg transition"
          >
            <Droplet className="h-12 w-12 text-primary mb-6 mx-auto" />
            <h3 className="text-2xl font-normal font-atlantix text-darkPrimary mb-3">Inflation Hedge</h3>
            <p className="text-muted-foreground text-sm">
              As food prices rise, farmland income typically grows too, helping protect your purchasing power.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-8 bg-muted/30 rounded-xl shadow-sm hover:shadow-lg transition"
          >
            <Globe className="h-12 w-12 text-primary mb-6 mx-auto" />
            <h3 className="text-2xl font-normal font-atlantix text-darkPrimary mb-3">Sustainable Impact</h3>
            <p className="text-muted-foreground text-sm">
              Invest in the essential resource that feeds the world and supports global sustainability efforts.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

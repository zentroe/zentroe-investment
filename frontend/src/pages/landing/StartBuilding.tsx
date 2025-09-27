import { motion } from "framer-motion";
import bannerImage from "@/assets/make-your-move-desktop.png";
import { Link } from "react-router-dom";

export default function StartBuilding() {
  return (
    <section
      className="relative bg-hidden md:bg-contain md:bg-top-right md:bg-no-repeat"
      style={{
        backgroundImage: `url(${bannerImage})`,
      }}
    >
      <div className="w-full h-[400px] flex items-center justify-center">
        <motion.div
          className="max-w-6xl mx-auto w-full px-4 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Left Content */}
          <div className="text-darkPrimary text-left md:text-left">
            <h2 className="text-4xl md:text-5xl font-atlantix mb-4">
              Start building a better portfolio
            </h2>

            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-muted-foreground text-sm md:text-lg mb-6">
              <span>Low fees</span>
              <span className="w-1 h-1 bg-darkPrimary rounded-full" />
              <span>Flexible minimums</span>
              <span className="w-1 h-1 bg-darkPrimary rounded-full" />
              <span>Quarterly liquidity</span>
            </div>
            <Link to={'/signup'}>
              <button className="px-6 py-3 bg-primary mt-8 text-white rounded-lg hover:bg-primary/90 transition">
                Start Investing
              </button>
            </Link>

          </div>

          {/* Right - Empty (for layout balance) */}
          <div className="hidden md:flex flex-1" />
        </motion.div>
      </div>
    </section>
  );
}

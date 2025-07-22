// src/pages/real-estate/RealEstateHero.tsx
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-img-real-estate.png";
import { Link } from "react-router-dom";

export default function RealEstateHero() {
  return (
    <section className="py-20 bg-[#f9f7f5]">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16">

        {/* Left Content */}
        <motion.div
          className="w-full md:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="uppercase tracking-widest text-primary font-semibold mb-8 text-sm">
            Real Estate
          </p>

          <h1 className="text-4xl tracking-tight md:text-5xl font-atlantix text-darkPrimary leading-tight mb-6">
            An expansive portfolio,<br />calibrated for consistent growth
          </h1>

          <p className="text-muted-foreground mb-8">
            Our $7+ billion real estate portfolio is designed to harness the macroeconomic drivers of the European real estate market and position our clients for long-term growth.
          </p>

          <div>
            <Link to={'/onboarding/email'}>
              <button
                type="submit"
                className="bg-primary text-white px-8 py-4 rounded-sm font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Sign up
              </button>
            </Link>

          </div>
        </motion.div>

        {/* Right Image */}
        <motion.div
          className="w-full md:w-1/2"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <img
            src={heroImage}
            alt="Real Estate Investments"
            className="rounded-lg"
          />
        </motion.div>

      </div>
    </section>
  );
}

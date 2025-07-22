// src/components/landing/LandingAboutSection.tsx
import { motion } from "framer-motion";

export default function LandingAboutSection() {
  return (
    <section className="py-8 px-6 pb-36 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10">
        {/* Left Empty */}
        <div className="flex-1 hidden md:block" />

        {/* Right Text Section */}
        <motion.div
          className="flex-1 tracking-tight text-left"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-atlantix  text-darkPrimary mb-6 leading-snug">
            Tearing down barriers to the best investments
          </h2>
          <p className="text-gray-700 mb-4 text-sm md:text-base">
            For almost a century, regulatory barriers made it difficult for individuals to invest in private markets, giving billion-dollar institutions preferred access. The result has been that most investors have been limited to public markets and excluded from private investments, ranging from real estate to venture capital. Technology is finally disrupting this status quo.
          </p>
          <p className="text-gray-700 text-sm md:text-base">
            Enter Zentroe, Europe's largest direct-to-consumer private markets manager. We built our technology platform to bridge the barrier. Combining our technology and investment expertise, we are pioneering a new model to build you a better portfolio.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

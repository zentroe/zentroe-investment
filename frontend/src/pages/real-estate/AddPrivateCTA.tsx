// src/pages/real-estate/AddPrivateCTA.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function AddPrivateCTA() {
  return (
    <section className="bg-[#151513] py-28">
      <div className="max-w-5xl mx-auto px-4 text-center">

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-atlantix text-white mb-10"
        >
          Add private real estate to your portfolio
        </motion.h2>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <Link
            to="/signup"
            className="inline-block bg-primary text-white text-sm md:text-base font-medium px-8 py-3 rounded-sm hover:bg-[#8c391e] transition-all duration-300"
          >
            Get Started
          </Link>
        </motion.div>

      </div>
    </section>
  );
}

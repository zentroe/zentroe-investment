import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function CallToAction() {
  return (
    <section className="bg-[#181716] py-24 text-center text-white">
      <div className="max-w-4xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl font-atlantix mb-8"
        >
          Add private credit to your portfolio
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          <Link
            to="/signup"
            className="px-8 py-3 bg-primary text-white rounded-md text-sm md:text-base hover:bg-[#8c391e] transition-colors duration-300"
          >
            Get started
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

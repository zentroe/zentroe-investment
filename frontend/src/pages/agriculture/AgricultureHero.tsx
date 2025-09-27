// src/pages/agriculture/AgricultureHero.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import agricultureVideo from "@/assets/agriculture-video.mp4";

export default function AgricultureHero() {
  return (
    <section className="relative w-full h-[80vh] overflow-hidden bg-black">

      {/* Background Local Video */}
      <div className="absolute inset-0 z-0">
        <video
          src={agricultureVideo}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          style={{
            objectPosition: window.innerWidth < 768 ? "left bottom" : "center bottom",
          }}
        />
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-start px-6 md:px-4 max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-5xl md:text-7xl font-atlantix text-white leading-tight mb-6"
        >
          Farmland Investing<br />Simplified.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-gray-200 text-lg max-w-xl mb-8"
        >
          Diversify with an asset class that has the potential to create wealth opportunities over time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <Link
            to="/signup"
            className="px-8 py-3 bg-primary text-white rounded-md hover:bg-[#8c391e] transition-all duration-300 text-sm md:text-base"
          >
            Get Started
          </Link>
        </motion.div>
      </div>

    </section>
  );
}

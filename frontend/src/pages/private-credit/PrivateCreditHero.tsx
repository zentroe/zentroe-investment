import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-img-private-credit.png";

export default function PrivateCreditHero() {
  return (
    <section className="bg-[#2d4b53] text-white py-24 px-6 md:px-0">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* Left: Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-sm uppercase tracking-widest text-gray-300 mb-4">Private Credit</p>
          <h1 className="text-5xl font-atlantix leading-tight mb-6">
            An opportunistic strategy <br />
            for income-focused investors
          </h1>
          <p className="text-gray-300 mb-6 max-w-lg">
            Our new private credit investment strategy capitalizes on the changed economic environment,
            offering some of the most attractive potential risk-adjusted returns of the past decade.
          </p>
          <Link
            to="/signup"
            className="bg-primary text-white px-6 py-3 rounded-md text-sm hover:bg-[#8c391e] transition"
          >
            Sign up
          </Link>
        </motion.div>

        {/* Right: Image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full rounded-lg overflow-hidden"
        >
          <img
            src={heroImage}
            alt="Private Credit Investment"
            className="object-cover w-full h-full"
          />
        </motion.div>
      </div>
    </section>
  );
}

// src/components/landing/HeroSection.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-homescreen-desktop.png";
// import LottieImage from "@/assets/hero2.json";

export default function HeroSection() {
  return (
    <section className="max-h-4xl max-w-6xl mx-auto px-4 flex flex-col-reverse md:flex-row items-center gap-10 md:gap-10 pt-20 md:pt-12 bg-[#f9f8f6]">
      {/* Left Side: Text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className=" flex flex-col items-start text-left"
      >
        <h1 className="text-5xl tracking-tight md:text-7xl font-atlantix text-darkPrimary mb-6">
          Invest in a better <br /> alternative
        </h1>

        <p className="text-gray-700 text-base md:text-md mb-8">
          Build a portfolio of private assets like real estate, private credit, and agriculture.
        </p>

        <div className="flex justify-start">
          <Link
            to="/signup"
            className="px-6 py-3 bg-primary hover:bg-[#8c391e] text-white rounded-md text-sm md:text-base transition"
          >
            Sign up
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Start investing in less than 5 minutes.
        </p>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-8 flex mb-8 w-full flex-wrap items-center justify-center md:justify-start gap-6"
        >
          {["nerdwallet", "apple", "google", "investopedia"].map((item) => (
            <div key={item} className="flex flex-col items-center gap-1 text-gray-600 text-lg">
              <span className="font-semibold capitalize">{item}</span>
              <span className="text-[#D5BD90] text-md">★★★★★</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Right Side: Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="w-full md:w-[500px] md:flex hidden justify-start"
      >
        <img
          src={heroImage}
          alt="Zentroe App Preview"
          className="rounded-xl object-cover w-full max-w-xs md:max-w-full"
        />
        {/* <Lottie animationData={LottieImage} loop className="w-full" /> */}

      </motion.div>
    </section>
  );
}

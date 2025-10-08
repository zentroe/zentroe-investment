// src/pages/landing/FeaturedInvestments.tsx
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

// Import images so Vite includes them in the build
import image1 from "@/assets/15192.jpg";
import image2 from "@/assets/15996.jpg";
import image3 from "@/assets/9296767.jpg";
import image4 from "@/assets/8245275.jpg";
import image5 from "@/assets/2802.jpg";
import image6 from "@/assets/97.jpg";
import image7 from "@/assets/23156329.jpg";

const investments = [
  { title: "Château Vineyards", location: "Bordeaux, France", irr: "14.9%", holdPeriod: "3 Years", image: image1 },
  { title: "Rowan Gardens", location: "Dublin, Ireland", irr: "23.3%", holdPeriod: "1.7 Years", image: image2 },
  { title: "Seaside Residences", location: "Amalfi Coast, Italy", irr: "9.4%", holdPeriod: "4.2 Years", image: image3 },
  { title: "Emerald Estates", location: "Edinburgh, Scotland", irr: "18.2%", holdPeriod: "5 Years", image: image4 },
  { title: "Sunnyhill Villas", location: "Lisbon, Portugal", irr: "20.1%", holdPeriod: "2.5 Years", image: image5 },
  { title: "Harborview Homes", location: "Copenhagen, Denmark", irr: "15.7%", holdPeriod: "4 Years", image: image6 },
  { title: "Willowbrook Heights", location: "Zurich, Switzerland", irr: "12.5%", holdPeriod: "6 Years", image: image7 },
];

export default function FeaturedInvestments() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const showPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? investments.length - 1 : prev - 1));
  };

  const showNext = () => {
    setCurrentIndex((prev) => (prev === investments.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-30 bg-white ">
      <div className="px-4  w-full mx-auto">
        {/* <h2 className="text-3xl font-cabinet text-darkPrimary mb-6 text-center">
          Real Estate Investment Opportunities
        </h2> */}
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          Browse exclusive European properties curated for optimal returns. Expand your portfolio with confidence and class.
        </p>

        <div className="relative">
          {/* Gradient fade overlays */}
          <div className="absolute top-0 left-0 h-full w-16 md:w-240 bg-gradient-to-r from-muted/50 via-transparent to-transparent z-20 pointer-events-none" />
          <div className="absolute top-0 right-0 h-full w-16 md:w-240 bg-gradient-to-l from-muted/50 via-transparent to-transparent z-20 pointer-events-none" />

          {/* Cards container */}
          <div className="overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-500"
              style={{
                transform: `translateX(-${currentIndex * (window.innerWidth < 768 ? 90 : 20)}%)`,
              }}
            >
              {investments.map((item, index) => (
                <motion.div
                  key={index}
                  className="min-w-[80%] sm:min-w-[50%] md:min-w-[20%] p-2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="rounded-lg overflow-hidden shadow-md bg-white hover:shadow-2xl transition-all duration-300">
                    <div
                      className="h-56 bg-cover bg-center transform hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-darkPrimary mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.location}</p>
                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="text-muted-foreground">IRR</p>
                          <p className="font-semibold text-primary">{item.irr}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Hold Period</p>
                          <p className="font-semibold">{item.holdPeriod}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 left-2 transform -translate-y-1/2 z-30">
            <button
              onClick={showPrev}
              className="p-2 bg-white shadow rounded-full hover:bg-primary hover:text-white transition"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          <div className="absolute top-1/2 right-2 transform -translate-y-1/2 z-30">
            <button
              onClick={showNext}
              className="p-2 bg-white shadow rounded-full hover:bg-primary hover:text-white transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        {/* Disclaimer / Info Text */}
        <div className="mt-12 text-xs text-gray-500 max-w-5xl mx-auto text-center leading-relaxed">
          The above investment opportunities represent curated real estate assets managed by Zentroe Investments as of April 2025.
          Please note that investment returns are not guaranteed and past performance does not indicate future results.
          All investments carry inherent risks, including the risk of total loss.
          Please carefully review the <span className="underline text-primary cursor-pointer">terms of service</span> and
          <span className="underline text-primary cursor-pointer"> risk disclosures</span> before making investment decisions.
        </div>
      </div>
    </section>
  );
}

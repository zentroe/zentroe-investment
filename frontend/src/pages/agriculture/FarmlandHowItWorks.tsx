import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import howItWorksImage from "@/assets/farmland-view.jpg";
import { AnimatePresence, motion } from "framer-motion";

const steps = [
  {
    title: "Farm Selection & Entity Creation",
    content:
      "We select a tiny fraction of the parcels we review, ensuring each offering is of the highest quality. Each farm and its legal title are placed into a single purpose entity (usually an LLC).",
  },
  {
    title: "Investment",
    content:
      "Investors purchase shares in the entity that owns the farmland. Minimums are accessible and structured for ease of entry.",
  },
  {
    title: "Farm Management",
    content:
      "Professional farm managers handle daily operations, ensuring optimized yield, responsible land use, and sustainability.",
  },
  {
    title: "Distributions",
    content:
      "Investors receive regular cash distributions based on rental income or operations, depending on the deal structure.",
  },
  {
    title: "Land Sale and Disposition",
    content:
      "Once the holding period is complete, the farm is sold and any profits are distributed to investors.",
  },
];

export default function FarmlandHowItWorks() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative bg-gradient-to-br from-[#F5EAE8] to-[#E1C1BA] py-32 overflow-hidden">
      {/* Diagonal Top Edge */}
      <div className="absolute -top-20 left-0 w-full h-40 bg-[#F5EAE8] transform -skew-y-8 shadow-md z-0" />

      <div className="relative z-10 w-full mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        {/* Left Image */}
        <div className="relative -ml-10 md:-ml-20">
          <div className="rounded-2xl overflow-hidden shadow-xl h-[420px] md:h-[600px] w-full">
            <img
              src={howItWorksImage}
              alt="Farmland View"
              className="object-cover w-full h-full"
              style={{ objectPosition: "center" }}
            />
          </div>
        </div>

        {/* Accordion */}
        <div className="space-y-10 max-w-xl">
          <h2 className="text-5xl font-atlantix text-primary mb-6">
            How It Works
          </h2>

          <div className="space-y-0 divide-y-1 divide-primary">
            {steps.map((step, idx) => {
              const isOpen = activeIndex === idx;
              return (
                <div
                  key={idx}
                  className=" pr-6 py-6 cursor-pointer transition-all"
                  onClick={() => setActiveIndex(isOpen ? -1 : idx)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold font-atlantix tracking-wide text-primary">
                      {step.title}
                    </h3>
                    {isOpen ? <ChevronUp color="#A9462D" size={20} /> : <ChevronDown color="#A9462D" size={20} />}
                  </div>

                  {/* AnimatePresence enables smooth unmount animation */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 text-sm mb-18 text-primary leading-relaxed">
                          {step.content}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

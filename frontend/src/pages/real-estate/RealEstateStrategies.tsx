// src/pages/real-estate/RealEstateStrategies.tsx
import { motion } from "framer-motion";

export default function RealEstateStrategies() {
  const strategies = [
    {
      title: "Build-for-Rent",
      description:
        "Demand for single-family rentals has surged, driving appreciation and opportunity. By purchasing homes directly from builders and creating stabilized communities, we optimize returns and affordability.",
      stats: [
        { label: "Single-family homes", value: "3,471" },
        { label: "U.S. Markets", value: "30" },
      ],
      imageUrl: "/src/assets/strategy-1.png", // Replace with your actual image
      ctaText: "Read about our $500M funding by Goldman Sachs →",
      ctaLink: "#", // Optional, or remove if you don't want CTA
    },
    {
      title: "Multifamily Apartments",
      description:
        "Suburban apartments have gained strong demand from remote workers and families. We focus on affordable, growing communities to deliver income stability and long-term appreciation.",
      stats: [
        { label: "Residential units", value: "8,962" },
        { label: "U.S. Markets", value: "10" },
      ],
      imageUrl: "/src/assets/strategy-2.png",
      ctaText: "Read about our neighborhood renovation efforts in Bloomberg →",
      ctaLink: "#",
    },
    {
      title: "Industrial Properties",
      description:
        "Our investments in logistics and light industrial facilities tap into the growth of eCommerce, reshaping how goods are stored and distributed across thriving local economies.",
      stats: [
        { label: "Industrial properties", value: "145" },
        { label: "Square footage", value: "4.5M+" },
      ],
      imageUrl: "/src/assets/strategy-3.png",
      ctaText: "Learn about industrial trends fueling our strategy →",
      ctaLink: "#",
    },
  ];

  const stats = [
    {
      title: "223",
      description: "Active projects"
    },
    {
      title: "233",
      description: "Completed projects"
    },
    {
      title: "$7+ billion",
      description: "Total portfolio value"
    }
  ];

  return (
    <section className="md:py-28 py-14 bg-[#22201B] text-white space-y-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="flex max-w-6xl gap-8 mx-auto text-center flex-col items-center"
      >
        <h2 className="font-500 text-sm md:text-lg tracking-wider">OUR STRATEGIES</h2>
        <h1 className="md:text-6xl hidden md:block text-5xl md:max-w-2xl font-atlantix">Designed to harness the market's potential</h1>
        <h1 className="md:text-6xl text-5xl md:hidden md:max-w-2xl font-atlantix">Designed to <br /> harness the <br /> market's potential</h1>
        <p className="font-extralight text-gray-300/90 text-lg px-4 md:text-2xl max-w-2xl">By employing a combination of strategies, we aim to build well-rounded, resilient portfolios targeted to deliver consistently strong results based on our clients' goals and appetite for risk.
        </p>
        <div className="mt-10 flex max-w-2xl w-full justify-between flex-col md:flex-row tracking-normal md:gap-18 gap-8">
          {stats.map((item, index) => (
            <div
              key={index}
              className=""
            >
              <div className="">
                <h1 className="text-4xl md:text-5xl font-atlantix">{item.title}</h1>
                <p className="text-white/80">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

      </motion.div>

      <div className="divide-y divide-white/50">
        {strategies.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-6xl mx-auto px-4 md:py-24 py-10 flex flex-col md:flex-row items-center gap-16"
          >
            {/* Left Column - Text */}
            <div className="w-full md:w-1/2 space-y-6">
              <h2 className="text-5xl md:text-6xl font-atlantix leading-tight text-white">
                {item.title}
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">{item.description}</p>

              <div className="flex gap-12 mt-8">
                {item.stats.map((stat, idx) => (
                  <div key={idx}>
                    <p className="text-4xl font-semibold text-white">{stat.value}</p>
                    <p className="text-md text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* {item.ctaLink && (
              <a
                href={item.ctaLink}
                className="mt-8 inline-block text-primary hover:underline text-sm font-medium transition-all"
              >
                {item.ctaText}
              </a>
            )} */}
            </div>

            {/* Right Column - Image Background */}
            <div
              className="w-full md:w-1/2 h-[320px] md:h-[400px] bg-center bg-cover rounded-xl shadow-lg"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            ></div>
          </motion.div>
        ))}
      </div>

    </section>
  );
}

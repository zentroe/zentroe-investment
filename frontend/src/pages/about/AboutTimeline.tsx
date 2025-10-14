// src/pages/about/AboutTimeline.tsx
import { motion } from "framer-motion";

const milestones = [
  {
    year: "2012",
    title: "Founded in London",
    description: "Zentroe was founded with a vision to democratize access to alternative investments."
  },
  {
    year: "2015",
    title: "First Real Estate Fund",
    description: "Launched our inaugural real estate investment fund, focusing on premium UK properties."
  },
  {
    year: "2018",
    title: "Technology Platform Launch",
    description: "Developed our proprietary investment platform, making alternative investments more accessible."
  },
  {
    year: "2020",
    title: "Private Credit Expansion",
    description: "Expanded into private credit markets, offering investors access to debt investments."
  },
  {
    year: "2022",
    title: "Venture Capital Entry",
    description: "Added venture capital opportunities, giving investors access to startup and growth companies."
  },
  {
    year: "2024",
    title: "£2.5B+ AUM Milestone",
    description: "Reached over £2.5 billion in assets under management with 50,000+ active investors."
  }
];

export default function AboutTimeline() {
  return (
    <section className="py-16 px-6 md:px-12 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-4">
            Our Journey
          </h2>
          <h3 className="text-3xl md:text-4xl font-sectra font-medium text-darkPrimary leading-tight mb-6">
            12+ years of innovation
          </h3>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            From a small startup to Europe's leading direct-to-consumer private markets platform.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-px top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Timeline Items */}
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-row`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'} pl-12 md:pl-0`}>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-2">
                      {milestone.year}
                    </div>
                    <h4 className="text-xl font-semibold text-darkPrimary mb-3">
                      {milestone.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 w-3 h-3 bg-primary rounded-full border-4 border-white shadow-lg"></div>

                {/* Spacer for desktop */}
                <div className="flex-1 hidden md:block"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
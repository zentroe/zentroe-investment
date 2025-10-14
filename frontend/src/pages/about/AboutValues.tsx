// src/pages/about/AboutValues.tsx
import { motion } from "framer-motion";
import { Shield, Target, Users, Lightbulb } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    description: "We believe transparency builds trust. Every investment is thoroughly vetted and clearly explained, with no hidden fees or complex structures."
  },
  {
    icon: Target,
    title: "Performance Focus",
    description: "We're committed to delivering exceptional returns through rigorous due diligence and continuous portfolio optimization."
  },
  {
    icon: Users,
    title: "Investor First",
    description: "Our interests are aligned with yours. We succeed when our investors succeed, creating long-term value for everyone."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We leverage cutting-edge technology to democratize access to alternative investments and create a seamless investor experience."
  }
];

export default function AboutValues() {
  return (
    <section className="py-16 px-6 md:px-12 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-4">
            Our Values
          </h2>
          <h3 className="text-3xl md:text-4xl font-sectra font-medium text-darkPrimary leading-tight mb-6">
            What drives us forward
          </h3>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Our core values shape every decision we make and guide us in building a better financial future for our investors.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <value.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-darkPrimary mb-4">
                {value.title}
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
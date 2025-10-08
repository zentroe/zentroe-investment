// src/pages/about/AboutTeam.tsx
import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";

const teamMembers = [
  {
    name: "Sarah Chen",
    position: "Chief Executive Officer",
    bio: "Former Goldman Sachs investment banker with 15+ years in alternative investments.",
    image: "/api/placeholder/300/300"
  },
  {
    name: "Michael Rodriguez",
    position: "Chief Investment Officer",
    bio: "Previously led real estate investments at BlackRock, managing over £5B in assets.",
    image: "/api/placeholder/300/300"
  },
  {
    name: "Emma Thompson",
    position: "Chief Technology Officer",
    bio: "Former Google engineer who built fintech platforms serving millions of users.",
    image: "/api/placeholder/300/300"
  },
  {
    name: "David Kim",
    position: "Head of Private Credit",
    bio: "20+ years in debt markets at JPMorgan and Apollo Global Management.",
    image: "/api/placeholder/300/300"
  }
];

export default function AboutTeam() {
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
          <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-4">
            Leadership Team
          </h2>
          <h3 className="text-3xl md:text-4xl font-sectra font-medium text-darkPrimary leading-tight mb-6">
            Meet the team behind Zentroe
          </h3>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Our leadership team brings together decades of experience from top-tier financial institutions and technology companies.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Placeholder for team member photo */}
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-semibold text-gray-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-xl font-semibold text-darkPrimary mb-1">
                  {member.name}
                </h4>
                <p className="text-primary text-sm font-medium mb-3">
                  {member.position}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {member.bio}
                </p>
                <button className="text-primary hover:text-primary/80 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h4 className="text-2xl font-semibold text-darkPrimary mb-4">
              Join Our Team
            </h4>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're always looking for talented individuals who share our passion for democratizing access to alternative investments.
            </p>
            <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium">
              View Open Positions
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
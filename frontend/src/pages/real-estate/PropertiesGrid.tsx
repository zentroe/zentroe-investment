// src/pages/real-estate/PropertiesGrid.tsx
import { motion } from "framer-motion";

const properties = [
  {
    title: "Château Vineyards",
    location: "Bordeaux, France",
    category: "Vineyard",
    image: "/src/assets/15192.jpg",
  },
  {
    title: "Rowan Gardens",
    location: "Dublin, Ireland",
    category: "Garden Estate",
    image: "/src/assets/15996.jpg",
  },
  {
    title: "Seaside Residences",
    location: "Amalfi Coast, Italy",
    category: "Luxury Homes",
    image: "/src/assets/9296767.jpg",
  },
  {
    title: "Emerald Estates",
    location: "Edinburgh, Scotland",
    category: "Residential",
    image: "/src/assets/8245275.jpg",
  },
  {
    title: "Sunnyhill Villas",
    location: "Lisbon, Portugal",
    category: "Vacation Homes",
    image: "/src/assets/2802.jpg",
  },
  {
    title: "Harborview Homes",
    location: "Copenhagen, Denmark",
    category: "Seaside Homes",
    image: "/src/assets/97.jpg",
  },
  {
    title: "Willowbrook Heights",
    location: "Zurich, Switzerland",
    category: "Luxury Apartments",
    image: "/src/assets/23156329.jpg",
  },
  {
    title: "Meadowcrest Manor",
    location: "Vienna, Austria",
    category: "Heritage Property",
    image: "/src/assets/15996.jpg", // You can replace this
  },
];

export default function PropertiesGrid() {
  return (
    <section className="py-28 bg-[#FAF9F6]">
      <div className="max-w-6xl mx-auto px-4">

        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-atlantix text-darkPrimary">
            Projects in our portfolio
          </h2>
          <p className="text-muted-foreground text-lg">
            Here are the top real estate investments, amongst others, that are powering our investors’ returns.
          </p>
        </motion.div>

        {/* Properties Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {properties.map((property, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div
                className="h-48 bg-center bg-cover"
                style={{ backgroundImage: `url(${property.image})` }}
              ></div>
              <div className="p-5 space-y-2">
                <h3 className="text-lg font-semibold text-darkPrimary">
                  {property.title}
                </h3>
                <p className="text-muted-foreground text-sm">{property.location}</p>
                <span className="inline-block mt-2 px-3 py-1 text-xs bg-muted text-darkPrimary rounded-full">
                  {property.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

// src/pages/real-estate/PropertiesGrid.tsx
import { motion } from "framer-motion";

// Import images so Vite includes them in the build
import image1 from "@/assets/15192.jpg";
import image2 from "@/assets/15996.jpg";
import image3 from "@/assets/9296767.jpg";
import image4 from "@/assets/8245275.jpg";
import image5 from "@/assets/2802.jpg";
import image6 from "@/assets/97.jpg";
import image7 from "@/assets/23156329.jpg";

const properties = [
  {
    title: "Château Vineyards",
    location: "Bordeaux, France",
    category: "Vineyard",
    image: image1,
  },
  {
    title: "Rowan Gardens",
    location: "Dublin, Ireland",
    category: "Garden Estate",
    image: image2,
  },
  {
    title: "Seaside Residences",
    location: "Amalfi Coast, Italy",
    category: "Luxury Homes",
    image: image3,
  },
  {
    title: "Emerald Estates",
    location: "Edinburgh, Scotland",
    category: "Residential",
    image: image4,
  },
  {
    title: "Sunnyhill Villas",
    location: "Lisbon, Portugal",
    category: "Vacation Homes",
    image: image5,
  },
  {
    title: "Harborview Homes",
    location: "Copenhagen, Denmark",
    category: "Seaside Homes",
    image: image6,
  },
  {
    title: "Willowbrook Heights",
    location: "Zurich, Switzerland",
    category: "Luxury Apartments",
    image: image7,
  },
  {
    title: "Meadowcrest Manor",
    location: "Vienna, Austria",
    category: "Heritage Property",
    image: image2, // Reused image2 as noted in the comment
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
                <span className="inline-block mt-2 px-3 py-1 text-sm bg-muted text-darkPrimary rounded-full">
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

import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function VentureFundHighlight() {
  const sectors = [
    "Modern Data Infrastructure",
    "Artificial Intelligence & Machine Learning",
    "Development Operations (DevOps)",
    "Financial Technology (FinTech)",
  ];

  return (
    <section className="w-full px-4 py-30 bg-[#0C0C0C] text-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        {/* Left Content */}
        <div>
          <p className="uppercase text-sm tracking-wider text-gray-400 mb-3">
            Featured Fund
          </p>
          <h2 className="text-5xl font-sectra font-medium mb-4">
            Innovation Fund
          </h2>
          <p className="text-gray-300 text-base mb-6">
            Our Innovation Fund intends to invest in a diversified portfolio
            largely composed of private <strong>high-growth technology companies</strong>,
            with an initial focus on several sectors that we believe have exceptional macro tailwinds.
          </p>
          <Link
            to="#"
            className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            Learn more about the Innovation Fund <ArrowRight size={16} />
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-col md:justify-center gap-16 text-center md:text-center">
          <div>
            <p className="text-3xl md:text-5xl font-sectra mb-1">$200M+</p>
            <p className="text-gray-400 text-sm">dollars raised</p>
          </div>
          <div>
            <p className="text-3xl md:text-5xl font-sectra mb-1">63K+</p>
            <p className="text-gray-400 text-sm">active investors</p>
          </div>
        </div>
      </div>

      {/* Sectors */}
      <div className="max-w-6xl mx-auto mt-26">
        <p className="uppercase text-sm text-gray-400 mb-4 tracking-wide">
          Sectors
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {sectors.map((sector) => (
            <div
              key={sector}
              className="border border-gray-700 rounded-md p-5 hover:border-primary transition-colors"
            >
              <p className="text-white text-lg font-medium mb-2">{sector}</p>
              <Link
                to="#"
                className="text-sm text-primary inline-flex items-center gap-1 font-semibold hover:underline"
              >
                Learn more <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 mt-6 text-right">
          Figures as of 2/10/2025
        </p>
      </div>
    </section>
  );
}

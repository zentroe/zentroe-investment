import { Link } from "react-router-dom";
import farmImage from "@/assets/agriculture-cover.jpg";

export default function FinalCallToAction() {
  return (
    <section className="bg-[#f9f9f7] py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-xl shadow-xs p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Left Content */}
          <div className="flex-1 space-y-4">
            <h3 className="text-3xl md:text-4xl font-atlantix text-darkPrimary">Ready to get started?</h3>
            <p className="text-gray-700 text-base">
              Begin investing or get in touch with us to learn more about farmland opportunities.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-6">
              <Link
                to="/onboarding/email"
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-[#8c391e] transition"
              >
                Get Started
              </Link>
              <Link
                to="/contact"
                className="text-primary hover:underline text-sm"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative w-full md:w-1/3 h-56 md:h-40 rounded-lg overflow-hidden shadow-md">
            <img
              src={farmImage}
              alt="Farmland Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium shadow">
              Open
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

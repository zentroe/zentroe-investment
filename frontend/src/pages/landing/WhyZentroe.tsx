// src/pages/landing/WhyZentroe.tsx
import { motion } from "framer-motion";
import promoVideo from "@/assets/zentroe-promo-2.mp4";

export default function WhyZentroe() {
  return (
    <section className="relative py-30 bg-white overflow-hidden">
      {/* <section className="py-30 bg-white bg-[radial-gradient(#ccc_1px,transparent_1px)] bg-[size:20px_20px]"> */}
      {/* <section className="py-30 bg-white border-t border-muted"> */}


      <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/12 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-20 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="max-w-7xl mx-auto px-4 space-y-12">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-atlantix font-semibold text-darkPrimary text-left">
            Why Zentroe?
          </h2>
        </motion.div>

        {/* Content Grid */}
        <div className="flex flex-col-reverse md:flex-row items-center gap-12">

          {/* Left: Highlights */}
          <motion.div
            className="w-full md:w-2/5 font-sectra space-y-10"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Highlight 1 */}
            <div>
              <div className="border-l-4 bg-white shadow-lg pl-4 py-5 flex flex-col gap-3 justify-between border-primary">
                <h3 className="text-xl text-darkPrimary mb-1">Rigorous Due Diligence</h3>
                <p className="text-muted-foreground text-sm">
                  We meticulously assess and verify each real estate asset before offering them for investment.
                </p>
              </div>
            </div>

            {/* Highlight 2 */}
            <div>
              <div className="border-l-4 bg-white shadow-lg pl-4 py-5 flex flex-col gap-3 justify-between border-primary">
                <h3 className="text-xl font-semibold text-darkPrimary mb-1">Genuine Diversification</h3>
                <p className="text-muted-foreground text-sm">
                  Access different property types across multiple prime locations in Europe.
                </p>
              </div>
            </div>

            {/* Highlight 3 */}
            <div>
              <div className="border-l-4 bg-white shadow-lg pl-4 py-5 flex flex-col gap-3 justify-between border-primary">
                <h3 className="text-xl font-semibold text-darkPrimary mb-1"> Passive Income </h3>
                <p className="text-muted-foreground text-sm">
                  Relax while your investments generate stable returns through expertly managed assets.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Video Player */}
          <motion.div
            className="w-full md:w-3/5 rounded-lg overflow-hidden shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative rounded-lg overflow-hidden group">
              <video
                src={promoVideo}
                controls
                muted
                className="w-full h-full object-cover rounded-lg transition-transform duration-500 "
              />
              {/* Optional: Overlay glow or border hover effect */}
              {/* <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary transition-all duration-500" /> */}
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}

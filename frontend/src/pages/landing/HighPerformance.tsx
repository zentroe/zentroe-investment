// src/pages/landing/HighPerformance.tsx
import { motion } from "framer-motion";

export default function HighPerformance() {
  return (
    <section className="relative py-28 bg-[#151513] text-white overflow-hidden">
      <div className="max-w-6xl z-[20px] mx-auto px-4 grid md:grid-cols-[3fr_2fr] gap-12 items-start">

        {/* Left Side - Text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-8 w-full"
        >
          <h2 className="text-6xl font-atlantix leading-tight text-white">
            High-performance<br />technology
          </h2>

          <p className="text-gray-300 font-extralight text-lg">
            We’ve spent 10+ years systematically replacing the industry standard of spreadsheets, PDFs, and expensive 3rd-party vendors with API-driven, fully integrated investor servicing, fund management, and asset management software.
          </p>

          <p className="text-white leading-relaxed">
            Our end-to-end, fully integrated technology platform is an industry first, drastically reducing operating costs, enabling sophisticated use of data, and delivering improved performance management. The results are dramatic:
          </p>

          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Unprecedented real-time oversight & reporting</li>
            <li>Low fees, with no promote or carried interest</li>
            <li>Virtually unlimited scale</li>
            <li>Unprecedented convenience</li>
            <li>Better expected net returns</li>
          </ul>

        </motion.div>

        {/* Right Side - Features */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-12 md:pl-18 flex w-full flex-col h-full items-start justify-end"
        >
          <div className="space-y-6 divide-y divide-muted-foreground">
            <div className="flex flex-col py-8">
              <h3 className="text-5xl font-atlantix text-white">Basis™</h3>
              <p className="text-muted-foreground text-sm">
                An operating system for real estate asset management.
              </p>
            </div>

            <div className="flex flex-col w-full py-8 justify-center">
              <h3 className="text-5xl font-atlantix text-white">Cornice™</h3>
              <p className="text-muted-foreground text-sm">
                An operating system for investor servicing and fund management.
              </p>
            </div>

            <div className="flex flex-col w-full py-8 justify-center">
              <h3 className="text-5xl font-atlantix text-white">Equitize™</h3>
              <p className="text-muted-foreground text-sm mt-2">
                A fintech platform to provide flexible equity funding for leading companies.
              </p>
            </div>
          </div>


        </motion.div>

      </div>
    </section>
  );
}

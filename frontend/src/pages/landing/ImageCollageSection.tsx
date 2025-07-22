import { motion } from "framer-motion";
import collageImage from "@/assets/people-graphs-collage.png";

export default function ImageCollageSection() {
  return (
    <section className="py-20 px-6 md:px-12 bg-[#f9f8f6]">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <motion.img
          src={collageImage}
          alt="Investment collage"
          className="w-full max-w-5xl rounded-lg"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        />
      </div>
    </section>
  );
}

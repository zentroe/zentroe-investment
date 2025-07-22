// src/components/about/AboutHero.tsx
import videoSrc from "@/assets/Zentroe_About.mp4";

export default function AboutHero() {
  return (
    <section className="w-full max-w-6xl mx-auto bg-background text-center">
      {/* Text Content */}
      <div className="max-w-3xl mx-auto px-4 pt-26 pb-12 md:pb-20">
        <h2 className="uppercase text-xs tracking-wide text-gray-500 mb-4">
          About Us
        </h2>
        <h1 className="text-3xl md:text-5xl font-sectra font-medium leading-tight text-darkPrimary mb-4">
          We're on a mission to build a better financial system by empowering the individual.
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Founded in 2012 and headquartered in London, UK, Zentroe is one of the leading real estate investment platforms.
        </p>
      </div>

      {/* Video Section */}
      <div className="relative w-full z-10">
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className="w-full max-w-4xl mx-auto object-cover object-center"
        />
      </div>
    </section>
  );
}

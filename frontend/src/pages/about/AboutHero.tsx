// src/components/about/AboutHero.tsx

export default function AboutHero() {
  return (
    <section className="w-full max-w-6xl mx-auto bg-background text-center">
      {/* Text Content */}
      <div className="max-w-3xl mx-auto px-4 pt-26 pb-12 md:pb-20">
        <h2 className="uppercase text-sm tracking-wide text-gray-500 mb-4">
          About Us
        </h2>
        <h1 className="text-3xl md:text-5xl font-sectra font-medium leading-tight text-darkPrimary mb-4">
          We're on a mission to build a better financial system by empowering the individual.
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Founded in 2012 and headquartered in London, UK, Zentroe is one of the leading real estate investment platforms.
        </p>
      </div>

      {/* Video Section - Cloudinary Embedded Player */}
      <div className="relative w-full z-10">
        <div className="w-full max-w-4xl mx-auto">
          <iframe
            src="https://player.cloudinary.com/embed/?cloud_name=dqxr2tw3j&public_id=Zentroe_About_wlj8lq&profile=cld-looping"
            width="100%"
            height="100%"
            style={{ aspectRatio: '16/9' }}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            frameBorder="0"
            className="w-full rounded-lg"
          ></iframe>
        </div>
      </div>
    </section>
  );
}

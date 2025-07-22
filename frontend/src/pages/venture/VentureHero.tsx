// src/components/venture/VentureHero.tsx
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-img-venture-no-labels.png";
import { Link } from "react-router-dom";

// SVG logo imports
import openaiLogo from "@/assets/68261a2d4999bfb1773285ed300ab4ef0270bdb6-103x28.svg";
import anthropicLogo from "@/assets/641c840263ea2d1a967d66c36eaa4f265cc66b75-111x28.svg";
import databricksLogo from "@/assets/455d894aacf22525f4308a99d0424d33d268cef0-122x28.svg";
import canvaLogo from "@/assets/4a4d5ac5c52131ce0831cb080bef41206acc6011-69x28.svg";
import andurilLogo from "@/assets/4123a4908976bd119651a758403fc74558d52d81-110x28.svg";

export default function VentureHero() {
  return (
    <section className="w-full px-4 py-20 md:py-32 bg-[#0C0C0C] text-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-sm uppercase text-gray-400 mb-3 tracking-wide">
            Venture Capital
          </h2>
          <h1 className="text-4xl md:text-5xl font-sectra font-medium mb-6 leading-tight">
            Invest in tomorrow’s great tech companies, today
          </h1>
          <p className="text-gray-400 text-base mb-6">
            We aim to give all investors the opportunity to invest in a portfolio of
            top-tier private technology companies before they IPO.
          </p>
          <Link to={"/onboarding/email"}>
            <Button className="bg-primary hover:bg-[#8c391e] text-white text-sm px-6 py-3 rounded-md">
              Sign up
            </Button>
          </Link>
        </div>

        <div className="relative w-full">
          <img
            src={heroImg}
            alt="Developer investing in tech startups"
            className="w-full h-auto rounded-md"
          />
        </div>
      </div>

      {/* Featured companies section */}
      <div className="max-w-6xl mx-auto mt-16 border-t border-gray-800 pt-10 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-6">
          Featured Companies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-14">
          <img src={openaiLogo} alt="OpenAI" className="h-8" />
          <img src={anthropicLogo} alt="Anthropic" className="h-8" />
          <img src={databricksLogo} alt="Databricks" className="h-8" />
          <img src={canvaLogo} alt="Canva" className="h-8" />
          <img src={andurilLogo} alt="Anduril" className="h-8" />
        </div>
      </div>
    </section>
  );
}

import LandingNavbar from "@/components/layout/LandingNavbar";
import AboutHero from "./AboutHero";

export default function AboutPage() {
  return (
    <main className="bg-background text-foreground">
      <LandingNavbar />
      <AboutHero />
      {/* Other sections will follow */}
    </main>
  );
}

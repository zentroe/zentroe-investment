import LandingNavbar from "@/components/layout/LandingNavbar";
import HeroSection from "./HeroSection";
import RewardsSection from "./RewardsSection";
import ImageCollageSection from "./ImageCollageSection";
import LandingAboutSection from "./LandingAboutSection";
import FeaturedInvestments from "./FeaturedInvestments";
import WhyZentroe from "./WhyZentroe";
import HighPerformance from "./HighPerformance";
import StartBuilding from "./StartBuilding";
import LandingFooter from "@/components/layout/LandingFooter";

export default function LandingPage() {
  return (
    <div className="bg-[#FAF9F6] tracking-tight font-[300] min-h-screen">
      <LandingNavbar />
      <HeroSection />
      <RewardsSection />
      <ImageCollageSection />
      <LandingAboutSection />
      <FeaturedInvestments />
      <WhyZentroe />
      <HighPerformance />
      <StartBuilding />
      <LandingFooter />

      {/* Rest of Landing Sections */}
    </div>
  );
}

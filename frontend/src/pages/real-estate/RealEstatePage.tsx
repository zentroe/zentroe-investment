import LandingNavbar from "@/components/layout/LandingNavbar";
import RealEstateHero from "./RealEstateHero";
import WhyPrivateRealEstate from "./WhyPrivateRealEstate";
import FeaturedFund from "./FeaturedFund";
import RealEstateStrategies from "./RealEstateStrategies";
import PropertiesGrid from "./PropertiesGrid";
import AddPrivateCTA from "./AddPrivateCTA";
import LandingFooter from "@/components/layout/LandingFooter";


export default function RealEstatePage() {
  return (
    <div className="bg-[#FAF9F6] tracking-tight font-[300] min-h-screen">
      <LandingNavbar />
      <RealEstateHero />
      <WhyPrivateRealEstate />
      <FeaturedFund />
      <RealEstateStrategies />
      <PropertiesGrid />
      <AddPrivateCTA />
      <LandingFooter />
    </div>
  );
}


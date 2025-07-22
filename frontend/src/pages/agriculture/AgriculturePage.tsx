import LandingNavbar from "@/components/layout/LandingNavbar";
import AgricultureHero from "./AgricultureHero";
import WhyInvestFarmland from "./WhyInvestFarmland";
import FarmlandHowItWorks from "./FarmlandHowItWorks";
import FarmlandStats from "./FarmlandStats";
import LandingFooter from "@/components/layout/LandingFooter";
import FinalCallToAction from "./FinalCallToAction";

export default function AgriculturePage() {
  return (
    <div className="bg-[#FAF9F6] tracking-tight font-[300] min-h-screen">
      <LandingNavbar />
      <AgricultureHero />
      <WhyInvestFarmland />
      <FarmlandHowItWorks />
      <FarmlandStats />
      <FinalCallToAction />
      <LandingFooter />
    </div>
  )
}
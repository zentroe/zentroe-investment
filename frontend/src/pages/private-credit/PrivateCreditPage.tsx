import LandingNavbar from "@/components/layout/LandingNavbar";
import PrivateCreditHero from "./PrivateCreditHero";
import LandingFooter from "@/components/layout/LandingFooter";
import WhyPrivateCredit from "./WhyPrivateCredit";
import PrivateTrackRecord from "./PrivateTrackRecord";
import IncomeFund from "./IncomeFund";
import MarketOpportunitySection from "./MarketOpportunitySection";
import CallToAction from "./CallToAction";

export default function PrivateCreditPage() {
  return (
    <div className="bg-[#FAF9F6] tracking-tight font-[300] min-h-screen">
      <LandingNavbar />
      <PrivateCreditHero />
      <WhyPrivateCredit />
      <PrivateTrackRecord />
      <IncomeFund />
      <MarketOpportunitySection />
      <CallToAction />
      <LandingFooter />
    </div>
  );
}

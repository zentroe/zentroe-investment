import { Helmet } from "react-helmet-async";
import VentureHero from "@/pages/venture/VentureHero";
import LandingNavbar from "@/components/layout/LandingNavbar";
import WhyVenture from "./WhyVenture";
import VentureFundHighlight from "./VentureFundHighlight";
import VentureAdvantage from "./VentureAdvantage";
import VentureCTA from "./VentureCTA";
import LandingFooter from "@/components/layout/LandingFooter";

export default function VenturePage() {
  return (
    <div className=" min-h-screen">
      <Helmet>
        <title>Venture | Zentroe</title>
      </Helmet>
      <LandingNavbar />
      <VentureHero />
      <WhyVenture />
      <VentureFundHighlight />
      <VentureAdvantage />
      <VentureCTA />
      <LandingFooter />
    </div>
  );
}
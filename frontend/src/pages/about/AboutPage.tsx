import LandingNavbar from "@/components/layout/LandingNavbar";
import LandingFooter from "@/components/layout/LandingFooter";
import AboutHero from "./AboutHero";
import AboutMission from "./AboutMission";
import AboutValues from "./AboutValues";
import AboutTimeline from "./AboutTimeline";
// import AboutTeam from "./AboutTeam";

export default function AboutPage() {
  return (
    <main className="bg-background text-foreground">
      <LandingNavbar />
      <AboutHero />
      <AboutMission />
      <AboutValues />
      <AboutTimeline />
      {/* <AboutTeam /> */}
      <LandingFooter />
    </main>
  );
}

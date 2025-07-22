// src/pages/onboarding/Intro.tsx
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OnboardingLayout from "./OnboardingLayout";

export default function Intro() {
  const navigate = useNavigate();

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Find Your Portfolio | Zentroe</title>
      </Helmet>

      <div className="mt-24 flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-left space-y-6">
          <div className="flex justify-start">
            <img
              src="/illustration-compass.svg" // optional decorative icon
              alt="Compass Icon"
              className="w-20"
            />
          </div>

          <h1 className="text-3xl font-sectra text-darkPrimary">
            Let's find the best portfolio for you
          </h1>
          <p className="text-sm text-left text-gray-600">
            Answer a short series of questions so we can recommend the right Zentroe portfolio for you.
          </p>

          <div className="space-y-3">
            <Button
              className="w-full text-white text-sm bg-primary hover:bg-[#8c391e]"
              onClick={() => navigate("/onboarding/most-important")}
            >
              Get started
            </Button>

            {/* <Button
              variant="outline"
              className="w-full text-sm border border-gray-400"
              onClick={() => navigate("/dashboard")}
            >
              I already know what I want
            </Button> */}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}

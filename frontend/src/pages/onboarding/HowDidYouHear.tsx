import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OnboardingLayout from "./OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Circle, CheckCircle } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { saveReferralSource } from "@/services/onboardingService";
import { toast } from "sonner";

export default function HowDidYouHear() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { data, loading: contextLoading, updateLocalData } = useOnboarding();

  // Pre-populate from context data
  useEffect(() => {
    if (data.referralSource) {
      // Check if it's one of our predefined sources
      const predefinedSources = [
        "Podcast",
        "Social Media Influencer",
        "Social Media Ad",
        "Yahoo Finance",
        "Website, Blog or Article",
        "Frich",
        "Select Black Card",
        "The Penny Hoarder",
        "Family or Friend",
        "Other"
      ];

      if (predefinedSources.includes(data.referralSource)) {
        setSelected(data.referralSource);
      } else {
        setSelected("Other");
        setCustomInput(data.referralSource);
      }
    }
  }, [data.referralSource]);

  const sources = [
    "Podcast",
    "Social Media Influencer",
    "Social Media Ad",
    "Yahoo Finance",
    "Website, Blog or Article",
    "Frich",
    "Select Black Card",
    "The Penny Hoarder",
    "Family or Friend",
    "Other",
  ];

  const handleSelect = (option: string) => {
    setSelected(option);
    if (option !== "Other") setCustomInput("");
  };

  const isValid = selected && (selected !== "Other" || customInput.trim() !== "");

  const handleContinue = async () => {
    if (!isValid) return;

    const source = selected === "Other" ? customInput.trim() : selected;

    try {
      setLoading(true);

      // Save referral source using our new onboarding service
      await saveReferralSource(source);

      // Update local context data for immediate UI feedback
      updateLocalData({ referralSource: source });

      // toast.success("Referral source saved");
      navigate("/onboarding/processing");
    } catch (error) {
      console.error("Failed to save referral source:", error);
      toast.error("Could not save your data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <Helmet>
        <title>How Did You Hear About Us | Zentroe</title>
      </Helmet>

      <div className="mt-14 px-4 pb-12 max-w-xl mx-auto">
        <h1 className="text-3xl font-sectra text-darkPrimary mb-2">
          How did you hear about Zentroe?
        </h1>

        {contextLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {selected && (
              <p className="text-sm text-green-600 mt-2">
                Previously selected: {selected === "Other" ? customInput : selected}
              </p>
            )}

            <div className="mt-8 border divide-y">
              {sources.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full cursor-pointer px-4 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition ${selected === option ? "border-primary bg-gray-50" : "border-gray-300"
                    }`}
                >
                  <span className="text-darkPrimary">{option}</span>
                  {selected === option ? (
                    <CheckCircle className="text-primary" size={20} />
                  ) : (
                    <Circle className="text-gray-400" size={20} />
                  )}
                </button>
              ))}
            </div>

            {selected === "Other" && (
              <div className="mt-4">
                <label htmlFor="other-source" className="block text-sm font-medium text-darkPrimary mb-2">
                  Please specify:
                </label>
                <input
                  id="other-source"
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full border border-gray-400 rounded px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter your source..."
                />
              </div>
            )}
          </>
        )}

        <div className="mt-8 flex gap-4 justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Back
          </button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="text-sm border border-gray-400"
              onClick={() => navigate("/onboarding/processing")}
            >
              Skip
            </Button>

            <Button
              className="text-sm text-white bg-primary hover:bg-[#8c391e] disabled:opacity-50"
              disabled={!isValid || loading || contextLoading}
              onClick={handleContinue}
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}

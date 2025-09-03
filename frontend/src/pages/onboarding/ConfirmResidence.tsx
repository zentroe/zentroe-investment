import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OnboardingLayout from "./OnboardingLayout";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/context/OnboardingContext";
import { saveResidenceAndCitizenship } from "@/services/onboardingService";
import { toast } from "sonner";

// Common countries list (you can expand this)
const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Netherlands",
  "Switzerland",
  "Japan",
  "Singapore",
  "Other"
];

export default function ConfirmResidence() {
  const navigate = useNavigate();
  const [countryOfResidence, setCountryOfResidence] = useState("");
  const [countryOfCitizenship, setCountryOfCitizenship] = useState("");
  const [loading, setLoading] = useState(false);

  const { data, loading: contextLoading, updateLocalData } = useOnboarding();

  // Pre-populate from context data
  useEffect(() => {
    if (data.countryOfResidence) {
      setCountryOfResidence(data.countryOfResidence);
    }
    if (data.countryOfCitizenship) {
      setCountryOfCitizenship(data.countryOfCitizenship);
    }
  }, [data.countryOfResidence, data.countryOfCitizenship]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!countryOfResidence || !countryOfCitizenship) {
      toast.error("Please select both country of residence and citizenship");
      return;
    }

    setLoading(true);

    try {
      await saveResidenceAndCitizenship(countryOfResidence, countryOfCitizenship);

      // Update local context data for immediate UI feedback
      updateLocalData({
        countryOfResidence,
        countryOfCitizenship
      });

      toast.success("Residence and citizenship information saved.");
      navigate("/onboarding/select-account-form");
    } catch (error) {
      console.error("Error saving residence and citizenship:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading) {
    return (
      <OnboardingLayout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Confirm Residence | Zentroe</title>
      </Helmet>

      <div className="mt-24 px-4 max-w-xl mx-auto">
        <h1 className="text-3xl font-sectra text-darkPrimary mb-2 leading-snug">
          Confirm your residence and citizenship
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          This information helps us ensure compliance with investment regulations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country of Residence *
            </label>
            <select
              value={countryOfResidence}
              onChange={(e) => setCountryOfResidence(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Select your country of residence</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country of Citizenship *
            </label>
            <select
              value={countryOfCitizenship}
              onChange={(e) => setCountryOfCitizenship(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Select your country of citizenship</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              disabled={!countryOfResidence || !countryOfCitizenship || loading}
              className="text-white text-sm bg-primary hover:bg-[#8c391e] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Continue"}
            </Button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
}

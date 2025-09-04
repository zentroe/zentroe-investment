import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OnboardingLayout from "./OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/context/OnboardingContext";
import { savePersonalInfo } from "@/services/onboardingService";
import { toast } from "sonner";

export default function LegalName() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const { data, loading: contextLoading, updateLocalData } = useOnboarding();

  // Pre-populate from context data
  useEffect(() => {
    if (data.firstName) {
      setFirstName(data.firstName);
    }
    if (data.lastName) {
      setLastName(data.lastName);
    }
  }, [data.firstName, data.lastName]);

  const isValid = firstName.trim() !== "" && lastName.trim() !== "";

  const handleContinue = async () => {
    if (!isValid) return;
    setLoading(true);

    try {
      await savePersonalInfo(firstName.trim(), lastName.trim());

      // Update local context data for immediate UI feedback
      updateLocalData({
        firstName: firstName.trim(),
        lastName: lastName.trim()
      });

      toast.success("Name saved");
      navigate("/onboarding/other-personal-info");
    } catch (error) {
      console.error("Error saving legal name:", error);
      toast.error("Failed to save name. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Enter Legal Name | Zentroe</title>
      </Helmet>

      <div className="mt-24 px-4 max-w-xl mx-auto">
        <h1 className="text-3xl font-sectra text-darkPrimary mb-2">
          Enter your full legal name
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          This should match the name on the bank account you're planning to use to invest.
          {(data.firstName || data.lastName) && !contextLoading && (
            <span className="block mt-2 text-primary font-medium">
              Previously saved: {data.firstName} {data.lastName}
            </span>
          )}
        </p>

        {contextLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-10">
              <div className="w-full">
                <label className="block text-sm text-darkPrimary mb-1">
                  Legal first name
                </label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>

              <div className="w-full">
                <label className="block text-sm text-darkPrimary mb-1">
                  Legal last name
                </label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate(-1)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Back
              </button>

              <Button
                disabled={!isValid || loading}
                onClick={handleContinue}
                className="text-sm text-white bg-primary px-8 hover:bg-[#8c391e] disabled:opacity-50"
              >
                {loading ? "Saving..." : "Continue"}
              </Button>
            </div>
          </>
        )}
      </div>
    </OnboardingLayout>
  );
}

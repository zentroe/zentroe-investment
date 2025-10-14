import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OnboardingLayout from "./OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/context/OnboardingContext";
import { savePhoneNumber } from "@/services/onboardingService";
import { toast } from "sonner";

export default function PhoneNumber() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const { data, loading: contextLoading, updateLocalData } = useOnboarding();

  // Pre-populate from context data
  useEffect(() => {
    if (data.phone) {
      setPhone(data.phone);
    }
  }, [data.phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    setLoading(true);

    try {
      await savePhoneNumber(phone.trim());

      // Update local context data for immediate UI feedback
      updateLocalData({ phone: phone.trim() });

      toast.success("Phone number saved.");
      navigate("/onboarding/personal-info");
    } catch (error) {
      console.error("Error saving phone number:", error);
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
        <title>Phone Number | Zentroe</title>
      </Helmet>

      <div className="mt-24 px-4 max-w-xl mx-auto">
        <h1 className="text-3xl font-sectra text-darkPrimary mb-2 leading-snug">
          What's your phone number?
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          We'll use this to contact you about your account and investments.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Please include your country code if outside the US
            </p>
          </div>

          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              disabled={!phone.trim() || loading}
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

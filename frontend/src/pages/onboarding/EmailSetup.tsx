import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OnboardingLayout from "./OnboardingLayout";
import { Helmet } from "react-helmet-async";
import { useOnboarding } from "@/context/OnboardingContext";
import { toast } from "sonner";
import { checkEmail } from "@/services/auth";

export default function EmailSetup() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { setOnboarding, updateOnboardingStep } = useOnboarding();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      // Check if email is available
      await checkEmail(email);

      // Update onboarding context
      setOnboarding({ email });
      updateOnboardingStep(1);

      // Navigate to password setup
      navigate("/onboarding/password");
      toast.success("Email verified! Please set up your password.");

    } catch (error: any) {
      console.error("Email check error:", error);

      if (error.message.includes("already exists") || error.message.includes("already registered")) {
        toast.error("This email is already registered. Please try logging in or use a different email.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <Helmet>
        <title>Sign Up | Zentroe</title>
      </Helmet>
      <div className="max-w-lg mx-auto mt-14 space-y-12">
        <div>
          <h1 className="text-3xl font-sectra text-darkPrimary">
            What is your email address?
          </h1>
          <p className="mt-2 text-sm text-normal text-gray-600">
            Tell us a bit about yourself -- we'll create your account and suggest the strategy that best fits your goals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="block text-sm font-medium text-darkPrimary">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="transition-colors focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button
            type="submit"
            className="w-full text-white text-sm bg-primary hover:bg-[#8c391e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Validating...</span>
              </div>
            ) : (
              "Continue"
            )}
          </Button>
        </form>

        <p className="text-xs text-gray-500 mt-6 text-center">
          By continuing you indicate you have reviewed and agree to the{" "}
          <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a> and{" "}
          <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </OnboardingLayout>
  );
}

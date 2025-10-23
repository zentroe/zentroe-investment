import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OnboardingLayout from "@/components/OnboardingLayout";
import { Helmet } from "react-helmet-async";
import { checkEmail } from "@/services/auth";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export default function EmailSetup() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract referral code from URL parameters
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferralCode(refParam);
      // Store referral code in localStorage for the signup process
      localStorage.setItem('referralCode', refParam);
      toast.success('Referral code detected!');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate email using Zod schema
      const validatedData = emailSchema.parse({ email });

      // Check if email exists using auth service
      await checkEmail(validatedData.email);

      // Store email temporarily in localStorage for password setup
      localStorage.setItem('tempEmail', validatedData.email);

      // Keep referral code stored for the complete signup process
      if (referralCode) {
        localStorage.setItem('referralCode', referralCode);
      }

      navigate("/onboarding/password");
      const successMessage = referralCode
        ? "Email verified! Please set up your password. Your referral bonus is ready!"
        : "Email verified! Please set up your password.";
      toast.success(successMessage);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("This email is already registered. Please use a different email or sign in.");
      } else if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      } else {
        toast.error("Please enter a valid email address");
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
          {referralCode && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Referral Code Applied: <span className="font-bold">{referralCode}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-darkPrimary">
              Email address
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full"
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              "Continue"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          {/* <p className="mt-4">
            By continuing you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p> */}
          <p className="mt-4">
            Already have an account?{" "}
            <a href="/auth/login" className="text-primary hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}

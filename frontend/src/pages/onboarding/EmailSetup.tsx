import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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

      navigate("/onboarding/password");
      toast.success("Email verified! Please set up your password.");
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
          <p className="mt-4">
            By continuing you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>
          <p className="mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}

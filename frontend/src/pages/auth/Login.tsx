import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthLayout from "./AuthLayout";
import { login } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuthUser } = useAuth();

  // Pre-fill email if passed from EmailSetup
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const getNextOnboardingRoute = (user: any) => {
    // If onboarding is completed, go to dashboard
    if (user.onboardingStatus === "completed") {
      return "/dashboard";
    }

    // Define the exact onboarding sequence as per AppRoutes
    const onboardingSequence = [
      { route: "/onboarding/account-type", condition: () => !user.accountType },
      { route: "/onboarding/intro", condition: () => !user.hasSeenIntro },
      { route: "/onboarding/most-important", condition: () => !user.portfolioPriority },
      { route: "/onboarding/motivation", condition: () => !user.riskTolerance },
      { route: "/onboarding/income", condition: () => !user.annualIncome },
      { route: "/onboarding/satisfied-amount", condition: () => !user.annualInvestmentAmount },
      { route: "/onboarding/hdyh", condition: () => !user.referralSource },
      { route: "/onboarding/processing", condition: () => false }, // Skip - this is just a transition page
      { route: "/onboarding/investment-recommendation", condition: () => !user.recommendedPortfolio },
      { route: "/onboarding/personal-intro", condition: () => !user.firstName || !user.lastName },
      { route: "/onboarding/select-account-form", condition: () => !user.accountSubType },
      { route: "/onboarding/personal-info", condition: () => !user.firstName || !user.lastName },
      { route: "/invest/intro", condition: () => !user.initialInvestmentAmount },
      { route: "/invest/payment-amount", condition: () => !user.initialInvestmentAmount },
      { route: "/invest/auto-invest", condition: () => !user.recurringFrequency },
    ];

    // Find the first incomplete step
    for (const step of onboardingSequence) {
      if (step.condition()) {
        return step.route;
      }
    }

    // If all steps seem complete but onboarding status isn't "completed", go to dashboard
    return "/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(email, password);
      const userData = response.data || response.user || response;

      // Set user in auth context
      setAuthUser(userData);

      toast.success("Welcome back!");

      // Route user based on onboarding status
      const nextRoute = getNextOnboardingRoute(userData);
      navigate(nextRoute);

    } catch (error: any) {
      if (error?.response?.status === 403) {
        toast.error("Please verify your email to log in.");
      } else {
        toast.error("Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Helmet>
        <title>Log In | Zentroe</title>
      </Helmet>

      <div className="max-w-md flex flex-col justify-center mx-auto mt-14 md:min-h-[80vh] h-full space-y-12">
        <h1 className="text-4xl font-sectra text-darkPrimary text-center">Log in</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-darkPrimary">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              className="bg-white"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2 relative">
            <label htmlFor="password" className="text-sm font-medium text-darkPrimary">
              Password
            </label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              className="bg-white pr-10"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-11 right-3 text-gray-500"
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
            <a href="#" className="text-xs text-primary hover:underline self-end mt-1">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center text-sm"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Log in"
            )}
          </Button>
        </form>

        <div className="text-sm text-center text-darkPrimary">
          Not an investor yet?{" "}
          <a href="/onboarding/email" className="text-primary underline">
            Sign up now
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}

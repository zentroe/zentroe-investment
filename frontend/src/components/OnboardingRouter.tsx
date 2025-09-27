import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import FullScreenLoader from "@/components/FullScreenLoader";

interface OnboardingRouterProps {
  children: React.ReactNode;
}

export const OnboardingRouter = ({ children }: OnboardingRouterProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasInitialized, setHasInitialized] = useState(false);

  const getOnboardingRoute = (user: any) => {
    // If onboarding is completed AND email is verified, go to dashboard
    if (user?.onboardingStatus === "completed" && user?.isEmailVerified) {
      return "/dashboard";
    }

    // If onboarding is completed but email is not verified, the DashboardLayout will handle this
    if (user?.onboardingStatus === "completed" && !user?.isEmailVerified) {
      return "/dashboard"; // Let DashboardLayout show the email verification screen
    }

    // Use server-side step if available, otherwise determine from data
    if (user?.onboardingStep !== undefined && user.onboardingStep > 0) {
      const stepRoutes = [
        "/signup",
        "/onboarding/password",
        "/onboarding/intro",
        "/onboarding/most-important",
        "/onboarding/motivation",
        "/onboarding/income",
        "/onboarding/satisfied-amount",
        "/onboarding/hdyh",
        "/onboarding/processing",
        "/onboarding/investment-recommendation",
        "/onboarding/personal-intro",
        "/onboarding/select-account-form",
        "/onboarding/personal-info",
        "/invest/intro",
        "/invest/payment-amount",
        "/invest/auto-invest"
      ];

      return stepRoutes[user.onboardingStep] || "/signup";
    }

    // Fallback: determine step based on available data
    if (!user?.email) return "/signup";
    if (!user?.hasPassword && !user?.password) return "/onboarding/password";
    if (!user?.investmentGoal) return "/onboarding/motivation";
    if (!user?.annualIncome) return "/onboarding/income";
    if (!user?.firstName || !user?.lastName) return "/onboarding/personal-info";

    // Default to intro if nothing else matches
    return "/onboarding/intro";
  }; useEffect(() => {
    // Only run routing logic after auth has loaded and we haven't initialized yet
    if (isLoading || hasInitialized) return;

    const currentPath = location.pathname;

    // Skip routing for certain paths to avoid infinite loops
    const skipPaths = [
      '/',
      '/auth/login',
      '/confirm-email',
      '/resend-confirmation',
      '/real-estate',
      '/agriculture',
      '/private-credit',
      '/venture',
      '/about'
    ];

    if (skipPaths.includes(currentPath)) {
      setHasInitialized(true);
      return;
    }

    try {
      // If user is authenticated
      if (isAuthenticated && user) {
        // Get where they should be based on onboarding status
        const correctRoute = getOnboardingRoute(user);

        // Don't redirect if they're already on the correct route
        if (currentPath === correctRoute) {
          setHasInitialized(true);
          return;
        }

        // Allow dashboard access only if email is verified AND onboarding is complete
        if (currentPath.startsWith('/dashboard')) {
          if (user.onboardingStatus === "completed" && user.isEmailVerified) {
            setHasInitialized(true);
            return;
          } else {
            // Force incomplete onboarding users or unverified emails back to appropriate step
            if (!user.isEmailVerified) {
              console.log("Redirecting user with unverified email to email verification");
              // The DashboardLayout will handle the email verification UI
              setHasInitialized(true);
              return;
            } else {
              console.log("Redirecting incomplete user from dashboard to onboarding");
              navigate(correctRoute, { replace: true });
              setHasInitialized(true);
              return;
            }
          }
        }

        // Allow payment routes if user is authenticated
        if (currentPath.startsWith('/payment')) {
          setHasInitialized(true);
          return;
        }

        // For onboarding routes, allow them to stay but ensure they're on a valid step
        if (currentPath.startsWith('/onboarding') || currentPath.startsWith('/invest')) {
          setHasInitialized(true);
          return;
        }

        // For other authenticated routes, redirect to correct onboarding step
        console.log("Redirecting authenticated user to:", correctRoute);
        navigate(correctRoute, { replace: true });
      }

      // If user is not authenticated
      else {
        // Allow access to public routes and auth routes
        if (currentPath.startsWith('/auth') ||
          currentPath.startsWith('/signup') ||
          currentPath.startsWith('/onboarding/password')) {
          setHasInitialized(true);
          return;
        }

        // Redirect protected routes to onboarding
        if (currentPath.startsWith('/dashboard') ||
          currentPath.startsWith('/invest') ||
          currentPath.startsWith('/payment')) {
          navigate("/signup", { replace: true });
        }
      }
    } catch (error) {
      console.error("OnboardingRouter error:", error);
    }

    setHasInitialized(true);
  }, [isAuthenticated, user, isLoading, location.pathname, navigate, hasInitialized]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
};

export default OnboardingRouter;

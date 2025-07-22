import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import FullScreenLoader from "@/components/FullScreenLoader";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  redirectTo = "/login",
  adminOnly = false
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If user is authenticated but shouldn't be (like login/register pages)
  if (!requireAuth && isAuthenticated) {
    // Check if user completed onboarding
    if (user?.onboardingStatus === "completed") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/onboarding/email" replace />;
    }
  }

  // Admin only routes
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

import { Outlet, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { resendEmailVerification } from "@/services/auth";
import { toast } from "sonner";
import {
  Mail,
  ArrowRight,
  User
} from "lucide-react";

export default function DashboardLayout() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [resendingEmail, setResendingEmail] = useState(false);

  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (shouldn't happen with routing guards, but safety check)
  if (!user) {
    useEffect(() => {
      navigate('/auth/login');
    }, [navigate]);
    return null;
  }

  const handleResendEmail = async () => {
    if (!user?.email) return;

    setResendingEmail(true);
    try {
      await resendEmailVerification(user.email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send verification email';
      toast.error(errorMessage);
    } finally {
      setResendingEmail(false);
    }
  };

  // Check email verification status
  if (!user.isEmailVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-50 mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>

              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Email Verification Required
              </h1>

              <p className="text-gray-600 mb-6">
                Please verify your email address to access your dashboard. We've sent a verification link to <strong>{user.email}</strong>.
              </p>

              <div className="space-y-4">
                <Button
                  onClick={handleResendEmail}
                  disabled={resendingEmail}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>
                    {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                  </span>
                </Button>

                <div className="text-center">
                  <Link
                    to="/resend-confirmation"
                    className="text-sm text-primary hover:text-primary/80 hover:underline"
                  >
                    Need help with email verification?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check onboarding completion status
  if (user.onboardingStatus !== "completed") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 mb-4">
                <User className="h-6 w-6 text-blue-600" />
              </div>

              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Complete Your Setup
              </h1>

              <p className="text-gray-600 mb-6">
                You're almost there! Please complete your account setup to access your dashboard.
              </p>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">Current Status:</span>
                  <span className="font-medium text-blue-800 capitalize">
                    {user.onboardingStatus || 'In Progress'}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => {
                  // Route user to appropriate onboarding step
                  switch (user.onboardingStatus) {
                    case "started":
                      navigate("/onboarding/account-type");
                      break;
                    case "basicInfo":
                      navigate("/onboarding/intro");
                      break;
                    case "investmentProfile":
                      navigate("/onboarding/personal-details-intro");
                      break;
                    case "verification":
                      navigate("/invest/payment-amount");
                      break;
                    case "bankConnected":
                      navigate("/payment");
                      break;
                    default:
                      navigate("/onboarding/account-type");
                  }
                }}
                className="w-full flex items-center justify-center space-x-2"
              >
                <span>Continue Setup</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If all checks pass, render the dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content - with left margin to account for fixed sidebar */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
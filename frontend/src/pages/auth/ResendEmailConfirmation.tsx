import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resendEmailVerification } from "@/services/auth";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";

export default function ResendEmailConfirmation() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await resendEmailVerification(email);
      setEmailSent(true);
      toast.success("Verification email sent successfully!");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message;

      if (errorMessage === "User not found.") {
        toast.error("No account found with this email address");
      } else if (errorMessage === "Email is already verified.") {
        toast.error("This email is already verified. You can log in now.");
        navigate("/auth/login");
      } else {
        toast.error(errorMessage || "Failed to send verification email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/auth/login");
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Helmet>
          <title>Email Sent | Zentroe</title>
        </Helmet>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <img
              className="h-8 w-auto"
              src="/zen-siteIcon.svg"
              alt="Zentroe"
            />
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <Mail className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Email Sent!
              </h1>
              <p className="text-gray-600 mb-6">
                We've sent a new verification link to <strong>{email}</strong>.
                Please check your inbox and click the link to verify your account.
              </p>
              <div className="space-y-3">
                <Button onClick={handleBackToLogin} className="w-full">
                  Back to Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEmailSent(false)}
                  className="w-full"
                >
                  Send to Different Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Helmet>
        <title>Resend Email Confirmation | Zentroe</title>
      </Helmet>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            className="h-8 w-auto"
            src="/zen-siteIcon.svg"
            alt="Zentroe"
          />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <Link
              to="/auth/login"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Resend Email Confirmation
            </h1>
            <p className="text-gray-600">
              Enter your email address and we'll send you a new verification link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full"
              >
                {loading ? "Sending..." : "Send Verification Email"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleBackToLogin}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password? {" "}
              <Link to="/auth/login" className="text-primary hover:underline">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

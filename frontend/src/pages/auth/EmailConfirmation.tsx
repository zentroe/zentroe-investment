import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmEmail } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";

type ConfirmationStatus = 'loading' | 'success' | 'error' | 'expired' | 'invalid';

export default function EmailConfirmation() {
  const [status, setStatus] = useState<ConfirmationStatus>('loading');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const token = searchParams.get('token');
  const [showSuccessDelay, setShowSuccessDelay] = useState(false);

  useEffect(() => {
    const confirmUserEmail = async () => {
      if (!token) {
        console.log('❌ No token found in URL parameters');
        setStatus('invalid');
        setMessage('Invalid confirmation link. Please check the email link and try again.');
        return;
      }

      console.log('🔍 Attempting to confirm email with token:', token.substring(0, 20) + '...');

      try {
        const response = await confirmEmail(token);
        console.log('✅ Email confirmation successful:', response);
        setStatus('success');
        setMessage(response.message || 'Email confirmed successfully!');

        // Refresh user data to update email verification status
        try {
          await refreshUser();
        } catch (refreshError) {
          console.log('Note: Could not refresh user data immediately:', refreshError);
        }

        // Show success message for 2 seconds before enabling navigation
        setTimeout(() => {
          setShowSuccessDelay(true);
        }, 2000);
      } catch (error: any) {
        console.error('❌ Email confirmation failed:', error);

        if (error.response?.status === 400) {
          const errorMessage = error.response.data?.message;
          if (errorMessage?.includes('expired')) {
            setStatus('expired');
            setMessage('This confirmation link has expired. Please request a new verification email.');
          } else {
            setStatus('invalid');
            setMessage(errorMessage || 'This confirmation link is invalid or has already been used.');
          }
        } else if (error.response?.status === 500) {
          setStatus('error');
          setMessage('Server error occurred. Please try again later or contact support.');
        } else {
          setStatus('error');
          setMessage(error.response?.data?.message || 'Failed to confirm email. Please try again.');
        }
      }
    };

    confirmUserEmail();
  }, [token]);

  const handleContinueToLogin = () => {
    navigate('/auth/login');
  };

  const handleResendEmail = () => {
    // Navigate to the dedicated resend email confirmation page
    navigate('/resend-confirmation');
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Confirming your email...
            </h1>
            <p className="text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="relative mb-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 animate-pulse" />
              <div className="absolute -top-2 -right-2 h-4 w-4 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Confirmed! 🎉
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
              <br />
              <span className="text-green-600 font-medium">
                You can now log in and access all features of your Zentroe account!
              </span>
            </p>
            {showSuccessDelay ? (
              <Button onClick={handleContinueToLogin} className="w-full">
                Continue to Login
              </Button>
            ) : (
              <div className="text-sm text-gray-500">
                Redirecting you in a moment...
              </div>
            )}
          </div>
        );

      case 'expired':
      case 'invalid':
        return (
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {status === 'expired' ? 'Link Expired' : 'Invalid Link'}
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Button onClick={handleResendEmail} className="w-full">
                Get New Confirmation Link
              </Button>
              <Button
                variant="outline"
                onClick={handleContinueToLogin}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          </div>
        );

      case 'error':
      default:
        return (
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Button onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={handleContinueToLogin}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Helmet>
        <title>Confirm Email | Zentroe</title>
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

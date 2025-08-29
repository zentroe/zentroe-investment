import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmEmail } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { Helmet } from "react-helmet-async";

type ConfirmationStatus = 'loading' | 'success' | 'error' | 'expired' | 'invalid';

export default function EmailConfirmation() {
  const [status, setStatus] = useState<ConfirmationStatus>('loading');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const confirmUserEmail = async () => {
      if (!token) {
        setStatus('invalid');
        setMessage('Invalid confirmation link');
        return;
      }

      try {
        const response = await confirmEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email confirmed successfully!');
      } catch (error: any) {
        if (error.response?.status === 400) {
          setStatus('expired');
          setMessage('This confirmation link has expired or is invalid');
        } else {
          setStatus('error');
          setMessage(error.response?.data?.message || 'Failed to confirm email');
        }
      }
    };

    confirmUserEmail();
  }, [token]);

  const handleContinueToLogin = () => {
    navigate('/auth/login');
  };

  const handleResendEmail = () => {
    // TODO: Implement resend email functionality
    navigate('/onboarding/email');
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
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Confirmed!
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <Button onClick={handleContinueToLogin} className="w-full">
              Continue to Login
            </Button>
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

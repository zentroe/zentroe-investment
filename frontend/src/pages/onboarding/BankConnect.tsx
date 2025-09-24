import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

// This component handles the redirect from bank-connect to dashboard
// Since onboarding is now complete after payment, we redirect to dashboard
export default function BankConnect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Show a brief message and redirect to dashboard
    toast.info('Redirecting to your dashboard...');

    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-600">Taking you to your dashboard...</p>
      </div>
    </div>
  );
}
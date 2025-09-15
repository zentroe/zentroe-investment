import React from 'react';
import { CheckCircle, ArrowRight, Download, Clock } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import OnboardingLayout from '@/pages/onboarding/OnboardingLayout';

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as any;

  // Get data from location state (preferred) or URL params as fallback
  const paymentId = state?.paymentId || 'N/A';
  const amount = state?.amount || '0';
  const method = state?.method || 'unknown';

  return (
    <>
      <Helmet>
        <title>Payment Submitted - Zentroe Investment</title>
      </Helmet>

      <OnboardingLayout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Submitted!
            </h1>
            <p className="text-gray-600">
              Your investment payment is being processed
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-sm">{paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">${parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600 font-medium">Processing</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="capitalize">{method || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-blue-800 text-sm space-y-2">
              <li>• We'll verify your payment within 1-2 business days</li>
              <li>• You'll receive an email confirmation once processed</li>
              <li>• Your investment will be allocated to your chosen portfolio</li>
              <li>• Track your investment progress in your dashboard</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>

            <button className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </button>
          </div>

          {/* Support */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 mb-2">
              Need help? Contact our support team
            </p>
            <a
              href="mailto:support@zentroe.com"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              support@zentroe.com
            </a>
          </div>
        </div>
      </OnboardingLayout>
    </>
  );
};

export default PaymentSuccessPage;

import React from 'react';
import { CheckCircle, ArrowRight, Download, Clock } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import OnboardingLayout from '@/pages/onboarding/OnboardingLayout';

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as any;

  // Get data from location state (preferred) or URL params as fallback
  const paymentId = state?.paymentId || `ZTR-${Date.now()}`;
  const amount = state?.amount || '0';
  const method = state?.method || 'unknown';
  const currency = state?.currency || 'USD';

  const downloadReceipt = () => {
    try {
      const currentDate = new Date();
      const formattedAmount = parseFloat(amount || '0').toLocaleString('en-US', {
        style: 'currency',
        currency: currency || 'USD'
      });

      const methodDisplay = method === 'crypto' ? 'Cryptocurrency' :
        method === 'bank' ? 'Bank Transfer' :
          method === 'card' ? 'Credit/Debit Card' :
            method.charAt(0).toUpperCase() + method.slice(1);

      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow pop-ups to download the receipt');
        return;
      }

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Receipt - Zentroe Investment</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .receipt-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-logo {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }
            .receipt-title {
              font-size: 20px;
              color: #666;
              margin-bottom: 10px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #2563eb;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding: 5px 0;
            }
            .detail-label {
              font-weight: 600;
              color: #666;
            }
            .detail-value {
              font-weight: 500;
            }
            .amount-highlight {
              font-size: 18px;
              color: #059669;
              font-weight: bold;
            }
            .status-processing {
              color: #d97706;
              font-weight: 600;
            }
            .timeline-item {
              display: flex;
              align-items: center;
              margin-bottom: 8px;
            }
            .timeline-icon {
              width: 20px;
              margin-right: 10px;
              font-weight: bold;
            }
            .completed { color: #059669; }
            .pending { color: #d97706; }
            .info-list {
              list-style: none;
              padding: 0;
            }
            .info-list li {
              margin-bottom: 6px;
              padding-left: 15px;
              position: relative;
            }
            .info-list li:before {
              content: "•";
              color: #2563eb;
              font-weight: bold;
              position: absolute;
              left: 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              color: #666;
              font-size: 14px;
            }
            .generated-date {
              font-size: 12px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="company-logo">ZENTROE INVESTMENT</div>
              <div class="receipt-title">Payment Receipt</div>
              <div class="generated-date">Generated on ${currentDate.toLocaleString()}</div>
            </div>

            <div class="section">
              <div class="section-title">Payment Details</div>
              <div class="detail-row">
                <span class="detail-label">Receipt #:</span>
                <span class="detail-value">${paymentId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value amount-highlight">${formattedAmount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${methodDisplay}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value status-processing">Processing</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction Date:</span>
                <span class="detail-value">${currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${currentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      })}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Company Information</div>
              <div class="detail-row">
                <span class="detail-label">Company Name:</span>
                <span class="detail-value">Zentroe Investment LLC</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Website:</span>
                <span class="detail-value">https://www.zentroe.com</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email Support:</span>
                <span class="detail-value">support@zentroe.com</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Customer Service:</span>
                <span class="detail-value">Available 24/7</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Payment Processing Timeline</div>
              <div class="timeline-item">
                <span class="timeline-icon completed">✓</span>
                <span>Payment Submission - Completed</span>
              </div>
              <div class="timeline-item">
                <span>Payment Verification - In Progress (1-2 business days)</span>
              </div>
              <div class="timeline-item">
                <span>Investment Allocation - Pending verification</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Important Information</div>
              <ul class="info-list">
                <li>This receipt serves as proof of payment submission</li>
                <li>Keep this receipt for your tax and investment records</li>
                <li>Your investment will be processed after payment verification</li>
                <li>You can track your investment progress in your dashboard</li>
                <li>Contact support immediately if you notice any discrepancies</li>
              </ul>
            </div>

            <div class="section">
              <div class="section-title">Next Steps</div>
              <ul class="info-list">
                <li>Wait for payment verification (1-2 business days)</li>
                <li>Receive email confirmation once processed</li>
                <li>View your investment allocation in your dashboard</li>
                <li>Monitor your portfolio performance and returns</li>
              </ul>
            </div>

            <div class="footer">
              <div><strong>Thank you for choosing Zentroe Investment!</strong></div>
              <div style="margin-top: 10px;">
                For questions about this receipt, contact: support@zentroe.com
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Write content to the new window
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };

      toast.success('Receipt is ready for download! Use the print dialog to save as PDF.');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt. Please try again.');
    }
  };

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
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>

            <button
              onClick={downloadReceipt}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
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

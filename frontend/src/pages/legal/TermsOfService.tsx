import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import LandingFooter from '@/components/layout/LandingFooter';

const TermsOfService: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Zentroe Investment</title>
      </Helmet>
      <Navbar />
      <div className="min-h-screen font-atlantix bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
            <p className="text-sm text-gray-600 mt-2">Last updated: June 12, 2025</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">

            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Zentroe Investment ("Company", "we", "our", "us"). These Terms of Service ("Terms") govern your access to and use of our website, mobile application, and services (collectively, the "Service").
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the Service.
              </p>
            </section>

            {/* Investment Disclaimer */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Investment Disclaimer</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-amber-900 font-medium">⚠️ Important Investment Notice</p>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Investment performance may vary based on market conditions.</li>
                <li>Returns are generated from diversified portfolio strategies and market opportunities.</li>
                <li>We encourage you to review your investment goals and comfort level with market fluctuations.</li>
                <li>Our team is available to help you understand investment options that align with your objectives.</li>
              </ul>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Eligibility</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use our Service, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Be at least 18 years old or the age of legal majority in your jurisdiction.</li>
                <li>Have the legal capacity to enter into binding contracts.</li>
                <li>Not be prohibited from using the Service under applicable laws.</li>
                <li>Provide accurate and complete registration information.</li>
                <li>Comply with all applicable laws and regulations in your jurisdiction.</li>
              </ul>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Account Registration</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account with us, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Provide accurate, current, and complete information.</li>
                <li>Maintain and promptly update your account information.</li>
                <li>Maintain the security and confidentiality of your password.</li>
                <li>Notify us immediately of any unauthorized access to your account.</li>
                <li>Accept responsibility for all activities that occur under your account.</li>
              </ul>
            </section>

            {/* Investment Plans */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Investment Plans</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our investment plans are subject to the following terms:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Minimum and maximum investment amounts vary by plan.</li>
                <li>Investment durations are specified for each plan and cannot be changed after activation.</li>
                <li>Returns are calculated daily based on the profit percentage of your chosen plan.</li>
                <li>Withdrawals may be subject to lock-up periods as specified in the plan details.</li>
                <li>We reserve the right to modify, suspend, or discontinue any investment plan with notice.</li>
              </ul>
            </section>

            {/* Payments and Fees */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payments and Fees</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Regarding payments:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>All payments must be made in the currency specified for each transaction.</li>
                <li>Payment processing times vary by payment method (crypto, bank transfer, card).</li>
                <li>We may charge fees for certain services, which will be clearly disclosed.</li>
                <li>Third-party payment processors may charge additional fees.</li>
                <li>All payments are final and non-refundable except as required by law.</li>
              </ul>
            </section>

            {/* Withdrawals */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Withdrawals</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Withdrawal terms:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Withdrawals are subject to verification and approval processes.</li>
                <li>Processing times vary by withdrawal method.</li>
                <li>Minimum withdrawal amounts may apply.</li>
                <li>We reserve the right to request additional verification before processing withdrawals.</li>
                <li>Withdrawal requests may be delayed or denied if suspicious activity is detected.</li>
              </ul>
            </section>

            {/* User Conduct */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. User Conduct</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Use the Service for any illegal or unauthorized purpose.</li>
                <li>Attempt to gain unauthorized access to any part of the Service.</li>
                <li>Interfere with or disrupt the Service or servers.</li>
                <li>Use automated systems to access the Service without permission.</li>
                <li>Engage in any fraudulent, abusive, or harmful activities.</li>
                <li>Impersonate any person or entity.</li>
                <li>Violate any applicable laws or regulations.</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                The Service and its original content, features, and functionality are owned by Zentroe Investment and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>We are not liable for any indirect, incidental, special, or consequential damages.</li>
                <li>We do not guarantee continuous, uninterrupted, or secure access to the Service.</li>
                <li>We are not responsible for investment losses or missed opportunities.</li>
                <li>Our total liability shall not exceed the amount you paid us in the past 12 months.</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Zentroe Investment operates, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@zentroe.com<br />
                  <strong>Phone:</strong> +41 22 310 2488<br />
                  <strong>Address:</strong> Avenue de la Paix 17, 1202 Geneva, Switzerland
                </p>
              </div>
            </section>

          </div>
        </div>

        <LandingFooter />
      </div>
    </>
  );
};

export default TermsOfService;

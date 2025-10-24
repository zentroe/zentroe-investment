import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LandingFooter from '@/components/layout/LandingFooter';
import Navbar from '@/components/layout/Navbar';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Zentroe Investment</title>
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
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
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
                Zentroe Investment ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services (collectively, the "Service").
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Please read this Privacy Policy carefully. By using the Service, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may collect the following personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Identity Information:</strong> Name, date of birth, government-issued ID</li>
                <li><strong>Contact Information:</strong> Email address, phone number, mailing address</li>
                <li><strong>Financial Information:</strong> Bank account details, payment card information, investment amounts</li>
                <li><strong>Account Credentials:</strong> Username, password (encrypted)</li>
                <li><strong>Verification Documents:</strong> Identity verification documents, proof of address</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Automatically Collected Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns</li>
                <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
                <li><strong>Location Data:</strong> Approximate location based on IP address</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Transaction Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Investment transactions and history</li>
                <li>Deposit and withdrawal records</li>
                <li>Payment processing information</li>
                <li>Cryptocurrency wallet addresses (if applicable)</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Account Management:</strong> Create and maintain your account</li>
                <li><strong>Service Provision:</strong> Process investments, withdrawals, and transactions</li>
                <li><strong>Verification:</strong> Verify your identity and prevent fraud (KYC/AML compliance)</li>
                <li><strong>Communication:</strong> Send transaction confirmations, updates, and notifications</li>
                <li><strong>Customer Support:</strong> Respond to your inquiries and provide assistance</li>
                <li><strong>Legal Compliance:</strong> Comply with legal obligations and regulations</li>
                <li><strong>Service Improvement:</strong> Analyze usage patterns to enhance our Service</li>
                <li><strong>Security:</strong> Detect and prevent fraudulent activities</li>
                <li><strong>Marketing:</strong> Send promotional materials (with your consent)</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Share Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share your information with:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Service Providers</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Payment processors (Stripe, PayPal, cryptocurrency exchanges)</li>
                <li>Identity verification services</li>
                <li>Cloud hosting providers</li>
                <li>Email service providers</li>
                <li>Analytics services</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Legal Requirements</h3>
              <p className="text-gray-700 leading-relaxed">
                We may disclose your information if required by law, court order, or government request, or to protect our rights, property, or safety.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Business Transfers</h3>
              <p className="text-gray-700 leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Encryption:</strong> SSL/TLS encryption for data transmission</li>
                <li><strong>Secure Storage:</strong> Encrypted database storage</li>
                <li><strong>Access Controls:</strong> Limited access to authorized personnel only</li>
                <li><strong>Regular Audits:</strong> Security audits and vulnerability assessments</li>
                <li><strong>Two-Factor Authentication:</strong> Optional 2FA for account security</li>
                <li><strong>Monitoring:</strong> Continuous monitoring for suspicious activities</li>
              </ul>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <p className="text-amber-900 text-sm">
                  <strong>Note:</strong> No method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Provide our services to you</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Prevent fraud and maintain security</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                After account closure, we may retain certain information as required by law or for legitimate business purposes.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Depending on your jurisdiction, you may have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your information (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Request a copy of your data in a structured format</li>
                <li><strong>Objection:</strong> Object to certain processing of your information</li>
                <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                <li><strong>Withdrawal of Consent:</strong> Withdraw consent for marketing communications</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@zentroe.com.
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Maintain your session and keep you logged in</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze site traffic and usage patterns</li>
                <li>Improve our services and user experience</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                You can control cookies through your browser settings. However, disabling cookies may affect the functionality of the Service.
              </p>
            </section>

            {/* Third-Party Links */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Links</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We ensure appropriate safeguards are in place to protect your information.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@zentroe.com<br />
                  <strong>Phone:</strong> +41 22 310 2488<br />
                  <strong>Address:</strong> Avenue de la Paix 17, 1202 Geneva, Switzerland
                </p>
              </div>
            </section>

            {/* GDPR/CCPA Specific */}
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">Additional Rights for EU/EEA and California Residents</h2>
              <p className="text-blue-800 text-sm mb-3">
                If you are a resident of the European Union, European Economic Area, or California, you may have additional rights under GDPR or CCPA:
              </p>
              <ul className="list-disc list-inside space-y-2 text-blue-800 text-sm">
                <li>Right to know what personal information is collected and how it's used</li>
                <li>Right to deletion of personal information (subject to exceptions)</li>
                <li>Right to opt-out of sale of personal information (we do not sell your information)</li>
                <li>Right to non-discrimination for exercising your privacy rights</li>
                <li>Right to lodge a complaint with your local data protection authority</li>
              </ul>
            </section>

          </div>
        </div>
      </div>
      <LandingFooter />
    </>
  );
};

export default PrivacyPolicy;

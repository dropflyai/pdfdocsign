import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - PDFDocSign',
  description: 'PDFDocSign Privacy Policy. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-[#0a0a0a] py-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-zinc-500 mb-12">Last updated: March 13, 2026</p>

        <div className="space-y-10 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              PDFDocSign (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our PDF document signing service at pdfdocsign.com (the &quot;Service&quot;).
            </p>
            <p className="mt-3">
              By using the Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with this policy, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>

            <h3 className="text-lg font-medium text-zinc-300 mb-2">2.1 Account Information</h3>
            <p>When you create an account, we collect:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Authentication credentials (managed by Supabase Auth)</li>
            </ul>

            <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">2.2 Payment Information</h3>
            <p>
              Payment processing is handled entirely by Stripe. We do not store your credit card numbers, bank account details, or other financial information on our servers. Please refer to{' '}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">
                Stripe&apos;s Privacy Policy
              </a>{' '}
              for details on how they handle your payment data.
            </p>

            <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">2.3 Document Data</h3>
            <p>
              PDFDocSign is designed with a privacy-first approach. PDF documents you upload are processed in your browser and are not stored on our servers unless you explicitly choose to save them. Signed documents are stored temporarily to facilitate download and sharing, then deleted according to our retention schedule.
            </p>

            <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">2.4 Usage Data</h3>
            <p>We automatically collect certain information when you use the Service, including:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Pages visited and features used</li>
              <li>Date and time of access</li>
              <li>Device information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Provide, operate, and maintain the Service</li>
              <li>Process transactions and manage your subscription</li>
              <li>Send you service-related communications</li>
              <li>Respond to your requests and support inquiries</li>
              <li>Monitor and analyze usage patterns to improve the Service</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Third-Party Services</h2>
            <p>We use the following third-party services to operate PDFDocSign:</p>

            <h3 className="text-lg font-medium text-zinc-300 mt-4 mb-2">Supabase</h3>
            <p>
              We use Supabase for authentication and database storage. Your account data is stored securely on Supabase infrastructure. See{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">
                Supabase&apos;s Privacy Policy
              </a>.
            </p>

            <h3 className="text-lg font-medium text-zinc-300 mt-4 mb-2">Stripe</h3>
            <p>
              We use Stripe for payment processing. When you make a purchase, your payment information is sent directly to Stripe. See{' '}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">
                Stripe&apos;s Privacy Policy
              </a>.
            </p>

            <h3 className="text-lg font-medium text-zinc-300 mt-4 mb-2">Vercel</h3>
            <p>
              Our Service is hosted on Vercel. See{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">
                Vercel&apos;s Privacy Policy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies for:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-zinc-300">Essential cookies:</strong> Required for authentication and core functionality</li>
              <li><strong className="text-zinc-300">Preference cookies:</strong> To remember your settings and preferences</li>
              <li><strong className="text-zinc-300">Analytics cookies:</strong> To understand how users interact with the Service</li>
            </ul>
            <p className="mt-3">
              You can control cookies through your browser settings. Disabling essential cookies may prevent you from using certain features of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Data Retention</h2>
            <p>
              We retain your account information for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or compliance purposes.
            </p>
            <p className="mt-3">
              Uploaded documents that are processed in-browser are not retained by us. Documents stored on our servers for sharing or collaboration purposes are automatically deleted after 90 days of inactivity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data, including encryption in transit (TLS/SSL) and at rest. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Your Rights (GDPR &amp; CCPA)</h2>
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-zinc-300">Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong className="text-zinc-300">Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong className="text-zinc-300">Erasure:</strong> Request deletion of your personal data</li>
              <li><strong className="text-zinc-300">Restriction:</strong> Request restriction of processing</li>
              <li><strong className="text-zinc-300">Portability:</strong> Request transfer of your data in a machine-readable format</li>
              <li><strong className="text-zinc-300">Objection:</strong> Object to processing of your personal data</li>
              <li><strong className="text-zinc-300">Withdraw consent:</strong> Withdraw consent at any time where processing is based on consent</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:support@pdfdocsign.com" className="text-violet-400 hover:text-violet-300 underline">
                support@pdfdocsign.com
              </a>.
              We will respond to your request within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. When we transfer data internationally, we ensure appropriate safeguards are in place, including standard contractual clauses approved by relevant authorities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for children under the age of 16. We do not knowingly collect personal data from children under 16. If you become aware that a child has provided us with personal data, please contact us at{' '}
              <a href="mailto:support@pdfdocsign.com" className="text-violet-400 hover:text-violet-300 underline">
                support@pdfdocsign.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="mt-3">
              <a href="mailto:support@pdfdocsign.com" className="text-violet-400 hover:text-violet-300 underline">
                support@pdfdocsign.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - PDFDocSign',
  description: 'PDFDocSign Terms of Service. Read the terms and conditions for using our PDF document signing service.',
};

export default function TermsPage() {
  return (
    <div className="bg-[#0a0a0a] py-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-zinc-500 mb-12">Last updated: March 13, 2026</p>

        <div className="space-y-10 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using PDFDocSign (&quot;the Service&quot;), operated by PDFDocSign (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Service.
            </p>
            <p className="mt-3">
              We reserve the right to modify these Terms at any time. We will provide notice of material changes by updating the &quot;Last updated&quot; date. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p>
              PDFDocSign is a web-based platform that allows users to fill, sign, and manage PDF documents. The Service includes features such as:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Uploading and viewing PDF documents</li>
              <li>Adding electronic signatures to documents</li>
              <li>Filling out PDF form fields</li>
              <li>Adding annotations and text to PDFs</li>
              <li>Downloading signed and completed documents</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Account Registration</h2>
            <p>
              To access certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activity that occurs under your account</li>
            </ul>
            <p className="mt-3">
              You must be at least 16 years old to create an account and use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Subscription Plans and Billing</h2>

            <h3 className="text-lg font-medium text-zinc-300 mb-2">4.1 Free Trial</h3>
            <p>
              We may offer a free trial period. At the end of the trial, your account will be converted to a paid subscription unless you cancel before the trial ends.
            </p>

            <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">4.2 Paid Subscriptions</h3>
            <p>
              Paid subscriptions are billed in advance on a recurring basis (monthly or annually, depending on the plan you select). Payment is processed through Stripe, and you agree to Stripe&apos;s{' '}
              <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">
                Terms of Service
              </a>.
            </p>

            <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">4.3 Cancellation</h3>
            <p>
              You may cancel your subscription at any time. Upon cancellation, you will continue to have access to the Service until the end of your current billing period. No refunds are provided for partial billing periods.
            </p>

            <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">4.4 Price Changes</h3>
            <p>
              We reserve the right to change our subscription prices. Any price changes will take effect at the start of your next billing cycle, and we will provide you with reasonable advance notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Upload or transmit any content that is illegal, harmful, or violates third-party rights</li>
              <li>Forge documents or signatures, or engage in any form of fraud</li>
              <li>Attempt to gain unauthorized access to the Service or its systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated means to access the Service without our written permission</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Use the Service to send spam or unsolicited communications</li>
              <li>Upload content containing malware, viruses, or harmful code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Electronic Signatures</h2>
            <p>
              PDFDocSign facilitates the creation and placement of electronic signatures on PDF documents. You acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Electronic signatures created through the Service are intended to be legally binding, subject to applicable law</li>
              <li>You are responsible for ensuring that your use of electronic signatures complies with applicable laws and regulations in your jurisdiction</li>
              <li>PDFDocSign does not provide legal advice regarding the enforceability of electronic signatures</li>
              <li>Some documents may require wet-ink signatures or notarization by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Intellectual Property</h2>

            <h3 className="text-lg font-medium text-zinc-300 mb-2">7.1 Our Property</h3>
            <p>
              The Service, including its design, features, code, and content (excluding user-uploaded documents), is owned by PDFDocSign and protected by intellectual property laws. You may not copy, modify, or distribute any part of the Service without our prior written consent.
            </p>

            <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">7.2 Your Content</h3>
            <p>
              You retain all rights to the documents and content you upload to the Service. By uploading content, you grant us a limited, non-exclusive license to process, store, and display your content solely for the purpose of providing the Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Privacy</h2>
            <p>
              Your use of the Service is also governed by our{' '}
              <a href="/privacy" className="text-violet-400 hover:text-violet-300 underline">
                Privacy Policy
              </a>
              , which describes how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="mt-3">
              We do not warrant that the Service will be uninterrupted, error-free, or secure, or that any defects will be corrected. We do not guarantee the accuracy, completeness, or usefulness of any information provided through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PDFDOCSIGN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Your use of or inability to use the Service</li>
              <li>Any unauthorized access to or alteration of your documents or data</li>
              <li>Any third-party conduct on the Service</li>
              <li>Any other matter relating to the Service</li>
            </ul>
            <p className="mt-3">
              Our total liability for any claims arising from or related to the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless PDFDocSign, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including reasonable attorney&apos;s fees) arising out of or related to your use of the Service, your violation of these Terms, or your violation of any rights of a third party.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">12. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any time, with or without cause, and with or without notice. Upon termination, your right to use the Service will immediately cease.
            </p>
            <p className="mt-3">
              You may terminate your account at any time by contacting us or using the account deletion feature in your settings. Upon termination, we will delete your data in accordance with our{' '}
              <a href="/privacy" className="text-violet-400 hover:text-violet-300 underline">
                Privacy Policy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be resolved in the courts of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">14. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that the remaining Terms remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">15. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
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

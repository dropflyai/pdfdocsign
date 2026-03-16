import Link from 'next/link';

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-32 bg-[#0a0a0a] border-t border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-violet-400 font-medium mb-4">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6">
            Start free.
            <br />
            <span className="text-zinc-500">Upgrade when ready.</span>
          </h2>
        </div>

        {/* Plans */}
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Free tier - Compact */}
          <div className="lg:col-span-2 p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-baseline justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Free</h3>
              <span className="text-3xl font-bold text-white">$0</span>
            </div>

            <p className="text-zinc-400 mb-6">
              Perfect for occasional document signing
            </p>

            <ul className="space-y-3 mb-8">
              {[
                '3 documents per month',
                'Fill form fields',
                'Draw signatures',
                'Instant download',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-zinc-400">
                  <svg className="w-4 h-4 text-zinc-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="block w-full py-3 text-center text-sm font-medium text-zinc-300 border border-zinc-700 rounded-full hover:bg-zinc-800 transition-colors"
            >
              Get started
            </Link>
          </div>

          {/* Pro tier - Featured */}
          <div className="lg:col-span-3 relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl blur-lg opacity-25" />

            <div className="relative p-8 lg:p-10 rounded-2xl bg-zinc-900 border border-violet-500/30">
              {/* Badge */}
              <div className="absolute -top-3 left-8 px-4 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full text-xs font-semibold text-white">
                Recommended
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Pro</h3>
                  <p className="text-zinc-400">Everything you need</p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">$9.99</span>
                    <span className="text-zinc-500">/mo</span>
                  </div>
                  <p className="text-sm text-violet-400">7-day free trial</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-8">
                {[
                  'Unlimited documents',
                  'Send for signature',
                  'Cloud storage',
                  'Form field auto-detection',
                  'Custom download filenames',
                  'Remove watermarks',
                  'Email support',
                  'Audit trail on signed documents',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-zinc-300">
                    <svg className="w-5 h-5 text-violet-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                className="group block w-full py-4 text-center font-semibold text-black bg-white rounded-full hover:bg-zinc-100 transition-all"
              >
                Start free trial
                <svg className="inline-block w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <p className="mt-4 text-center text-sm text-zinc-500">
                No credit card required to start
              </p>
            </div>
          </div>
        </div>

        {/* FAQ / Trust */}
        <div className="mt-20 pt-16 border-t border-zinc-800">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-medium mb-2">Can I cancel anytime?</h4>
              <p className="text-sm text-zinc-500">Yes. Cancel with one click from your settings. No questions asked.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Is my data secure?</h4>
              <p className="text-sm text-zinc-500">Your documents are processed locally in your browser. We never see your files.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Are e-signatures legal?</h4>
              <p className="text-sm text-zinc-500">Yes. Electronic signatures are legally binding under ESIGN and UETA laws.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

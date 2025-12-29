import Link from 'next/link';

export default function CTA() {
  return (
    <section className="relative py-32 overflow-hidden border-t border-zinc-800/50">
      {/* Gradient background - visual break from dark sections */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-[#12101a] to-[#0a0a0a]" />
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6">
          Ready to sign?
        </h2>
        <p className="text-xl text-zinc-400 max-w-xl mx-auto mb-10">
          Start signing documents in seconds. No credit card required.
        </p>

        <Link
          href="/signup"
          className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-black bg-white rounded-full hover:bg-zinc-100 transition-all"
        >
          Start signing free
          <svg
            className="w-5 h-5 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>

        <p className="mt-6 text-sm text-zinc-500">
          7-day free trial on Pro features
        </p>
      </div>
    </section>
  );
}

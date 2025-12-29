'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden">
      {/* Gradient orbs */}
      <div
        className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/30 rounded-full blur-[128px] transition-transform duration-1000 ease-out"
        style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
      />
      <div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] transition-transform duration-1000 ease-out"
        style={{ transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)` }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-3 text-sm">
              <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 font-medium border border-violet-500/20">
                New
              </span>
              <span className="text-zinc-500">
                Browser-based. No install required.
              </span>
            </div>

            {/* Headline - Bold typography */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-white">Sign PDFs</span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                in seconds.
              </span>
            </h1>

            {/* Subhead - Direct, calm */}
            <p className="text-xl text-zinc-400 max-w-lg leading-relaxed">
              Fill forms. Add signatures. Download instantly.
              <br />
              Your documents never leave your browser.
            </p>

            {/* Single primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10">Start signing free</span>
                <svg
                  className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <span className="text-sm text-zinc-500 self-center">
                No credit card required
              </span>
            </div>

            {/* Social proof - understated */}
            <div className="flex items-center gap-6 pt-8 border-t border-zinc-800">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border-2 border-[#0a0a0a] flex items-center justify-center text-xs text-zinc-400"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm text-zinc-500">
                <span className="text-zinc-300 font-medium">2,847</span> documents signed this week
              </div>
            </div>
          </div>

          {/* Right: Interactive demo */}
          <div className="relative lg:pl-8">
            <div
              className="relative bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl transition-transform duration-500 ease-out"
              style={{ transform: `perspective(1000px) rotateY(${mousePosition.x * 0.1}deg) rotateX(${mousePosition.y * -0.1}deg)` }}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-zinc-800 rounded-lg px-4 py-1.5 text-sm text-zinc-500 text-center">
                    pdfdocsign.com/editor
                  </div>
                </div>
              </div>

              {/* PDF preview */}
              <div className="p-6 bg-zinc-950">
                <div className="bg-white rounded-lg p-8 shadow-lg">
                  {/* Document content */}
                  <div className="space-y-4">
                    <div className="h-3 bg-zinc-200 rounded w-2/3" />
                    <div className="h-3 bg-zinc-200 rounded w-1/2" />
                    <div className="h-3 bg-zinc-200 rounded w-3/4" />

                    <div className="my-6 py-4">
                      <div className="text-xs text-zinc-400 mb-2 font-medium uppercase tracking-wide">Signature</div>
                      <div className="border-2 border-dashed border-violet-300 bg-violet-50 rounded-lg p-6 text-center group cursor-pointer hover:bg-violet-100 transition-colors">
                        <svg className="w-8 h-8 mx-auto text-violet-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span className="text-violet-600 font-medium text-sm">Click to sign</span>
                      </div>
                    </div>

                    <div className="h-3 bg-zinc-200 rounded w-1/3" />
                    <div className="h-3 bg-zinc-200 rounded w-2/3" />
                  </div>
                </div>

                {/* Floating toolbar hint */}
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                  {['T', 'S', '✓', '📅'].map((icon, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center text-sm text-zinc-400 shadow-lg hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -bottom-4 -left-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium backdrop-blur-sm">
              100% Private
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

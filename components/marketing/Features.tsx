'use client';

import { useRef } from 'react';

const steps = [
  {
    number: '01',
    title: 'Drop your PDF',
    description: 'Drag any PDF into the browser. No upload to servers. Your file stays on your device.',
    visual: (
      <div className="relative w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
        <div className="absolute inset-4 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span className="text-zinc-500 text-sm">Drop PDF here</span>
          </div>
        </div>
        <div className="absolute top-4 right-4 w-12 h-16 bg-white rounded shadow-lg transform rotate-6 flex items-center justify-center">
          <span className="text-red-500 text-xs font-bold">PDF</span>
        </div>
      </div>
    ),
  },
  {
    number: '02',
    title: 'Fill and sign',
    description: 'Click any field to type. Draw your signature or type it. Everything auto-saves.',
    visual: (
      <div className="relative w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 p-4">
        <div className="bg-white rounded-lg h-full p-4 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 w-16">Name:</span>
              <div className="flex-1 border-b-2 border-violet-400 pb-1">
                <span className="text-sm text-zinc-800">John Smith</span>
                <span className="animate-pulse text-violet-500">|</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 w-16">Date:</span>
              <div className="flex-1 border-b border-zinc-200 pb-1">
                <span className="text-sm text-zinc-800">Dec 26, 2025</span>
              </div>
            </div>
            <div className="mt-4 pt-2">
              <span className="text-xs text-zinc-400">Signature:</span>
              <div className="mt-2 h-12 border border-violet-200 bg-violet-50 rounded flex items-center justify-center">
                <span className="font-signature text-2xl text-violet-600 italic">John Smith</span>
              </div>
            </div>
          </div>
        </div>
        {/* Floating cursor */}
        <div className="absolute top-1/2 left-1/2 w-4 h-4">
          <svg className="w-4 h-4 text-zinc-800 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 4l16 8-7 2-2 7z" />
          </svg>
        </div>
      </div>
    ),
  },
  {
    number: '03',
    title: 'Download or send',
    description: 'Get your signed PDF instantly. Or email it for others to sign.',
    visual: (
      <div className="relative w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 p-4">
        <div className="flex gap-4 h-full">
          <button className="flex-1 bg-white rounded-lg flex flex-col items-center justify-center gap-3 hover:bg-zinc-50 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-zinc-800">Download</span>
          </button>
          <button className="flex-1 bg-violet-600 rounded-lg flex flex-col items-center justify-center gap-3 hover:bg-violet-700 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white">Send to sign</span>
          </button>
        </div>
      </div>
    ),
  },
];

const highlights = [
  { label: 'Private', desc: 'Files never leave your device' },
  { label: 'Fast', desc: 'No uploads, instant processing' },
  { label: 'Legal', desc: 'eSignatures legally binding' },
  { label: 'Mobile', desc: 'Works on any device' },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="features" ref={sectionRef} className="relative py-32 bg-[#0f0f0f] border-t border-zinc-800/50">
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-24">
        <div className="max-w-2xl">
          <p className="text-violet-400 font-medium mb-4">How it works</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6">
            Three steps.
            <br />
            <span className="text-zinc-500">That&apos;s it.</span>
          </h2>
          <p className="text-xl text-zinc-400">
            No accounts required for basic use. No watermarks. No limitations on your first 3 documents.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="space-y-32">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`grid lg:grid-cols-2 gap-12 lg:gap-24 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-dense' : ''
              }`}
            >
              {/* Content */}
              <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                <div className="space-y-6">
                  <span className="text-6xl font-bold text-zinc-800">{step.number}</span>
                  <h3 className="text-3xl font-bold text-white">{step.title}</h3>
                  <p className="text-lg text-zinc-400 leading-relaxed">{step.description}</p>
                </div>
              </div>

              {/* Visual */}
              <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                {step.visual}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights strip */}
      <div className="mt-32 relative border-y border-zinc-800 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-64 h-64 bg-violet-600/20 rounded-full blur-[80px]" />
        <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-64 h-64 bg-fuchsia-600/15 rounded-full blur-[80px]" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-96 h-32 bg-indigo-600/10 rounded-full blur-[60px]" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {highlights.map((item) => (
              <div key={item.label} className="text-center md:text-left">
                <div className="text-white font-semibold mb-1">{item.label}</div>
                <div className="text-sm text-zinc-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

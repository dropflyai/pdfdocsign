import Hero from '@/components/marketing/Hero';
import Features from '@/components/marketing/Features';
import Pricing from '@/components/marketing/Pricing';
import CTA from '@/components/marketing/CTA';

export const metadata = {
  title: 'PDF Doc Sign - Fill & Sign PDFs in Seconds',
  description: 'The fastest way to fill and sign PDF documents. Privacy-first, works on any device. Start your free trial today.',
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <Pricing />
      <CTA />
    </>
  );
}

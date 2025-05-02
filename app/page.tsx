import { Metadata } from 'next';
import Navbar from '@/app/components/landing/Navbar';
import Hero from '@/app/sections/Hero';
import Features from '@/app/sections/Features';
import Testimonials from '@/app/sections/Testimonials';
import CTA from '@/app/sections/CTA';
import Footer from '@/app/sections/Footer';

export const metadata: Metadata = {
  title: 'Obscurium Logistics | Innovative Supply Chain Solutions',
  description: 'Obscurium Logistics offers cutting-edge logistics and supply chain solutions for businesses of all sizes. Contact us today for a consultation.',
  keywords: 'logistics, supply chain, shipping, freight, transportation, warehousing',
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Navbar */}
      <Navbar/>
      {/* Hero Section */}
      <Hero />
      {/* Features Section */}
      <Features />
      {/* Testimonials Section */}
      <Testimonials />
      {/* CTA Section with Seamless Background */}
      <CTA />
      {/* Footer */}
      <Footer />
    </div>
  );
}
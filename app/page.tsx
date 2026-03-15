"use client";

import { DemoModalProvider } from "@/components/landing/DemoModalContext";
import { BookDemoModal } from "@/components/landing/BookDemoModal";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Stats } from "@/components/landing/Stats";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <DemoModalProvider>
      <Navbar />
      <Hero />
      <Features />
      <BentoGrid />
      <LiveDemo />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <CTA />
      <Footer />
      <BookDemoModal />
    </DemoModalProvider>
  );
}

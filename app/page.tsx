import type { Metadata } from "next";
import { DemoModalProvider } from "@/components/landing/DemoModalContext";
import { BookDemoModal } from "@/components/landing/BookDemoModal";
import { ScrollProgress } from "@/components/landing/ScrollProgress";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { PlatformJourney } from "@/components/landing/PlatformJourney";
import { FeatureDeepDives } from "@/components/landing/FeatureDeepDives";
import { WhyClinaxy } from "@/components/landing/WhyClinaxy";
import { Security } from "@/components/landing/Security";
import { DecisionQuiz } from "@/components/landing/DecisionQuiz";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Clinaxy - AI workflow platform for clinics",
  description:
    "Clinaxy brings referral sorting, patient intake, clinical notes, and follow-up into one AI workflow platform for GPs, specialists, surgeons, and modern clinics.",
};

export default function Home() {
  return (
    <DemoModalProvider>
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <PlatformJourney />
        <FeatureDeepDives />
        <WhyClinaxy />
        <Security />
        <DecisionQuiz />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <BookDemoModal />
    </DemoModalProvider>
  );
}

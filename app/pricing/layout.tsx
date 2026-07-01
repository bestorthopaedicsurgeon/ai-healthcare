import type { Metadata } from "next";
import { faqs } from "./faqs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clinaxy.ai";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Clinaxy pricing for Australian clinics: plans for solo GPs, growing practices, and multi-site clinics. AI referral triage, voice intake, ambient scribe, and follow-up, with your patients' data hosted in Australia.",
  alternates: { canonical: `${SITE_URL}/pricing` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/pricing`,
    title: "Pricing · Clinaxy",
    description:
      "Plans for solo GPs, growing practices, and clinics. AI referral triage, voice intake, ambient scribe, and follow-up.",
  },
};

// FAQPage — feeds Google's FAQ rich results and answer engines. Generated from
// the same `faqs` the page renders, so the schema always matches the content.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Pricing", item: `${SITE_URL}/pricing` },
  ],
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}

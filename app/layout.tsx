import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Instrument_Serif, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Toaster } from "react-hot-toast";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
});

const SITE_URL = "https://clinaxy.ai";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Clinaxy · AI workflow platform for Australian clinics",
    template: "%s | Clinaxy",
  },
  description:
    "Clinaxy brings referral triage, voice intake, ambient clinical notes, and follow-up into one AI workflow platform for Australian GPs, specialists, and clinics.",
  keywords: [
    "AI medical scribe",
    "ambient clinical documentation",
    "AI referral triage",
    "voice patient intake",
    "AI for GP clinics",
    "healthcare workflow automation",
    "AI for specialist clinics",
    "clinic workflow platform",
  ],
  authors: [{ name: "Clinaxy" }],
  creator: "Clinaxy",
  applicationName: "Clinaxy",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Clinaxy",
    locale: "en_AU",
    title: "Clinaxy · AI workflow platform for Australian clinics",
    description:
      "One connected system for referrals, intake, clinical notes, and follow-up, built for Australian clinics.",
    images: [
      {
        url: "/clinaxy-logo-primary.png",
        width: 1200,
        height: 630,
        alt: "Clinaxy · AI workflow platform for Australian clinics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinaxy · AI workflow platform for Australian clinics",
    description:
      "One connected system for referrals, intake, clinical notes, and follow-up, built for Australian clinics.",
    images: ["/clinaxy-logo-primary.png"],
  },
  robots: { index: true, follow: true },
  category: "healthcare technology",
};

export const viewport: Viewport = {
  themeColor: "#0a6256",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

// Site-wide structured data (Organization + WebSite + SoftwareApplication) as a
// single @graph, read by Google, answer engines, and generative engines alike.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Clinaxy",
      url: SITE_URL,
      logo: `${SITE_URL}/clinaxy-symbol.png`,
      description:
        "Clinaxy is an AI workflow platform for Australian clinics: referral triage, voice intake, an ambient clinical scribe, and follow-up.",
      areaServed: { "@type": "Country", name: "Australia" },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "hello@clinaxy.ai", // TODO (this week): replace with the real contact email
        areaServed: "AU",
        availableLanguage: "en",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Clinaxy",
      inLanguage: "en-AU",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "Clinaxy",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description:
        "AI workflow platform for referral triage, voice intake, ambient clinical documentation, and follow-up, built for Australian clinics.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      audience: {
        "@type": "Audience",
        audienceType:
          "GPs, specialists, surgeons, clinic teams, and practice managers",
      },
      featureList: [
        "AI referral triage",
        "Voice patient intake",
        "Ambient clinical scribe",
        "Automated follow-up and specialist letters",
        "Australian data residency",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-AU"
      className={`${hanken.variable} ${instrumentSerif.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ClientLayout>{children}</ClientLayout>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

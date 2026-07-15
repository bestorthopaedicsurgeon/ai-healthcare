import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clinaxy.ai";

// Generated at build time → regenerated on every production deploy.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep the app + auth surfaces out of search results.
      disallow: [
        "/dashboard",
        "/scribe",
        "/triage",
        "/voice-agent",
        "/chat",
        "/patients",
        "/summary",
        "/settings",
        "/login",
        "/signup",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

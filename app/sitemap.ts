import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clinaxy.ai";

// Generated at build time, so `lastModified` reflects the build date — every
// push to production automatically ships a fresh, dated sitemap.
// Only the public, indexable pages belong here (home + pricing).
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Use the OS certificate store when fetching Google Fonts at build time.
    // Needed on networks that intercept TLS (corporate proxy / AV).
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;

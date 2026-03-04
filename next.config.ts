import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "shootingsupplies.lon1.digitaloceanspaces.com" },
      { protocol: "https", hostname: "shootingsupplies.lon1.cdn.digitaloceanspaces.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/shop/:category/:slug", destination: "/product/:slug", permanent: true },
      { source: "/shop/:slug", destination: "/category/:slug", permanent: true },
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/terms", destination: "/terms-and-conditions", permanent: true },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Point at your GlitchTip instance for source map uploads
  sentryUrl: process.env.SENTRY_URL,
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
});

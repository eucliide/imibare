import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        // Cloudflare R2 public r2.dev subdomain
        // Replace <your-hash> with your actual pub-xxxx subdomain
        protocol: "https",
        hostname: "**.r2.dev",
      },
      // To add a custom R2 domain, append another entry here:
      // { protocol: "https", hostname: "charts.yourdomain.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

// Sentry configuration
const sentryConfig = {
  // Suppresses source map uploading logs during build
  silent: true,

  // Automatically tree-shake Sentry logger statements from production
  disableLogger: true,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replays
  reactComponentAnnotation: {
    enabled: true,
  },
};

// Only wrap with Sentry if DSN is present
export default process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryConfig)
  : nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Multi-zone routing: forward /trading and /budget to their apps
  async rewrites() {
    return [
      {
        source: "/trading",
        destination: "http://localhost:3001",
      },
      {
        source: "/trading/:path*",
        destination: "http://localhost:3001/:path*",
      },
      {
        source: "/budget",
        destination: "http://localhost:3002",
      },
      {
        source: "/budget/:path*",
        destination: "http://localhost:3002/:path*",
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

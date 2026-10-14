import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  basePath: "/trading",
  assetPrefix: "/trading",
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

export default nextConfig;

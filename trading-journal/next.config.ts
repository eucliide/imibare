import type { NextConfig } from "next";

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
};

export default nextConfig;

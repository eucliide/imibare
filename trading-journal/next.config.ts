import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Empty turbopack config to silence the warning
  // Turbopack should work fine with default settings
  turbopack: {},
};

export default nextConfig;

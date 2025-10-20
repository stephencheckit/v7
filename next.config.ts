import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix for multiple lockfiles warning
  outputFileTracingRoot: path.join(__dirname),
  
  // Optimize for production
  reactStrictMode: true,
  
  // Disable ESLint during builds (since it's causing module issues)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during builds (will catch them in dev)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

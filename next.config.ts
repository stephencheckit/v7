import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix for multiple lockfiles warning
  outputFileTracingRoot: path.join(__dirname),
  
  // Optimize for production
  reactStrictMode: true,
  
  // Disable instrumentation hook for now (Sentry causing stalling issues)
  // experimental: {
  //   instrumentationHook: true,
  // },
  
  // Disable ESLint during builds (since it's causing module issues)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Ignore TypeScript errors during CI builds (catch them in dev/pre-commit)
  typescript: {
    ignoreBuildErrors: process.env.CI === 'true',
  },
};

// Sentry disabled temporarily due to stalling issues
// Uncomment below when ready to re-enable
// if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
//   const { withSentryConfig } = require("@sentry/nextjs");
//   const sentryWebpackPluginOptions = {
//     silent: true,
//     org: process.env.SENTRY_ORG,
//     project: process.env.SENTRY_PROJECT,
//   };
//   exportConfig = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
// }

export default nextConfig;

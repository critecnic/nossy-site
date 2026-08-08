import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone", // disabled for proper API route + middleware support
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: false,
};

export default nextConfig;

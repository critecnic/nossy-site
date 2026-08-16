import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // --- Existing settings ---
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: false,

  // --- Security: remove X-Powered-By header ---
  poweredByHeaders: false,

  // --- Allowed dev origins for localhost development ---
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],

  // --- Remote image patterns ---
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nossy.pro",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.nossy.pro",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // --- Comprehensive security headers ---
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self'",
              "connect-src 'self'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: false,
  images: { formats: ['image/avif', 'image/webp'] as const },
  allowedDevOrigins: [
    "preview-chat-68e63cc5-30ee-4756-bc8d-f77f889b00b7.space-z.ai",
  ],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // HSTS for production
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // CDN-friendly caching headers for static assets
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ];
  },
};

export default nextConfig;
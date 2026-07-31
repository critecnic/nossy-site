import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: false,
  images: {
    formats: ['image/avif', 'image/webp'] as const,
  },
  allowedDevOrigins: [
    "preview-chat-68e63cc5-30ee-4756-bc8d-f77f889b00b7.space-z.ai",
  ],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;

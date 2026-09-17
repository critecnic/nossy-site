import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // Premium 0220 — os dados reais vivem em data/site/ (privado). Estas
  // rotas leem os arquivos em runtime, então o deploy precisa EMPACOTÁ-LOS
  // (serverless): sem isso a Vercel não incluiria a pasta e as APIs
  // devolveriam 404 em produção.
  outputFileTracingIncludes: {
    "/api/data/**": ["./data/site/**"],
    "/api/admin/**": ["./data/site/**"],
    "/[lang]/[slug]/[region]/[country]/[id]": ["./data/site/**"],
    "/[lang]/[slug]/[region]/[country]/sectors/[sectorSlug]": ["./data/site/**"],
  },
  async rewrites() {
    return {
      // beforeFiles roda ANTES do sistema de arquivos: qualquer request a
      // /data/* (JSON bruto legado) é bloqueado e recebe 404 de
      // /api/data-blocked. Cinto E suspensório contra vazamento estático.
      beforeFiles: [
        { source: "/data/:path*", destination: "/api/data-blocked" },
      ],
      afterFiles: [
      // Premium 0220 — alias gerido via API para o webhook da Paddle.
      // A Paddle recusa criar um segundo webhook com o MESMO destino
      // (notification_setting_cannot_be_duplicate), e o webhook criado
      // manualmente no dashboard não permite recuperar o secret via API
      // (GET /notification-settings -> 403 com a chave atual). Este alias
      // dá um destino distinto (https://nossy.pro/api/webhook-0220) para o
      // webhook criado 100% via API, cujo secret é capturado automaticamente
      // e sincronizado à Vercel pelo workflow sync-vercel-env.yml. O rewrite
      // preserva body e headers, então a validação HMAC é idêntica.
      { source: "/api/webhook-0220", destination: "/api/webhook" },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            // Premium 0220 — CSP inclui os domínios do Paddle.js: sem eles o
            // navegador baixa cdn.paddle.com mas RECUSA executar o script
            // (script-src), e bloquearia o iframe do checkout (frame-src).
            // Era a causa do bug "clica Pay e a página volta ao início".
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://cdn.paddle.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.paddle.com https://vitals.vercel-insights.com https://va.vercel-scripts.com; frame-src https://*.paddle.com; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
          },
        ],
      },
      {
        source: "/og/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/brand/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/logo.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400" },
        ],
      },
      // Sitemaps estáticos gerados no build (index + sitemap-{pais}.xml):
      // servidos pela CDN com cache longo — revalidação diária.
      {
        source: "/sitemap-:file(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;

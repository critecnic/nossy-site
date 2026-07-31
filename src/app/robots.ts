import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/en/', '/pt-br/', '/es/', '/ar/', '/hi/', '/bn/', '/ur/', '/tl/', '/sw/',
          '/fr/', '/pt-pt/', '/zh/', '/ja/', '/de/',
        ],
        disallow: ['/admin/', '/api/', '/_next/', '/sitemap'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/en/', '/pt-br/', '/es/', '/ar/', '/hi/', '/bn/', '/ur/', '/tl/', '/sw/'],
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: 'https://ww.jobs/sitemap-index.xml',
  };
}
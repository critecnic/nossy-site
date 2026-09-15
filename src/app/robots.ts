import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/data/', '/admin', '/api/admin', '/api/agent'],
      },
    ],
    sitemap: 'https://nossy.pro/sitemap.xml',
  };
}

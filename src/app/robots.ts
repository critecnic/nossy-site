import { MetadataRoute } from 'next';
import { COUNTRIES } from '@/lib/countries';

export default function robots(): MetadataRoute.Robots {
  const countryPaths = COUNTRIES.map(c => `/${c.code}`).join('\nAllow: ');

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: ['/', ...COUNTRIES.map(c => `/${c.code}`), '/api/jobs'],
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: ['/', ...COUNTRIES.map(c => `/${c.code}`)],
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: 'Slurp',
        allow: '/',
      },
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
      },
      {
        userAgent: 'Baiduspider',
        allow: '/',
      },
      {
        userAgent: 'YandexBot',
        allow: '/',
      },
      {
        userAgent: 'Twitterbot',
        allow: ['/', ...COUNTRIES.map(c => `/${c.code}`)],
      },
      {
        userAgent: 'facebookexternalhit',
        allow: ['/', ...COUNTRIES.map(c => `/${c.code}`)],
      },
      {
        userAgent: 'LinkedInBot',
        allow: ['/', ...COUNTRIES.map(c => `/${c.code}`)],
      },
      {
        userAgent: '*',
        allow: ['/', ...COUNTRIES.map(c => `/${c.code}`)],
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: 'https://ww.jobs/sitemap.xml',
  };
}
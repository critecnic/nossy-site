import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/data/',
        ],
      },
      // Block region, country, and job detail pages from crawling
      // These are accessed via client-side navigation from the homepage
      {
        userAgent: 'Googlebot',
        disallow: [
          '/*/jobs/*/europa/',
          '/*/jobs/*/asia/',
          '/*/jobs/*/eua/',
          '/*/vagas/*/europa/',
          '/*/vagas/*/asia/',
          '/*/vagas/*/eua/',
          '/*/empregos/*/europa/',
          '/*/empregos/*/asia/',
          '/*/empregos/*/eua/',
          '/*/empleos/*/europa/',
          '/*/empleos/*/asia/',
          '/*/empleos/*/eua/',
        ],
      },
    ],
    sitemap: 'https://nossy.pro/sitemap.xml',
  };
}

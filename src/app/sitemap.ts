import { MetadataRoute } from 'next';
import { COUNTRIES, TOTAL_JOBS } from '@/lib/countries';

const BASE_URL = 'https://ww.jobs';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Homepage - highest priority, updated daily
  const homePage: MetadataRoute.Sitemap[0] = {
    url: BASE_URL,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 1.0,
  };

  // Country pages - all equal priority, no favoritism
  const countryPages: MetadataRoute.Sitemap = COUNTRIES.map((country) => ({
    url: `${BASE_URL}/${country.code}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Sector-country combo pages for long-tail SEO
  const sectors = ['Technology', 'Finance', 'Design', 'Marketing', 'Data Science', 'Sales', 'Management', 'Healthcare', 'Engineering'];
  const sectorPages: MetadataRoute.Sitemap = COUNTRIES.flatMap((country) =>
    sectors.map((sector) => ({
      url: `${BASE_URL}/${country.code}?sector=${encodeURIComponent(sector)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  return [homePage, ...countryPages, ...sectorPages];
}

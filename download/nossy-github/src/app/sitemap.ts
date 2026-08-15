import { MetadataRoute } from 'next';
import { LANGUAGES, LANG_SLUGS } from '@/lib/i18n';
import countriesData from '@/data/countries.json';

const BASE = 'https://nossy.pro';

interface CountryInfo { name: string; slug: string; region: string; count: number; }

export default function sitemap(): MetadataRoute.Sitemap {
  const items: MetadataRoute.Sitemap = [];
  const countries = countriesData as CountryInfo[];

  for (const lang of LANGUAGES) {
    const slug = LANG_SLUGS[lang.code];
    const path = `/${lang.code}/${slug}`;

    // Main jobs page
    items.push({ url: `${BASE}${path}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 });

    // Region pages
    const regions = [...new Set(countries.map(c => c.region))];
    for (const region of regions) {
      items.push({ url: `${BASE}${path}/${region}`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 });

      // Country pages within each region
      const regionCountries = countries.filter(c => c.region === region);
      for (const country of regionCountries) {
        items.push({ url: `${BASE}${path}/${region}/${country.slug}`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 });
      }
    }
  }

  return items;
}

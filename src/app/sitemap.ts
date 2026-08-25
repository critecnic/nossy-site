import { MetadataRoute } from 'next';
import { LANGUAGES, LANG_SLUGS } from '@/lib/i18n';
import { REGIONS } from '@/lib/countries';
import countriesData from '@/data/countries.json';

const BASE = 'https://nossy.pro';
const GUIDE_SLUGS = ['how-to-find-tech-jobs-in-europe', 'remote-work-salary-guide-2025', 'top-tech-skills-demand'];

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];
  const now = new Date().toISOString();
  const countries = countriesData as Array<{ slug: string; region: string; count: number }>;

  // 1. Main entry (root redirect)
  urls.push({
    url: BASE,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 1.0,
  });

  // 2. Homepages — one per language (22 URLs)
  for (const lang of LANGUAGES) {
    const slug = LANG_SLUGS[lang.code];
    urls.push({
      url: `${BASE}/${lang.code}/${slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    });
  }

  // 3. Region pages — per language per region (22 × 3 = 66 URLs)
  for (const lang of LANGUAGES) {
    const slug = LANG_SLUGS[lang.code];
    for (const region of REGIONS) {
      urls.push({
        url: `${BASE}/${lang.code}/${slug}/${region.code}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }
  }

  // 4. Country pages — per language per country (22 × 58 = ~1,276 URLs)
  for (const lang of LANGUAGES) {
    const slug = LANG_SLUGS[lang.code];
    for (const country of countries) {
      urls.push({
        url: `${BASE}/${lang.code}/${slug}/${country.region}/${country.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  // 5. Guide/blog pages — one per language per guide (22 × 3 = 66 URLs)
  for (const lang of LANGUAGES) {
    const slug = LANG_SLUGS[lang.code];
    for (const guide of GUIDE_SLUGS) {
      urls.push({
        url: `${BASE}/${lang.code}/${slug}/guides/${guide}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  return urls;
}

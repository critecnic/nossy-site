import { MetadataRoute } from 'next';
import { LANGUAGES, LANG_SLUGS } from '@/lib/i18n';

const BASE = 'https://nossy.pro';

// Blog/guide slugs available in all languages
const GUIDE_SLUGS = ['how-to-find-tech-jobs-in-europe', 'remote-work-salary-guide-2025', 'top-tech-skills-demand'];

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];
  const now = new Date().toISOString();

  // 1. Homepages - one per language (22 URLs)
  for (const lang of LANGUAGES) {
    const slug = LANG_SLUGS[lang.code];
    urls.push({
      url: `${BASE}/${lang.code}/${slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    });
  }

  // 2. Guide/blog pages - one per language per guide
  for (const lang of LANGUAGES) {
    const slug = LANG_SLUGS[lang.code];
    for (const guide of GUIDE_SLUGS) {
      urls.push({
        url: `${BASE}/${lang.code}/${slug}/guides/${guide}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return urls;
}

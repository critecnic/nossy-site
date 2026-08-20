import type { MetadataRoute } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import countriesData from "@/data/countries.json";

interface CountryInfo { slug: string; region: string; count: number; name: string; }

export default function sitemap(): MetadataRoute.Sitemap {
  const countries = countriesData as CountryInfo[];
  const entries: MetadataRoute.Sitemap = [];
  const baseUrl = "https://nossy.pro";

  for (const lang of LANGUAGES) {
    const slug = LANG_SLUGS[lang.code];
    // Homepage
    entries.push({ url: baseUrl + "/" + lang.code + "/" + slug, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 });
    // Region pages
    for (const region of ["europa", "asia", "eua"]) {
      entries.push({ url: baseUrl + "/" + lang.code + "/" + slug + "/" + region, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 });
    }
    // Country pages
    for (const c of countries) {
      entries.push({ url: baseUrl + "/" + lang.code + "/" + slug + "/" + c.region + "/" + c.slug, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 });
    }
  }
  return entries;
}

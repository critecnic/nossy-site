import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { COUNTRIES } from "@/lib/countries";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = "https://ww.jobs";
  const sitemaps: string[] = [];
  const prioLangs = ["en", "pt-br", "es", "ar", "hi", "sw", "fr"];

  for (const lang of LANGUAGES) {
    const slug = LANG_SLUGS[lang.code];
    sitemaps.push(`${baseUrl}/sitemap-${lang.code}.xml`);
    if (prioLangs.includes(lang.code)) {
      for (const country of COUNTRIES) {
        sitemaps.push(`${baseUrl}/sitemap-${lang.code}-${country.code}.xml`);
      }
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(s => `  <sitemap><loc>${s}</loc></sitemap>`).join("\n")}
</sitemapindex>`;

  return new NextResponse(xml, { headers: { "Content-Type": "application/xml" } });
}
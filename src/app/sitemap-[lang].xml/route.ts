import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { REGIONS } from "@/lib/countries";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<Record<string, string>> };

export async function GET(_req: Request, ctx: Ctx) {
  const params = await ctx.params;
  const langCode = params.lang;
  const lang = LANGUAGES.find(l => l.code === langCode);
  if (!lang) return NextResponse.json({ error: "Unknown lang" }, { status: 404 });

  const slug = LANG_SLUGS[lang.code as keyof typeof LANG_SLUGS];
  const today = new Date().toISOString().split('T')[0];

  const entries: string[] = [];

  entries.push(sitemapUrl(`https://nossy.pro/${lang.code}/${slug}/`, today));

  for (const region of REGIONS) {
    const url = `https://nossy.pro/${lang.code}/${slug}/${region.code}/`;
    const alternates = LANGUAGES.map(l =>
      `    <xhtml:link rel="alternate" hreflang="${l.code}" href="https://nossy.pro/${l.code}/${LANG_SLUGS[l.code]}/${region.code}/" />`
    ).join("\n");
    entries.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
${alternates}
  </url>`);

    if (region.countries) {
      for (const cName of Object.keys(region.countries)) {
        const cSlug = cName.toLowerCase().replace(/\s+/g, '-');
        const cUrl = `https://nossy.pro/${lang.code}/${slug}/${cSlug}/`;
        const cAlternates = LANGUAGES.map(l =>
          `    <xhtml:link rel="alternate" hreflang="${l.code}" href="https://nossy.pro/${l.code}/${LANG_SLUGS[l.code]}/${cSlug}/" />`
        ).join("\n");
        entries.push(`  <url>
      <loc>${cUrl}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.7</priority>
${cAlternates}
  </url>`);
      }
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

  return new NextResponse(xml, { headers: { "Content-Type": "application/xml" } });
}

function sitemapUrl(loc: string, lastmod: string): string {
  const alternates = LANGUAGES.map(l =>
    `    <xhtml:link rel="alternate" hreflang="${l.code}" href="https://nossy.pro/${l.code}/${LANG_SLUGS[l.code]}/" />`
  ).join("\n");
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
${alternates}
  </url>`;
}

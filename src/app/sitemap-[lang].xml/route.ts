import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { REGIONS } from "@/lib/countries";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang: langCode } = await params;
  const lang = LANGUAGES.find(l => l.code === langCode);
  if (!lang) return NextResponse.json({ error: "Unknown lang" }, { status: 404 });

  const slug = LANG_SLUGS[lang.code];
  const today = new Date().toISOString().split('T')[0];

  const entries: string[] = [];

  // Global page for this language
  entries.push(sitemapUrl(`https://workversely.com/${lang.code}/${slug}/`, today));

  // Region pages with hreflang alternates
  for (const region of REGIONS) {
    const url = `https://workversely.com/${lang.code}/${slug}/${region.code}/`;
    const alternates = LANGUAGES.map(l =>
      `    <xhtml:link rel="alternate" hreflang="${l.code}" href="https://workversely.com/${l.code}/${LANG_SLUGS[l.code]}/${region.code}/" />`
    ).join("\n");
    entries.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
${alternates}
  </url>`);

    // Sub-country pages
    if (region.countries) {
      for (const cName of Object.keys(region.countries)) {
        const cSlug = cName.toLowerCase().replace(/\s+/g, '-');
        const cUrl = `https://workversely.com/${lang.code}/${slug}/${cSlug}/`;
        const cAlternates = LANGUAGES.map(l =>
          `    <xhtml:link rel="alternate" hreflang="${l.code}" href="https://workversely.com/${l.code}/${LANG_SLUGS[l.code]}/${cSlug}/" />`
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
    `    <xhtml:link rel="alternate" hreflang="${l.code}" href="https://workversely.com/${l.code}/${LANG_SLUGS[l.code]}/" />`
  ).join("\n");
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
${alternates}
  </url>`;
}

import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { COUNTRIES } from "@/lib/countries";
import { NextResponse } from "next/server";
import { jobs as allJobs } from "@/app/api/jobs/route";

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang: langCode } = await params;
  const lang = LANGUAGES.find(l => l.code === langCode);
  if (!lang) return NextResponse.json({ error: "Unknown lang" }, { status: 404 });

  const slug = LANG_SLUGS[lang.code];
  const today = new Date().toISOString().split('T')[0];

  const prioLangs = ["en", "pt-br", "es", "ar", "hi", "sw", "fr", "bn", "tl", "ur"];
  const includeJobs = prioLangs.includes(lang.code);

  const entries: string[] = [];

  // Global page for this language
  entries.push(sitemapUrl(`https://ww.jobs/${lang.code}/${slug}/`, today, lang.code));

  // Country pages with hreflang alternates
  for (const country of COUNTRIES) {
    const url = `https://ww.jobs/${lang.code}/${slug}/${country.code}/`;
    const alternates = LANGUAGES.map(l =>
      `    <xhtml:link rel="alternate" hreflang="${l.code}" href="https://ww.jobs/${l.code}/${LANG_SLUGS[l.code]}/${country.code}/" />`
    ).join("\n");
    entries.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
${alternates}
  </url>`);
  }

  // Job detail pages for priority languages (with Job Posting XML extension)
  if (includeJobs) {
    for (const job of allJobs) {
      const jobSlug = job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const url = `https://ww.jobs/${lang.code}/${slug}/${job.country}/${jobSlug}`;
      entries.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
    <jp:job_posting>
      <jp:title><![CDATA[${job.title}]]></jp:title>
      <jp:description><![CDATA[${job.description}]]></jp:description>
      <jp:date_posted>${new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]}</jp:date_posted>
      <jp:valid_through>${new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]}</jp:valid_through>
      <jp:hiring_organization name="${job.company}" />
      <jp:job_location city="${job.location.split(',')[0].trim()}" country="${job.country.toUpperCase()}" />
      <jp:employment_type>${job.type === 'Remote' ? 'FULL_TIME' : job.type.toUpperCase().replace('-', '_')}</jp:employment_type>
    </jp:job_posting>
  </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:jp="https://www.google.com/schemas/sitemap-jp/1.0">
${entries.join("\n")}
</urlset>`;

  return new NextResponse(xml, { headers: { "Content-Type": "application/xml" } });
}

function sitemapUrl(loc: string, lastmod: string, langCode: string): string {
  const alternates = LANGUAGES.map(l =>
    `    <xhtml:link rel="alternate" hreflang="${l.code}" href="https://ww.jobs/${l.code}/${LANG_SLUGS[l.code]}/" />`
  ).join("\n");
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
${alternates}
  </url>`;
}

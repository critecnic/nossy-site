import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { COUNTRIES } from "@/lib/countries";
import { NextResponse } from "next/server";
import { jobs as allJobs } from "@/app/api/jobs/route";

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  langHref?: string;
  title?: string;
  company?: string;
  location?: string;
  country?: string;
}

function jobSlug(title: string, location: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + location.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang: langCode } = await params;
  const lang = LANGUAGES.find(l => l.code === langCode);
  if (!lang) return NextResponse.json({ error: "Unknown lang" }, { status: 404 });

  const slug = LANG_SLUGS[lang.code];
  const today = new Date().toISOString().split('T')[0];
  const entries: SitemapEntry[] = [];

  // Global page for this language
  entries.push({ loc: `https://ww.jobs/${lang.code}/${slug}/`, lastmod: today });

  // Country pages
  for (const country of COUNTRIES) {
    entries.push({ loc: `https://ww.jobs/${lang.code}/${slug}/${country.code}/`, lastmod: today });
  }

  // Job pages (only for priority languages)
  const prioLangs = ["en", "pt-br", "es", "ar", "hi", "sw", "fr"];
  if (prioLangs.includes(lang.code)) {
    const countryJobs = allJobs.filter(j => j.country !== undefined);
    for (const job of countryJobs) {
      entries.push({
        loc: `https://ww.jobs/${lang.code}/${slug}/${job.country}/${jobSlug(job.title, job.location)}`,
        lastmod: today,
        title: job.title,
        company: job.company,
        location: job.location,
        country: job.country,
      });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(e => `  <url>
    <loc>${e.loc}</loc>
    <xhtml:link rel="alternate" hreflang="${lang.code}" href="${e.loc}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://ww.jobs/en/jobs/${e.country || ''}" />
    <lastmod>${e.lastmod || today}</lastmod>
  </url>`).join("\n")}
</urlset>`;

  return new NextResponse(xml, { headers: { "Content-Type": "application/xml" } });
}

import { NextRequest, NextResponse } from "next/server";
import { needsServerTranslation, translateJobListFields } from "@/lib/translate-server";
import { LANGUAGES } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { maskJobAlways } from "@/lib/paywall-mask";
import { getCountryListing, getSectorListing } from "@/lib/country-listing";

const API_TIMEOUT = 8000; // 8s max for the whole request

const apiRateLimits: Record<string, number[]> = {};
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (!apiRateLimits[ip]) apiRateLimits[ip] = [];
  apiRateLimits[ip].filter(t => now - t < 60000);
  if (apiRateLimits[ip].length >= 120) return true;
  apiRateLimits[ip].push(now);
  return false;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const file = req.nextUrl.searchParams.get("file");
  const langCode = req.nextUrl.searchParams.get("lang") || 'pt-br';
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || 'pt-br') as Lang;
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") || '18', 10)));
  const sector = req.nextUrl.searchParams.get("sector") || '';

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (!/^[a-z0-9][a-z0-9\-_]*\.json$/.test(file)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const baseName = file.replace('.json', '');

    // PADRÃO 0220 — rotação/mistura compartilhada com o SSR da página de
    // país (src/lib/country-listing.ts): remotas em TODOS os países,
    // G4 COMPANY entre os 10 primeiros, ordem rotaciona a cada 6h, nunca
    // a mesma empresa em sequência. SSR e API nunca divergem.
    const listing = sector.trim()
      ? await getSectorListing(baseName, sector, page, limit)
      : await getCountryListing(baseName, page, limit);

    const { jobs, total, totalPages } = listing;
    const pageOut = listing.page;

    // Premium 0220 (vagas livres): máscara mantida como no-op para não
    // quebrar call-sites — toda vaga é pública.
    const masked = jobs.map((j: any) => maskJobAlways(j));

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ jobs: [], total, page: pageOut, totalPages }, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
      });
    }

    if (!needsServerTranslation(lang)) {
      return NextResponse.json({ jobs: masked, total, page: pageOut, totalPages }, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
      });
    }

    console.log(`[NOSSY API] Country ${file} page ${pageOut} sector=${sector || 'all'}: ${jobs.length}/${total} jobs lang=${lang}`);
    const { map: translatedMap, ok: translateOk } = await translateJobListFields(masked, lang);

    const translated = masked.map((job: any) => {
      const t = translatedMap.get(job.id);
      return t
        ? { ...job, title: t.title, company: t.company, location: t.location, ...(t.description ? { description: t.description } : {}) }
        : job;
    });

    const cacheHeader = translateOk
      ? "public, s-maxage=3600, stale-while-revalidate=600"
      : "no-store";

    return NextResponse.json({ jobs: translated, total, page: pageOut, totalPages }, {
      headers: { "Content-Type": "application/json", "Cache-Control": cacheHeader },
    });
  } catch (err: any) {
    console.error('[NOSSY API] Country error:', err.message);
    // On timeout/error, return empty rather than 500
    return NextResponse.json({ jobs: [], total: 0, page: 1, totalPages: 1 }, {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { needsServerTranslation, translateJobListFields } from "@/lib/translate-server";
import { LANGUAGES } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { promises as fsp } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");

const apiRateLimits: Record<string, number[]> = {};
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (!apiRateLimits[ip]) apiRateLimits[ip] = [];
  apiRateLimits[ip] = apiRateLimits[ip].filter(t => now - t < 60000);
  if (apiRateLimits[ip].length >= 120) return true;
  apiRateLimits[ip].push(now);
  return false;
}

function safeFilePath(file: string): string | null {
  if (!/^[a-z0-9][a-z0-9\-_]*\.json$/.test(file)) return null;
  const resolved = path.resolve(DATA_DIR, file);
  if (!resolved.startsWith(DATA_DIR + path.sep) && resolved !== DATA_DIR) return null;
  return resolved;
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

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const safePath = safeFilePath(file);
  if (!safePath) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const raw = await fsp.readFile(safePath, "utf-8");
    const jobs = JSON.parse(raw);
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ jobs: [], total: 0, page: 1, totalPages: 0 }, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
      });
    }

    const total = jobs.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const pageJobs = jobs.slice(offset, offset + limit);

    // Portuguese - retorna sem traduzir
    if (!needsServerTranslation(lang)) {
      return NextResponse.json({ jobs: pageJobs, total, page, totalPages }, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
      });
    }

    // Traduz apenas a página atual via Gemini (máx ~100 jobs = 4 batches < 10s)
    console.log(`[NOSSY API] Country ${file} page ${page}: ${pageJobs.length}/${total} jobs lang=${lang}`);
    const { map: translatedMap, ok: translateOk } = await translateJobListFields(pageJobs, lang);

    const translated = pageJobs.map((job: any) => {
      const t = translatedMap.get(job.id);
      return t
        ? { ...job, title: t.title, company: t.company, location: t.location }
        : job;
    });

    const cacheHeader = translateOk
      ? "public, s-maxage=3600, stale-while-revalidate=600"
      : "no-store";

    return NextResponse.json({ jobs: translated, total, page, totalPages }, {
      headers: { "Content-Type": "application/json", "Cache-Control": cacheHeader },
    });
  } catch (err: any) {
    console.error('[NOSSY API] Country error:', err.message);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

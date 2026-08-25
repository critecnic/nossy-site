import { NextRequest, NextResponse } from "next/server";
import { needsServerTranslation } from "@/lib/translate-server";
import { LANGUAGES } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { promises as fsp } from "fs";
import path from "path";

const latestCache = new Map<string, { data: any; ts: number }>();
const LATEST_CACHE_TTL = 4 * 60 * 60 * 1000;

// Simple rate limiting
const apiRateLimits: Record<string, number[]> = {};
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (!apiRateLimits[ip]) apiRateLimits[ip] = [];
  apiRateLimits[ip] = apiRateLimits[ip].filter(t => now - t < 60000);
  if (apiRateLimits[ip].length >= 60) return true;
  apiRateLimits[ip].push(now);
  return false;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const langCode = req.nextUrl.searchParams.get("lang") || 'pt-br';
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || 'pt-br') as Lang;

  try {
    const filePath = path.join(process.cwd(), "public", "data", "latest_20.json");
    const raw = await fsp.readFile(filePath, "utf-8");
    const jobs = JSON.parse(raw);

    if (!needsServerTranslation(lang)) {
      return new NextResponse(raw, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=1800" },
      });
    }

    const cached = latestCache.get(lang);
    if (cached && Date.now() - cached.ts < LATEST_CACHE_TTL) {
      return new NextResponse(JSON.stringify(cached.data), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=1800", 'X-Translated': 'cached' },
      });
    }

    const result = jobs.map((job: any) => ({ ...job, _pendingTranslation: true }));

    translateLatestAndCache(lang, jobs).catch((err) => {
      console.error('[NOSSY API] Background latest translation failed:', err.message);
    });

    return new NextResponse(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store", 'X-Translation-Status': 'pending' },
    });
  } catch (err: any) {
    console.error('[NOSSY API] Latest error:', err.message);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

async function translateLatestAndCache(lang: Lang, jobs: any[]): Promise<void> {
  try {
    const { translateJobListFields } = await import("@/lib/translate-server");
    console.log(`[NOSSY API] Background translating latest 20 for lang=${lang}`);
    const translatedMap = await Promise.race([
      translateJobListFields(jobs, lang),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Latest translation timeout (8s)')), 8000)
      ),
    ]);

    const translated = jobs.map((job: any) => {
      const t = translatedMap.get(job.id);
      return t ? { ...job, title: t.title, company: t.company, location: t.location, _translated: true } : job;
    });

    latestCache.set(lang, { data: translated, ts: Date.now() });
  } catch (err: any) {
    console.error(`[NOSSY API] Background latest translation error:`, err.message);
    latestCache.set(lang, { data: jobs, ts: Date.now() - LATEST_CACHE_TTL + 60_000 });
  }
}

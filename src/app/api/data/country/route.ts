import { NextRequest, NextResponse } from "next/server";
import { needsServerTranslation } from "@/lib/translate-server";
import { LANGUAGES } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { promises as fsp } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024;

// Simple in-memory rate limiting
const apiRateLimits: Record<string, number[]> = {};
function isApiRateLimited(ip: string): boolean {
  const now = Date.now();
  if (!apiRateLimits[ip]) apiRateLimits[ip] = [];
  apiRateLimits[ip] = apiRateLimits[ip].filter(t => now - t < 60000);
  if (apiRateLimits[ip].length >= 60) return true;
  apiRateLimits[ip].push(now);
  return false;
}

function safeFilePath(file: string): string | null {
  if (!/^[a-z0-9][a-z0-9\-_]*\.json$/.test(file)) return null;
  const resolved = path.resolve(DATA_DIR, file);
  if (!resolved.startsWith(DATA_DIR + path.sep) && resolved !== DATA_DIR) return null;
  return resolved;
}

// Cache with size limit
const translatedCache = new Map<string, { data: any; ts: number }>();
const TRANSLATED_CACHE_TTL = 6 * 60 * 60 * 1000;
const MAX_CACHE_SIZE = 500;

// In-flight dedup to prevent duplicate translations
const inFlightTranslations = new Set<string>();

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (isApiRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const file = req.nextUrl.searchParams.get("file");
  const langCode = req.nextUrl.searchParams.get("lang") || 'pt-br';
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || 'pt-br') as Lang;

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const safePath = safeFilePath(file);
  if (!safePath) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const raw = await fsp.readFile(safePath, "utf-8");
    if (raw.length > MAX_RESPONSE_SIZE) {
      return NextResponse.json({ error: "Response too large" }, { status: 413 });
    }

    if (!needsServerTranslation(lang)) {
      return new NextResponse(raw, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
      });
    }

    const cacheKey = file + ':' + lang;
    const cached = translatedCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < TRANSLATED_CACHE_TTL) {
      return new NextResponse(JSON.stringify(cached.data), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600", 'X-Translated': 'cached' },
      });
    }

    const jobs = JSON.parse(raw);
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return new NextResponse(raw, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600" },
      });
    }

    // Evict old cache entries if over limit
    if (translatedCache.size >= MAX_CACHE_SIZE) {
      const oldest = [...translatedCache.entries()].sort((a, b) => a[1].ts - b[1].ts);
      const toRemove = oldest.slice(0, Math.floor(MAX_CACHE_SIZE * 0.25));
      toRemove.forEach(([k]) => translatedCache.delete(k));
    }

    // Return raw data immediately
    const responseHeaders = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      'X-Translation-Status': 'pending',
    };

    // Fire background translation (deduplicated)
    if (!inFlightTranslations.has(cacheKey)) {
      inFlightTranslations.add(cacheKey);
      translateAndCache(cacheKey, file, jobs, lang).finally(() => {
        inFlightTranslations.delete(cacheKey);
      });
    }

    return new NextResponse(JSON.stringify(jobs.map((job: any) => ({ ...job, _pendingTranslation: true }))), {
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error('[NOSSY API] Error:', err.message);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

async function translateAndCache(cacheKey: string, file: string, jobs: any[], lang: Lang): Promise<void> {
  try {
    const { translateJobListFields } = await import("@/lib/translate-server");
    const MAX_JOBS_TO_TRANSLATE = 30;
    const jobsToTranslate = jobs.slice(0, MAX_JOBS_TO_TRANSLATE);

    console.log(`[NOSSY API] Background translating ${jobsToTranslate.length}/${jobs.length} jobs for ${lang}, file=${file}`);

    const translatedMap = await Promise.race([
      translateJobListFields(jobsToTranslate, lang),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Translation timeout (8s)')), 8000)
      ),
    ]);

    const translated = jobs.map((job: any) => {
      const t = translatedMap.get(job.id);
      return t ? { ...job, title: t.title, company: t.company, location: t.location, _translated: true } : job;
    });

    translatedCache.set(cacheKey, { data: translated, ts: Date.now() });
  } catch (err: any) {
    console.error(`[NOSSY API] Background translation error for ${lang}:`, err.message);
    translatedCache.set(cacheKey, { data: jobs, ts: Date.now() - TRANSLATED_CACHE_TTL + 60_000 });
  }
}
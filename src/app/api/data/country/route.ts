import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { needsServerTranslation } from "@/lib/translate-server";
import type { Lang } from "@/lib/i18n";

const DATA_DIR = path.join(process.cwd(), "public", "data");
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB

// Simple in-memory rate limiting
const apiRateLimits: Record<string, number[]> = {};
function isApiRateLimited(ip: string): boolean {
  const now = Date.now();
  if (!apiRateLimits[ip]) apiRateLimits[ip] = [];
  apiRateLimits[ip] = apiRateLimits[ip].filter(t => now - t < 60000);
  if (apiRateLimits[ip].length >= 100) return true;
  apiRateLimits[ip].push(now);
  return false;
}

function safeFilePath(file: string): string | null {
  // Only allow single filename with .json extension, no path separators
  if (!/^[a-z0-9][a-z0-9\-_]*\.json$/.test(file)) return null;
  const resolved = path.resolve(DATA_DIR, file);
  if (!resolved.startsWith(DATA_DIR + path.sep) && resolved !== DATA_DIR) return null;
  return resolved;
}

// Lightweight in-memory cache for translated results
const translatedCache = new Map<string, { data: any; ts: number }>();
const TRANSLATED_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (isApiRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const file = req.nextUrl.searchParams.get("file");
  const lang = (req.nextUrl.searchParams.get("lang") || 'pt-br') as Lang;

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const safePath = safeFilePath(file);
  if (!safePath) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const raw = fs.readFileSync(safePath, "utf-8");
    if (raw.length > MAX_RESPONSE_SIZE) {
      return NextResponse.json({ error: "Response too large" }, { status: 413 });
    }

    // If Portuguese (source language), return raw data immediately
    if (!needsServerTranslation(lang)) {
      return new NextResponse(raw, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
      });
    }

    // Check translated cache FIRST — instant response, no API call
    const cacheKey = file + ':' + lang;
    const cached = translatedCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < TRANSLATED_CACHE_TTL) {
      return new NextResponse(JSON.stringify(cached.data), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600", 'X-Translated': 'cached' },
      });
    }

    // For NON-cached requests: return raw data IMMEDIATELY with _pendingTranslation flag
    // This prevents the page from hanging while translation happens in background
    const jobs = JSON.parse(raw);
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return new NextResponse(raw, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600" },
      });
    }

    // Return raw data immediately so the page loads instantly
    // Start background translation (fire-and-forget, will be cached for next request)
    const responseHeaders = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      'X-Translation-Status': 'pending',
    };

    // Fire background translation (don't await — page already responding)
    translateAndCache(cacheKey, file, jobs, lang).catch((err) => {
      console.error('[NOSSY API] Background translation failed:', err.message);
    });

    return new NextResponse(JSON.stringify(jobs.map((job: any) => ({ ...job, _pendingTranslation: true }))), {
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error('[NOSSY API] Error:', err.message);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

// Background translation — caches result for subsequent requests
async function translateAndCache(
  cacheKey: string,
  file: string,
  jobs: any[],
  lang: Lang
): Promise<void> {
  try {
    // Dynamic import to avoid blocking the main response
    const { translateJobListFields } = await import("@/lib/translate-server");

    // Translate with a 5-second timeout per job (3 fields in parallel)
    const MAX_JOBS_TO_TRANSLATE = 30; // Limit to prevent Vercel 10s timeout
    const jobsToTranslate = jobs.slice(0, MAX_JOBS_TO_TRANSLATE);

    console.log(`[NOSSY API] Background translating ${jobsToTranslate.length}/${jobs.length} jobs for ${lang}, file=${file}`);

    const translatedMap = await Promise.race([
      translateJobListFields(jobsToTranslate, lang),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Translation timeout (8s)')), 8000)
      ),
    ]);

    // Apply translations
    const translated = jobs.map((job: any) => {
      const t = translatedMap.get(job.id);
      return t
        ? { ...job, title: t.title, company: t.company, location: t.location, _translated: true }
        : job;
    });

    // Cache for future requests (instant delivery)
    translatedCache.set(cacheKey, { data: translated, ts: Date.now() });
    console.log(`[NOSSY API] Translation cached for ${lang}, file=${file}`);
  } catch (err: any) {
    console.error(`[NOSSY API] Background translation error for ${lang}:`, err.message);
    // Even on failure, cache raw data with a short TTL to avoid retrying constantly
    translatedCache.set(cacheKey, { data: jobs, ts: Date.now() - TRANSLATED_CACHE_TTL + 60_000 }); // 1 min TTL on failure
  }
}

import { NextRequest, NextResponse } from "next/server";
import { needsServerTranslation } from "@/lib/translate-server";
import { LANGUAGES } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { promises as fsp } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");

// Cache for translated full jobs (max 2000 entries to prevent unbounded growth)
const detailCache = new Map<string, { data: any; ts: number }>();
const DETAIL_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 2000;

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

// CRITICAL: Validate file param to prevent path traversal
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
  const jobId = req.nextUrl.searchParams.get("id");
  const langCode = req.nextUrl.searchParams.get("lang") || 'pt-br';

  // Validate lang against allowed languages
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || 'pt-br') as Lang;

  if (!file || !jobId) {
    return NextResponse.json({ error: "Missing file or id" }, { status: 400 });
  }

  // CRITICAL: Validate file path to prevent path traversal
  const safePath = safeFilePath(file);
  if (!safePath) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const raw = await fsp.readFile(safePath, "utf-8");
    const jobs: any[] = JSON.parse(raw);
    const job = jobs.find(j => String(j.id) === String(jobId));

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // If Portuguese, return as-is
    if (!needsServerTranslation(lang)) {
      return new NextResponse(JSON.stringify(job), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600" },
      });
    }

    // Check cache — instant response
    const cacheKey = `${file}:${jobId}:${lang}`;
    const cached = detailCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < DETAIL_CACHE_TTL) {
      return new NextResponse(JSON.stringify(cached.data), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600", 'X-Translated': 'cached' },
      });
    }

    // Evict old cache entries if over limit
    if (detailCache.size >= MAX_CACHE_SIZE) {
      const oldest = [...detailCache.entries()].sort((a, b) => a[1].ts - b[1].ts);
      const toRemove = oldest.slice(0, Math.floor(MAX_CACHE_SIZE * 0.25));
      toRemove.forEach(([k]) => detailCache.delete(k));
    }

    // Return raw data IMMEDIATELY, translate in background
    const result = { ...job, _pendingTranslation: true };

    translateDetailAndCache(cacheKey, job, lang, file, jobId).catch((err) => {
      console.error('[NOSSY API] Background detail translation failed:', err.message);
    });

    return new NextResponse(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store", 'X-Translation-Status': 'pending' },
    });
  } catch (err: any) {
    console.error('[NOSSY API] Job detail error:', err.message);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

async function translateDetailAndCache(
  cacheKey: string,
  job: any,
  lang: Lang,
  file: string,
  jobId: string
): Promise<void> {
  try {
    const { translateJobFull } = await import("@/lib/translate-server");
    console.log(`[NOSSY API] Background translating job detail id=${jobId} for lang=${lang}`);

    const translated = await Promise.race([
      translateJobFull(job, lang),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Detail translation timeout (8s)')), 8000)
      ),
    ]);

    const result = { ...job, title: translated.title, description: translated.description, company: translated.company, location: translated.location, _translated: true };
    detailCache.set(cacheKey, { data: result, ts: Date.now() });
  } catch (err: any) {
    console.error(`[NOSSY API] Background detail translation error:`, err.message);
    detailCache.set(cacheKey, { data: job, ts: Date.now() - DETAIL_CACHE_TTL + 60_000 });
  }
}

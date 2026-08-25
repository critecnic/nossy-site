import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { translateJobListFields, needsServerTranslation } from "@/lib/translate-server";
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

// Cache for translated file responses: "file:lang" → data
const translatedCache = new Map<string, any>();
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

    // Check translated cache
    const cacheKey = file + ':' + lang;
    const cached = translatedCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < TRANSLATED_CACHE_TTL) {
      return new NextResponse(JSON.stringify(cached.data), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600", 'X-Translated': 'cached' },
      });
    }

    // Parse and translate
    const jobs = JSON.parse(raw);
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return new NextResponse(raw, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600" },
      });
    }

    // Translate title, company, location for all jobs (list view fields)
    console.log(`[NOSSY API] Translating ${jobs.length} jobs for ${lang}, file=${file}`);
    const translatedMap = await translateJobListFields(jobs, lang);

    // Apply translations
    const translated = jobs.map((job: any) => {
      const t = translatedMap.get(job.id);
      return t ? { ...job, title: t.title, company: t.company, location: t.location, _translated: true } : job;
    });

    // Cache result
    translatedCache.set(cacheKey, { data: translated, ts: Date.now() });

    return new NextResponse(JSON.stringify(translated), {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600", 'X-Translated': 'fresh' },
    });
  } catch (err: any) {
    console.error('[NOSSY API] Error:', err.message);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

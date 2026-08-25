import { NextRequest, NextResponse } from "next/server";
import { needsServerTranslation } from "@/lib/translate-server";
import type { Lang } from "@/lib/i18n";
import fs from "fs";
import path from "path";

// Cache for translated latest data
const latestCache = new Map<string, { data: any; ts: number }>();
const LATEST_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

export async function GET(req: NextRequest) {
  const lang = (req.nextUrl.searchParams.get("lang") || 'pt-br') as Lang;

  try {
    const filePath = path.join(process.cwd(), "public", "data", "latest_20.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const jobs = JSON.parse(raw);

    // If Portuguese, return raw
    if (!needsServerTranslation(lang)) {
      return new NextResponse(raw, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=1800" },
      });
    }

    // Check cache — instant response
    const cached = latestCache.get(lang);
    if (cached && Date.now() - cached.ts < LATEST_CACHE_TTL) {
      return new NextResponse(JSON.stringify(cached.data), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=1800", 'X-Translated': 'cached' },
      });
    }

    // Return raw data IMMEDIATELY, translate in background
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
    console.log(`[NOSSY API] Latest translation cached for lang=${lang}`);
  } catch (err: any) {
    console.error(`[NOSSY API] Background latest translation error:`, err.message);
    latestCache.set(lang, { data: jobs, ts: Date.now() - LATEST_CACHE_TTL + 60_000 });
  }
}

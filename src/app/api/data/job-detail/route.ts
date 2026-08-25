import { NextRequest, NextResponse } from "next/server";
import { needsServerTranslation } from "@/lib/translate-server";
import type { Lang } from "@/lib/i18n";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");

// Cache for translated full jobs
const detailCache = new Map<string, { data: any; ts: number }>();
const DETAIL_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file");
  const jobId = req.nextUrl.searchParams.get("id");
  const lang = (req.nextUrl.searchParams.get("lang") || 'pt-br') as Lang;

  if (!file || !jobId) {
    return NextResponse.json({ error: "Missing file or id" }, { status: 400 });
  }

  try {
    // Find the job from the file
    const filePath = path.join(DATA_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const jobs: any[] = JSON.parse(raw);
    const job = jobs.find(j => String(j.id) === String(jobId));

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // If Portuguese, return as-is
    if (!needsServerTranslation(lang)) {
      return NextResponse.json(job, {
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

    // Return raw data IMMEDIATELY, translate in background
    const result = { ...job, _pendingTranslation: true };

    // Fire-and-forget background translation
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

// Background translation for job detail
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

    const result = {
      ...job,
      title: translated.title,
      description: translated.description,
      company: translated.company,
      location: translated.location,
      _translated: true,
    };

    detailCache.set(cacheKey, { data: result, ts: Date.now() });
    console.log(`[NOSSY API] Detail translation cached for id=${jobId}, lang=${lang}`);
  } catch (err: any) {
    console.error(`[NOSSY API] Background detail translation error:`, err.message);
    detailCache.set(cacheKey, { data: job, ts: Date.now() - DETAIL_CACHE_TTL + 60_000 });
  }
}

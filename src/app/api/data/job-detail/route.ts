import { NextRequest, NextResponse } from "next/server";
import { translateJobFull, needsServerTranslation, getMyMemoryLang } from "@/lib/translate-server";
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

    // Check cache
    const cacheKey = `${file}:${jobId}:${lang}`;
    const cached = detailCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < DETAIL_CACHE_TTL) {
      return new NextResponse(JSON.stringify(cached.data), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600", 'X-Translated': 'cached' },
      });
    }

    // Translate full job
    console.log(`[NOSSY API] Translating job detail id=${jobId} for lang=${lang}`);
    const translated = await translateJobFull(job, lang);

    const result = {
      ...job,
      title: translated.title,
      description: translated.description,
      company: translated.company,
      location: translated.location,
      _translated: true,
    };

    detailCache.set(cacheKey, { data: result, ts: Date.now() });

    return new NextResponse(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600", 'X-Translated': 'fresh' },
    });
  } catch (err: any) {
    console.error('[NOSSY API] Job detail error:', err.message);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

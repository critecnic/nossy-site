import { NextRequest, NextResponse } from "next/server";
import { translateJobListFields, needsServerTranslation } from "@/lib/translate-server";
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

    // Check cache
    const cached = latestCache.get(lang);
    if (cached && Date.now() - cached.ts < LATEST_CACHE_TTL) {
      return new NextResponse(JSON.stringify(cached.data), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=1800", 'X-Translated': 'cached' },
      });
    }

    // Translate
    console.log(`[NOSSY API] Translating latest 20 for lang=${lang}`);
    const translatedMap = await translateJobListFields(jobs, lang);

    const translated = jobs.map((job: any) => {
      const t = translatedMap.get(job.id);
      return t ? { ...job, title: t.title, company: t.company, location: t.location, _translated: true } : job;
    });

    latestCache.set(lang, { data: translated, ts: Date.now() });

    return new NextResponse(JSON.stringify(translated), {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=1800", 'X-Translated': 'fresh' },
    });
  } catch (err: any) {
    console.error('[NOSSY API] Latest error:', err.message);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { needsServerTranslation, translateJobListFields, TranslateResult } from "@/lib/translate-server";
import { LANGUAGES } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { promises as fsp } from "fs";
import path from "path";

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

    // Portuguese — return as-is
    if (!needsServerTranslation(lang)) {
      return new NextResponse(raw, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=1800" },
      });
    }

    // Translate ALL 20 jobs via Gemini
    console.log(`[NOSSY API] Translating latest ${jobs.length} jobs for lang=${lang}`);
    const result: TranslateResult<Map<number, { title: string; company: string; location: string }>> = await translateJobListFields(jobs, lang);

    const translated = jobs.map((job: any) => {
      const t = result.data.get(job.id);
      return t
        ? { ...job, title: t.title, company: t.company, location: t.location }
        : job;
    });

    // Only cache at CDN if translation actually succeeded
    const cacheControl = result.translated
      ? "public, s-maxage=1800"
      : "no-store";

    return new NextResponse(JSON.stringify(translated), {
      headers: { "Content-Type": "application/json", "Cache-Control": cacheControl },
    });
  } catch (err: any) {
    console.error('[NOSSY API] Latest error:', err.message);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { needsServerTranslation, translateJobListFields } from "@/lib/translate-server";
import { LANGUAGES } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { promises as fsp } from "fs";
import path from "path";

const API_TIMEOUT = 8000; // 8s max for the whole request

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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const filePath = path.join(process.cwd(), "public", "data", "latest_20.json");
    const raw = await fsp.readFile(filePath, "utf-8");
    const jobs = JSON.parse(raw);

    // Portuguese - retorna sem traduzir
    if (!needsServerTranslation(lang)) {
      clearTimeout(timer);
      return new NextResponse(raw, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=1800" },
      });
    }

    // Translate via Google GTX + MyMemory
    console.log(`[NOSSY API] Latest ${jobs.length} jobs lang=${lang}`);
    const { map: translatedMap, ok: translateOk } = await translateJobListFields(jobs, lang);
    clearTimeout(timer);

    const translated = jobs.map((job: any) => {
      const t = translatedMap.get(job.id);
      return t
        ? { ...job, title: t.title, company: t.company, location: t.location }
        : job;
    });

    const cacheHeader = translateOk
      ? "public, s-maxage=1800"
      : "no-store";

    return new NextResponse(JSON.stringify(translated), {
      headers: { "Content-Type": "application/json", "Cache-Control": cacheHeader },
    });
  } catch (err: any) {
    clearTimeout(timer);
    console.error('[NOSSY API] Latest error:', err.message);
    // On timeout/error, return raw data without translation rather than failing
    try {
      const filePath = path.join(process.cwd(), "public", "data", "latest_20.json");
      const raw = await fsp.readFile(filePath, "utf-8");
      return new NextResponse(raw, {
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    } catch {
      return NextResponse.json({ error: "Failed to load" }, { status: 500 });
    }
  }
}

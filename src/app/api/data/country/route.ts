import { NextRequest, NextResponse } from "next/server";
import { needsServerTranslation, translateJobListFields } from "@/lib/translate-server";
import { LANGUAGES } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { promises as fsp } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024;

const apiRateLimits: Record<string, number[]> = {};
function isRateLimited(ip: string): boolean {
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

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) {
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

    const jobs = JSON.parse(raw);
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return new NextResponse(raw, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
      });
    }

    // Portuguese - retorna sem traduzir
    if (!needsServerTranslation(lang)) {
      return new NextResponse(raw, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
      });
    }

    // Traduz TODAS as vagas via Gemini (batched)
    console.log(`[NOSSY API] Country ${jobs.length} jobs lang=${lang}`);
    const { map: translatedMap, ok: translateOk } = await translateJobListFields(jobs, lang);

    const translated = jobs.map((job: any) => {
      const t = translatedMap.get(job.id);
      return t
        ? { ...job, title: t.title, company: t.company, location: t.location }
        : job;
    });

    const cacheHeader = translateOk
      ? "public, s-maxage=3600, stale-while-revalidate=600"
      : "no-store";

    return new NextResponse(JSON.stringify(translated), {
      headers: { "Content-Type": "application/json", "Cache-Control": cacheHeader },
    });
  } catch (err: any) {
    console.error('[NOSSY API] Country error:', err.message);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

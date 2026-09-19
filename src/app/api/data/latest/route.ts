import { NextRequest, NextResponse } from "next/server";
import { needsServerTranslation, translateJobListFields } from "@/lib/translate-server";
import { LANGUAGES } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { maskJobAlways } from "@/lib/paywall-mask";
import { filterCompetitorJobs } from "@/lib/competitors";
import { DATA_DIR } from "@/lib/data-dir";
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

  const langCode = req.nextUrl.searchParams.get("lang") || 'en';
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || 'en') as Lang;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const filePath = path.join(DATA_DIR, "latest_20.json");
    const raw = await fsp.readFile(filePath, "utf-8");
    const jobs = filterCompetitorJobs(JSON.parse(raw));

    // Premium 0220: resposta pública — máscara sempre nas vagas com paywall
    const masked = jobs.map((j: any) => maskJobAlways(j));

    // Portuguese - retorna sem traduzir
    if (!needsServerTranslation(lang)) {
      clearTimeout(timer);
      return new NextResponse(JSON.stringify(masked), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=600" },
      });
    }

    // Translate via Google GTX + MyMemory
    console.log(`[NOSSY API] Latest ${jobs.length} jobs lang=${lang}`);
    const { map: translatedMap, ok: translateOk } = await translateJobListFields(masked, lang);
    clearTimeout(timer);

    const translated = masked.map((job: any) => {
      const t = translatedMap.get(job.id);
      return t
        ? { ...job, title: t.title, company: t.company, location: t.location }
        : job;
    });

    const cacheHeader = translateOk
      ? "public, s-maxage=1800, stale-while-revalidate=600"
      : "no-store";

    return new NextResponse(JSON.stringify(translated), {
      headers: { "Content-Type": "application/json", "Cache-Control": cacheHeader },
    });
  } catch (err: any) {
    clearTimeout(timer);
    console.error('[NOSSY API] Latest error:', err.message);
    // On timeout/error, return masked data without translation rather than failing
    try {
      const filePath = path.join(DATA_DIR, "latest_20.json");
      const raw = await fsp.readFile(filePath, "utf-8");
      const jobs = filterCompetitorJobs(JSON.parse(raw));
      // Premium 0220: NUNCA devolver o arquivo bruto — a máscara server-side
      // é obrigatória mesmo no fallback de erro (vazamento corrigido).
      const masked = jobs.map((j: any) => maskJobAlways(j));
      return new NextResponse(JSON.stringify(masked), {
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    } catch {
      return NextResponse.json({ error: "Failed to load" }, { status: 500 });
    }
  }
}

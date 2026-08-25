import { NextRequest, NextResponse } from "next/server";
import { needsServerTranslation, translateJobFull } from "@/lib/translate-server";
import { LANGUAGES } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { promises as fsp } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");

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
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || 'pt-br') as Lang;

  if (!file || !jobId) {
    return NextResponse.json({ error: "Missing file or id" }, { status: 400 });
  }

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

    // Portuguese — return as-is, cached at edge
    if (!needsServerTranslation(lang)) {
      return new NextResponse(JSON.stringify(job), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
      });
    }

    // Translate SYNCHRONOUSLY via GLM — client receives translated data immediately
    console.log(`[NOSSY API] Translating job detail id=${jobId} for lang=${lang}`);
    const translated = await translateJobFull(job, lang);

    const result = {
      ...job,
      title: translated.title,
      description: translated.description,
      company: translated.company,
      location: translated.location,
    };

    return new NextResponse(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
    });
  } catch (err: any) {
    console.error('[NOSSY API] Job detail error:', err.message);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

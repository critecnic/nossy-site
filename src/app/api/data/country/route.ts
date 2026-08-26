import { NextRequest, NextResponse } from "next/server";
import { needsServerTranslation, translateJobListFields } from "@/lib/translate-server";
import { LANGUAGES } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { promises as fsp } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");
const CHUNK_SIZE = 1000;

const apiRateLimits: Record<string, number[]> = {};
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (!apiRateLimits[ip]) apiRateLimits[ip] = [];
  apiRateLimits[ip] = apiRateLimits[ip].filter(t => now - t < 60000);
  if (apiRateLimits[ip].length >= 120) return true;
  apiRateLimits[ip].push(now);
  return false;
}

function safeFilePath(file: string): string | null {
  if (!/^[a-z0-9][a-z0-9\-_]*\.json$/.test(file)) return null;
  const resolved = path.resolve(DATA_DIR, file);
  if (!resolved.startsWith(DATA_DIR + path.sep) && resolved !== DATA_DIR) return null;
  return resolved;
}

async function getIndex(baseName: string): Promise<{ chunks: string[]; totalJobs: number } | null> {
  try {
    const indexPath = path.join(DATA_DIR, `${baseName}_index.json`);
    const raw = await fsp.readFile(indexPath, 'utf-8');
    const idx = JSON.parse(raw);
    return { chunks: idx.chunks, totalJobs: idx.totalJobs };
  } catch {
    return null;
  }
}

async function loadJobsFromChunks(baseName: string, page: number, limit: number): Promise<{ jobs: any[]; total: number } | null> {
  const idx = await getIndex(baseName);
  if (!idx) return null;

  const total = idx.totalJobs;
  const globalOffset = (page - 1) * limit;
  const startChunk = Math.floor(globalOffset / CHUNK_SIZE);
  const endChunk = Math.min(
    Math.floor((globalOffset + limit - 1) / CHUNK_SIZE),
    idx.chunks.length - 1
  );

  let combined: any[] = [];
  for (let c = startChunk; c <= endChunk; c++) {
    const chunkPath = safeFilePath(idx.chunks[c]);
    if (!chunkPath) continue;
    try {
      const chunkRaw = await fsp.readFile(chunkPath, 'utf-8');
      combined = combined.concat(JSON.parse(chunkRaw));
    } catch {}
  }

  const localOffset = globalOffset - (startChunk * CHUNK_SIZE);
  return { jobs: combined.slice(localOffset, localOffset + limit), total };
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const file = req.nextUrl.searchParams.get("file");
  const langCode = req.nextUrl.searchParams.get("lang") || 'pt-br';
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || 'pt-br') as Lang;
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") || '18', 10)));

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const safePath = safeFilePath(file);
  if (!safePath) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const baseName = file.replace('.json', '');
    let jobs: any[];
    let total: number;

    // Try direct file first
    const directExists = await fsp.access(safePath).then(() => true).catch(() => false);

    if (directExists) {
      const raw = await fsp.readFile(safePath, "utf-8");
      const allJobs = JSON.parse(raw);
      total = allJobs.length;
      const offset = (page - 1) * limit;
      jobs = allJobs.slice(offset, offset + limit);
    } else {
      const chunkResult = await loadJobsFromChunks(baseName, page, limit);
      if (!chunkResult) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      jobs = chunkResult.jobs;
      total = chunkResult.total;
    }

    const totalPagesCount = Math.max(1, Math.ceil(total / limit));

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ jobs: [], total, page: 1, totalPages: totalPagesCount }, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
      });
    }

    if (!needsServerTranslation(lang)) {
      return NextResponse.json({ jobs, total, page, totalPages: totalPagesCount }, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
      });
    }

    console.log(`[NOSSY API] Country ${file} page ${page}: ${jobs.length}/${total} jobs lang=${lang}`);
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

    return NextResponse.json({ jobs: translated, total, page, totalPages: totalPagesCount }, {
      headers: { "Content-Type": "application/json", "Cache-Control": cacheHeader },
    });
  } catch (err: any) {
    console.error('[NOSSY API] Country error:', err.message);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

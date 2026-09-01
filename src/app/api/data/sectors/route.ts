import { NextRequest, NextResponse } from "next/server";
import { promises as fsp } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");

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
  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const safePath = safeFilePath(file);
  if (!safePath) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const baseName = file.replace('.json', '');
    const sectorCounts: Record<string, number> = {};

    // Check for index file (chunked data)
    try {
      const indexPath = path.join(DATA_DIR, `${baseName}_index.json`);
      const raw = await fsp.readFile(indexPath, 'utf-8');
      const idx = JSON.parse(raw);

      for (const chunkFile of idx.chunks) {
        const chunkPath = safeFilePath(chunkFile);
        if (!chunkPath) continue;
        try {
          const chunkRaw = await fsp.readFile(chunkPath, 'utf-8');
          const chunk = JSON.parse(chunkRaw);
          for (const job of chunk) {
            const s = job.sector || 'Other';
            sectorCounts[s] = (sectorCounts[s] || 0) + 1;
          }
        } catch {}
      }
    } catch {
      // Fallback: single file
      const raw = await fsp.readFile(safePath, "utf-8");
      const allJobs = JSON.parse(raw);
      for (const job of allJobs) {
        const s = job.sector || 'Other';
        sectorCounts[s] = (sectorCounts[s] || 0) + 1;
      }
    }

    // Sort by count descending
    const sorted = Object.entries(sectorCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([sector, count]) => ({ sector, count }));

    return NextResponse.json({ sectors: sorted, totalJobs: Object.values(sectorCounts).reduce((a, b) => a + b, 0) }, {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
    });
  } catch (err: any) {
    console.error('[NOSSY API] Sectors error:', err.message);
    return NextResponse.json({ sectors: [], totalJobs: 0 }, {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
}

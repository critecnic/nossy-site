import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB

// Simple in-memory rate limiting
const apiRateLimits: Record<string, number[]> = {};
function isApiRateLimited(ip: string): boolean {
  const now = Date.now();
  if (!apiRateLimits[ip]) apiRateLimits[ip] = [];
  apiRateLimits[ip] = apiRateLimits[ip].filter(t => now - t < 60000);
  if (apiRateLimits[ip].length >= 100) return true;
  apiRateLimits[ip].push(now);
  return false;
}

function safeFilePath(file: string): string | null {
  // Only allow single filename with .json extension, no path separators
  if (!/^[a-z0-9][a-z0-9\-_]*\.json$/.test(file)) return null;
  const resolved = path.resolve(DATA_DIR, file);
  if (!resolved.startsWith(DATA_DIR + path.sep) && resolved !== DATA_DIR) return null;
  return resolved;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (isApiRateLimited(ip)) {
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
    const data = fs.readFileSync(safePath, "utf-8");
    if (data.length > MAX_RESPONSE_SIZE) {
      return NextResponse.json({ error: "Response too large" }, { status: 413 });
    }
    return new NextResponse(data, {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

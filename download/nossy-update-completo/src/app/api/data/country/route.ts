import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// In-memory rate limiter (100 requests per minute per IP)
// ---------------------------------------------------------------------------
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 100;

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(ip, entry);
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_RESPONSE_SIZE_BYTES = 10 * 1024 * 1024;
const DATA_DIR = "public/data";
const SAFE_FILE_REGEX = /^[a-z0-9\-_]+\.[a-z]+$/;

// ---------------------------------------------------------------------------
// Helper: resolve file path safely
// ---------------------------------------------------------------------------

function safeFilePath(filename: string): string | null {
  const resolved = path.resolve(process.cwd(), DATA_DIR, filename);
  const dataDirResolved = path.resolve(process.cwd(), DATA_DIR);
  if (!resolved.startsWith(dataDirResolved + path.sep) && resolved !== dataDirResolved) {
    return null;
  }
  return resolved;
}

// ---------------------------------------------------------------------------
// Helper: read and merge split JSON files
// ---------------------------------------------------------------------------

function readDataFile(filePath: string): unknown[] {
  const dataDir = path.resolve(process.cwd(), DATA_DIR);
  const baseName = path.basename(filePath, ".json");

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  const merged: unknown[] = [];
  let i = 1;
  while (true) {
    const splitName = `${baseName}-${i}.json`;
    const splitPath = path.join(dataDir, splitName);
    if (!fs.existsSync(splitPath)) break;
    const content = fs.readFileSync(splitPath, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      merged.push(...parsed);
    } else {
      merged.push(parsed);
    }
    i++;
  }
  return merged;
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const file = req.nextUrl.searchParams.get("file");
  if (!file) {
    return NextResponse.json({ error: "Missing required parameter: file" }, { status: 400 });
  }

  if (!SAFE_FILE_REGEX.test(file)) {
    return NextResponse.json(
      { error: "Invalid file name." },
      { status: 400 }
    );
  }

  if (!file.endsWith(".json")) {
    return NextResponse.json({ error: "Only JSON files are supported." }, { status: 400 });
  }

  const filePath = safeFilePath(file);
  if (!filePath) {
    return NextResponse.json({ error: "Invalid file path." }, { status: 400 });
  }

  try {
    const result = readDataFile(filePath);
    if (result.length === 0) {
      return NextResponse.json({ error: "Requested data not found." }, { status: 404 });
    }

    const jsonStr = JSON.stringify(result);
    const byteLength = Buffer.byteLength(jsonStr, "utf-8");
    if (byteLength > MAX_RESPONSE_SIZE_BYTES) {
      return NextResponse.json({ error: "Response too large." }, { status: 413 });
    }

    return new NextResponse(jsonStr, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "An internal error occurred." },
      { status: 500 }
    );
  }
}

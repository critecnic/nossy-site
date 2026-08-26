import { NextRequest, NextResponse } from "next/server";
import { promises as fsp } from "fs";
import path from "path";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "nossy-admin-2024";
const DATA_DIR = path.join(process.cwd(), "public", "data");

function auth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token === ADMIN_TOKEN;
}

// ─── Unified Agent Endpoint ───────────────────────────────────────────
// POST /api/agent  { "action": "...", ...params }
// All actions require Authorization: Bearer <ADMIN_TOKEN>
//
// ACTIONS:
//   diagnose   — Full site health check (same as GET)
//   test-gemini — Test Gemini API connectivity
//   split-files — Split large JSON files into chunks (fixes 413)
//   env-info   — Show which env vars are set (no values)
//   ping       — Connection test

export async function GET(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return diagnose();
}

export async function POST(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "diagnose":
        return diagnose();
      case "test-gemini":
        return testGemini();
      case "split-files":
        return splitLargeFiles();
      case "env-info":
        return envInfo();
      case "ping":
        return NextResponse.json({ status: "ok", time: new Date().toISOString(), uptime: process.uptime() });
      default:
        return NextResponse.json({ error: `Unknown action: ${action}. Valid: diagnose, test-gemini, split-files, env-info, ping` }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─── DIAGNOSE ──────────────────────────────────────────────────────────
async function diagnose(): Promise<NextResponse> {
  const results: Record<string, any> = {};
  const start = Date.now();

  // 1. Gemini API Key
  const geminiKey = process.env.GEMINI_API_KEY;
  let geminiStatus = "NOT_SET";
  let geminiLatency = 0;
  if (geminiKey) {
    try {
      const t0 = Date.now();
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Say OK" }] }] }),
          signal: AbortSignal.timeout(7000),
        }
      );
      geminiLatency = Date.now() - t0;
      geminiStatus = res.ok ? "WORKING" : `HTTP_${res.status}`;
    } catch (e: any) {
      geminiStatus = `ERROR: ${e.message.slice(0, 80)}`;
    }
  }
  results.gemini = { status: geminiStatus, keySet: !!geminiKey, latencyMs: geminiLatency };

  // 2. Data files
  try {
    const files = await fsp.readdir(DATA_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json") && !f.includes("_backup") && !f.includes("_index") && !f.includes("_p"));
    const chunkFiles = files.filter((f) => f.includes("_p") && f.endsWith(".json"));
    const indexFiles = files.filter((f) => f.includes("_index.json"));

    const largeFiles: string[] = [];
    let totalSize = 0;
    for (const f of jsonFiles) {
      const stat = await fsp.stat(path.join(DATA_DIR, f));
      const sizeMB = stat.size / (1024 * 1024);
      totalSize += stat.size;
      if (sizeMB > 4) largeFiles.push(`${f} (${Math.round(sizeMB * 100) / 100}MB)`);
    }

    results.dataFiles = {
      directFiles: jsonFiles.length,
      chunkFiles: chunkFiles.length,
      indexFiles: indexFiles.length,
      largeFilesOver4MB: largeFiles,
      totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
    };
  } catch (e: any) {
    results.dataFiles = { error: e.message };
  }

  // 3. USA chunk index check
  try {
    const idxRaw = await fsp.readFile(path.join(DATA_DIR, "eua_united-states_index.json"), "utf-8");
    const idx = JSON.parse(idxRaw);
    results.usaChunks = {
      indexed: true,
      totalJobs: idx.totalJobs,
      chunks: idx.chunks.length,
      chunkSize: idx.chunkSize,
    };
  } catch {
    results.usaChunks = { indexed: false, error: "No index file found" };
  }

  // 4. Environment
  results.environment = {
    nodeEnv: process.env.NODE_ENV || "unknown",
    vercel: !!process.env.VERCEL,
    region: process.env.VERCEL_REGION || "local",
    geminiKeySet: !!process.env.GEMINI_API_KEY,
    adminTokenSet: !!process.env.ADMIN_TOKEN,
    databaseUrlSet: !!process.env.DATABASE_URL,
  };

  // 5. Summary with actions
  const problems: string[] = [];
  const actions: string[] = [];

  if (!geminiKey) {
    problems.push("GEMINI_API_KEY not configured — translations will fail");
    actions.push("Add GEMINI_API_KEY to Vercel Environment Variables");
  } else if (geminiStatus !== "WORKING") {
    problems.push(`Gemini API error: ${geminiStatus}`);
    actions.push("Check GEMINI_API_KEY validity");
  } else {
    actions.push("Gemini OK — translations will work");
  }

  if (results.dataFiles?.largeFilesOver4MB?.length > 0) {
    problems.push(`Large files causing 413: ${results.dataFiles.largeFilesOver4MB.join(", ")}`);
    actions.push("Run action 'split-files' to fix large files");
  }

  if (!results.usaChunks?.indexed) {
    problems.push("USA jobs not chunked");
    actions.push("Run action 'split-files' to create chunks");
  }

  results.summary = {
    score: Math.max(0, 100 - problems.length * 25),
    problems,
    actions,
    diagnosticTimeMs: Date.now() - start,
  };

  return NextResponse.json(results, {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// ─── TEST GEMINI ───────────────────────────────────────────────────────
async function testGemini(): Promise<NextResponse> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({
      status: "KEY_NOT_SET",
      message: "GEMINI_API_KEY is not in environment variables. Add it in Vercel Dashboard > Settings > Environment Variables",
    });
  }
  try {
    const t0 = Date.now();
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: "Translate to English" }] },
          contents: [{ role: "user", parts: [{ text: JSON.stringify([{ id: 1, title: "Engenheiro de Software", company: "Google", location: "Sao Paulo" }]) }] }],
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
        }),
        signal: AbortSignal.timeout(8000),
      }
    );
    const data = await res.json();
    const translated = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({
      status: res.ok ? "WORKING" : `HTTP_${res.status}`,
      latencyMs: Date.now() - t0,
      preview: translated ? translated.slice(0, 200) : null,
      error: res.ok ? null : data,
    });
  } catch (e: any) {
    return NextResponse.json({ status: "ERROR", message: e.message });
  }
}

// ─── SPLIT LARGE FILES ────────────────────────────────────────────────
async function splitLargeFiles(): Promise<NextResponse> {
  const CHUNK = 1000;
  const results: Array<Record<string, any>> = [];

  try {
    const files = await fsp.readdir(DATA_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json") && !f.includes("_backup") && !f.includes("_index") && !f.includes("_p"));

    for (const f of jsonFiles) {
      const fp = path.join(DATA_DIR, f);
      const stat = await fsp.stat(fp);
      const sizeMB = stat.size / (1024 * 1024);

      if (sizeMB <= 4) {
        results.push({ file: f, skipped: true, reason: "under 4MB", sizeMB: Math.round(sizeMB * 100) / 100 });
        continue;
      }

      // Check if already has index
      const baseName = f.replace(".json", "");
      const indexPath = path.join(DATA_DIR, `${baseName}_index.json`);
      const hasIndex = await fsp.access(indexPath).then(() => true).catch(() => false);
      if (hasIndex) {
        results.push({ file: f, skipped: true, reason: "already chunked (index exists)", sizeMB: Math.round(sizeMB * 100) / 100 });
        continue;
      }

      const raw = await fsp.readFile(fp, "utf-8");
      const jobs = JSON.parse(raw);
      const totalChunks = Math.ceil(jobs.length / CHUNK);

      const chunks: string[] = [];
      for (let i = 0; i < jobs.length; i += CHUNK) {
        const chunk = jobs.slice(i, i + CHUNK);
        const chunkFile = `${baseName}_p${Math.floor(i / CHUNK) + 1}.json`;
        await fsp.writeFile(path.join(DATA_DIR, chunkFile), JSON.stringify(chunk));
        chunks.push(chunkFile);
      }

      await fsp.writeFile(indexPath, JSON.stringify({
        original: f, totalJobs: jobs.length, chunkSize: CHUNK, chunks, totalPages: totalChunks,
      }));

      // Remove the large original
      await fsp.unlink(fp);

      results.push({
        file: f, sizeMB: Math.round(sizeMB * 100) / 100, totalJobs: jobs.length,
        chunksCreated: totalChunks, action: "split + deleted original",
      });
    }

    return NextResponse.json({ action: "split-files", processed: results.length, results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ─── ENV INFO ──────────────────────────────────────────────────────────
function envInfo(): NextResponse {
  return NextResponse.json({
    environment: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? `SET (${process.env.GEMINI_API_KEY.length} chars)` : "NOT SET",
      ADMIN_TOKEN: process.env.ADMIN_TOKEN ? "SET" : "NOT SET (using default)",
      DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT SET",
      NODE_ENV: process.env.NODE_ENV || "unknown",
      VERCEL: process.env.VERCEL ? "YES" : "NO",
      VERCEL_REGION: process.env.VERCEL_REGION || "N/A",
    },
    instructions: {
      GEMINI_API_KEY: "Add in Vercel Dashboard > Project > Settings > Environment Variables. Get key from https://aistudio.google.com/apikey",
      ADMIN_TOKEN: "Add in Vercel Dashboard > Project > Settings > Environment Variables. Use a strong random string.",
    },
  });
}

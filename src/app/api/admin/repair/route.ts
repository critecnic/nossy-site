import { NextRequest, NextResponse } from "next/server";
import { promises as fsp } from "fs";
import path from "path";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "nossy-admin-2024";
const DATA_DIR = path.join(process.cwd(), "public", "data");

function auth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token === ADMIN_TOKEN;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const action = body.action;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    switch (action) {
      case "split-large-files": {
        const results: Array<Record<string, any>> = [];
        const files = await fsp.readdir(DATA_DIR);
        const jsonFiles = files.filter((f) => f.endsWith(".json"));

        for (const f of jsonFiles) {
          const fp = path.join(DATA_DIR, f);
          const stat = await fsp.stat(fp);
          const sizeMB = stat.size / (1024 * 1024);

          if (sizeMB <= 4) {
            results.push({ file: f, skipped: true, reason: "under 4MB" });
            continue;
          }

          const raw = await fsp.readFile(fp, "utf-8");
          const jobs = JSON.parse(raw);
          const CHUNK = 1000;
          const totalChunks = Math.ceil(jobs.length / CHUNK);

          // Backup original
          const backupPath = fp.replace(".json", "_backup.json");
          await fsp.copyFile(fp, backupPath);

          // Write chunks
          const chunks: string[] = [];
          for (let i = 0; i < jobs.length; i += CHUNK) {
            const chunk = jobs.slice(i, i + CHUNK);
            const chunkFile = f.replace(".json", `_p${Math.floor(i / CHUNK) + 1}.json`);
            const chunkPath = path.join(DATA_DIR, chunkFile);
            await fsp.writeFile(chunkPath, JSON.stringify(chunk));
            chunks.push(chunkFile);
          }

          // Write index file
          const indexData = {
            original: f,
            totalJobs: jobs.length,
            chunkSize: CHUNK,
            chunks,
            totalPages: totalChunks,
          };
          const indexPath = fp.replace(".json", "_index.json");
          await fsp.writeFile(indexPath, JSON.stringify(indexData));

          // Remove original large file
          await fsp.unlink(fp);

          results.push({
            file: f,
            sizeMB: Math.round(sizeMB * 100) / 100,
            totalJobs: jobs.length,
            chunksCreated: totalChunks,
            backup: backupPath,
            index: indexPath,
          });
        }

        return NextResponse.json({ action: "split-large-files", results });
      }

      case "test-gemini": {
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
          return NextResponse.json({
            action: "test-gemini",
            status: "KEY_NOT_SET",
            message: "GEMINI_API_KEY is not configured in environment variables",
          });
        }
        try {
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
            action: "test-gemini",
            status: res.ok ? "WORKING" : `HTTP_${res.status}`,
            httpStatus: res.status,
            responsePreview: translated ? translated.slice(0, 200) : null,
            rawError: res.ok ? null : data,
          });
        } catch (e: any) {
          return NextResponse.json({
            action: "test-gemini",
            status: "ERROR",
            message: e.message,
          });
        }
      }

      case "clear-data-backups": {
        const files = await fsp.readdir(DATA_DIR);
        const backups = files.filter((f) => f.includes("_backup.json") || f.includes("_index.json"));
        for (const b of backups) {
          await fsp.unlink(path.join(DATA_DIR, b));
        }
        return NextResponse.json({ action: "clear-data-backups", removed: backups.length, files: backups });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

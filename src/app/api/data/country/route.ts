import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file");
  if (!file || !/^[a-z0-9\-_..]+\.json$/.test(file)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }
  try {
    const dir = path.join(process.cwd(), "public", "data");
    const p = path.join(dir, file);

    // If single file exists, serve it directly
    if (fs.existsSync(p)) {
      const data = fs.readFileSync(p, "utf-8");
      return new NextResponse(data, {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600" },
      });
    }

    // Check for split files (e.g., eua_united-states-1.json, -2.json, ...)
    const baseName = file.replace(".json", "");
    const splitFiles: string[] = [];
    let i = 1;
    while (fs.existsSync(path.join(dir, `${baseName}-${i}.json`))) {
      splitFiles.push(path.join(dir, `${baseName}-${i}.json`));
      i++;
    }

    if (splitFiles.length > 0) {
      let merged: unknown[] = [];
      for (const sf of splitFiles) {
        const content = fs.readFileSync(sf, "utf-8");
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          merged = merged.concat(parsed);
        }
      }
      return new NextResponse(JSON.stringify(merged), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600" },
      });
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

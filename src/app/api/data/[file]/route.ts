import { NextRequest, NextResponse } from "next/server";
import { DATA_DIR } from "@/lib/data-dir";
import { maskJobAlways } from "@/lib/paywall-mask";
import fs from "fs";
import path from "path";

const ALLOWED = new Set([
  "latest_20.json",
  "countries.json",
]);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  if (!ALLOWED.has(file)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const p = path.join(DATA_DIR, file);
    const data = fs.readFileSync(p, "utf-8");
    let body = data;
    if (file === "latest_20.json") {
      // Premium 0220: este arquivo contém vagas com paywall (empresa real).
      // Mesmo vindo de uma rota de API, a máscara server-side é obrigatória.
      try {
        const jobs = JSON.parse(data);
        body = JSON.stringify((Array.isArray(jobs) ? jobs : []).map((j: any) => maskJobAlways(j)));
      } catch { return NextResponse.json({ error: "Not found" }, { status: 404 }); }
    }
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
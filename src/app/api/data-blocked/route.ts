import { NextResponse } from "next/server";

// Premium 0220 — os dados brutos foram removidos de public/. Qualquer
// acesso a /data/*.json (estático) cai aqui e recebe 404, sem vazar
// nada. As rotas legítimas são /api/data/* (com máscara server-side).
export async function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export const POST = GET;

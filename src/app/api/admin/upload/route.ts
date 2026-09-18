import { NextResponse } from "next/server";
import deployConfig from "@/config/deploy.json";

// NOSSY 0220 — Receptor de arquivo de vagas do dono (Task 20-c)
// O anexo do chat está falhando (5 tentativas), então o dono envia o arquivo
// pelo navegador em /admin/uploader (rota sob /admin = protegida pelo
// agentLock: só o dono, por IP ou chave de acesso). Esta rota NÃO tem disco
// (serverless) e NÃO guarda segredos (GitHub bloqueia tokens em código):
//   1. repassa o arquivo ao tmpfiles.org (hospedagem temporária, ~1h);
//   2. extrai a URL de download DIRETO da página do arquivo;
//   3. avisa o agente via webhook.site (payload minúsculo: nome, tamanho, URLs);
//   4. responde ao dono com a confirmação.
// O agente lê o webhook, baixa o arquivo, confere e publica as vagas.

export const runtime = "nodejs";
export const maxDuration = 60;

const EXT_OK = new Set([".csv", ".xlsx", ".xls", ".txt"]);

function safeName(raw: string): string {
  const base = raw.split(/[\\/]/).pop() || "vagas.csv";
  const clean = base.replace(/[^A-Za-z0-9._ ()-]/g, "_").slice(0, 80).trim();
  return clean || "vagas.csv";
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Nenhum arquivo recebido (campo 'file')." },
        { status: 400 },
      );
    }

    const name = safeName(file.name || "vagas.csv");
    const dot = name.lastIndexOf(".");
    const ext = dot > -1 ? name.slice(dot).toLowerCase() : "";
    if (!EXT_OK.has(ext)) {
      return NextResponse.json(
        { ok: false, error: `Formato não aceito (${ext || "sem extensão"}). Use CSV, XLSX, XLS ou TXT.` },
        { status: 400 },
      );
    }

    const maxBytes = deployConfig.maxFileMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { ok: false, error: `Arquivo muito grande (${(file.size / 1048576).toFixed(1)} MB). Limite: ${deployConfig.maxFileMB} MB — salve como CSV, que é bem menor.` },
        { status: 413 },
      );
    }

    // 1) Repassa o arquivo (byte a byte) ao host de transferência temporário.
    const tf = new FormData();
    tf.append("file", file, name);
    const upRes = await fetch(deployConfig.tmpfilesApi, {
      method: "POST",
      body: tf,
      headers: { "User-Agent": "nossy-uploader/1.0" },
    });
    const upJson = (await upRes.json().catch(() => null)) as
      | { status?: string; data?: { url?: string } }
      | null;
    const pageUrl = upJson?.data?.url;
    if (upJson?.status !== "success" || !pageUrl) {
      return NextResponse.json(
        { ok: false, error: "O servidor de transferência não aceitou o arquivo agora. Tente de novo em 1 minuto; se persistir, cole o conteúdo como texto no chat." },
        { status: 502 },
      );
    }

    // 2) URL de download DIRETO (a página /dl/<chave> é um HTML com o link real).
    let directUrl = "";
    try {
      const landHtml = await (await fetch(pageUrl, { headers: { "User-Agent": "nossy-uploader/1.0" } })).text();
      const m = landHtml.match(/https:\/\/tmpfiles\.org\/dl\/[^"]+/);
      directUrl = m ? m[0] : "";
    } catch {
      /* se falhar, o agente extrai o link depois a partir da pageUrl */
    }

    // 3) Avisa o agente (payload minúsculo, sem o arquivo em si).
    let notificado = false;
    try {
      const whRes = await fetch(deployConfig.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "nossy-uploader/1.0" },
        body: JSON.stringify({
          tipo: "vagas-g4-upload",
          arquivo: name,
          bytes: file.size,
          url_pagina: pageUrl,
          url_direta: directUrl,
          ts: Date.now(),
        }),
      });
      notificado = whRes.ok;
    } catch {
      /* se o webhook falhar, o dono ainda pode mandar a URL no chat */
    }

    // 4) Confirmação para a tela do dono.
    return NextResponse.json({
      ok: true,
      arquivo: name,
      bytes: file.size,
      url_pagina: pageUrl,
      url_direta: directUrl || undefined,
      notificado,
      message:
        "Arquivo enviado com sucesso! O agente foi avisado automaticamente" +
        (notificado ? "" : " (aviso automático falhou — copie o link abaixo e cole no chat)") +
        ". Agora é só dizer no chat: 'enviei o arquivo'.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `Falha ao receber o arquivo: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 },
    );
  }
}

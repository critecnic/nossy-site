import { NextResponse } from "next/server";
import deployConfig from "@/config/deploy.json";

// NOSSY 0220 — Rota PÚBLICA de envio do arquivo de vagas (Task 20-e).
// O dono recusou colar texto no chat e o anexo do chat não grava no servidor
// (7 tentativas). Esta rota é a mesma mecânica da /api/admin/upload, porém
// pública (sem agentLock) para ZERO fricção: nossy.pro/enviar → escolher → enviar.
// Segurança: sem disco (serverless), sem segredos, limite de 4 MB, whitelist
// de extensão; o arquivo vai ao tmpfiles.org (temporário ~1h) e o webhook
// avisa o vigia, que só publica arquivos que passam na validação do
// importador (cabeçalho com cargo, descrição, erro < 1%). Lixo/junk morre no
// dry-run e nunca vira vaga no site.

export const runtime = "nodejs";
export const maxDuration = 60;

const EXT_OK = new Set([".docx", ".doc", ".csv", ".xlsx", ".xls", ".txt"]);

function safeName(raw: string): string {
  const base = raw.split(/[\\/]/).pop() || "vagas.docx";
  const clean = base.replace(/[^A-Za-z0-9._ ()-]/g, "_").slice(0, 80).trim();
  return clean || "vagas.docx";
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Nenhum arquivo recebido." },
        { status: 400 },
      );
    }

    const name = safeName(file.name || "vagas.docx");
    const dot = name.lastIndexOf(".");
    const ext = dot > -1 ? name.slice(dot).toLowerCase() : "";
    if (!EXT_OK.has(ext)) {
      return NextResponse.json(
        { ok: false, error: `Formato não aceito (${ext || "sem extensão"}). Use Word (.docx), Excel (.xlsx) ou CSV.` },
        { status: 400 },
      );
    }

    const maxBytes = deployConfig.maxFileMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { ok: false, error: `Arquivo muito grande (${(file.size / 1048576).toFixed(1)} MB). Limite: ${deployConfig.maxFileMB} MB.` },
        { status: 413 },
      );
    }
    if (file.size < 50) {
      return NextResponse.json(
        { ok: false, error: "Arquivo vazio ou corrompido." },
        { status: 400 },
      );
    }

    // 1) Repassa o arquivo (byte a byte) ao host de transferência temporário.
    const tf = new FormData();
    tf.append("file", file, name);
    const upRes = await fetch(deployConfig.tmpfilesApi, {
      method: "POST",
      body: tf,
      headers: { "User-Agent": "nossy-enviar/1.0" },
    });
    const upJson = (await upRes.json().catch(() => null)) as
      | { status?: string; data?: { url?: string } }
      | null;
    const pageUrl = upJson?.data?.url;
    if (upJson?.status !== "success" || !pageUrl) {
      return NextResponse.json(
        { ok: false, error: "O servidor de transferência não aceitou o arquivo agora. Tente de novo em 1 minuto." },
        { status: 502 },
      );
    }

    // 2) URL de download DIRETO (a página /dl/<chave> é HTML com o link real).
    let directUrl = "";
    try {
      const landHtml = await (await fetch(pageUrl, { headers: { "User-Agent": "nossy-enviar/1.0" } })).text();
      const m = landHtml.match(/https:\/\/tmpfiles\.org\/dl\/[^"]+/);
      directUrl = m ? m[0] : "";
    } catch {
      /* o vigia extrai o link depois a partir da pageUrl */
    }

    // 3) Avisa o vigia (mesmo protocolo da rota admin — tipo idêntico).
    let notificado = false;
    try {
      const whRes = await fetch(deployConfig.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "nossy-enviar/1.0" },
        body: JSON.stringify({
          tipo: "vagas-g4-upload",
          arquivo: name,
          bytes: file.size,
          url_pagina: pageUrl,
          url_direta: directUrl,
          via: "publico-enviar",
          ts: Date.now(),
        }),
      });
      notificado = whRes.ok;
    } catch {
      /* o dono ainda vê o link na tela e pode colar no chat */
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
        "Arquivo recebido! O agente foi avisado automaticamente" +
        (notificado ? "" : " — copie o link abaixo e cole no chat") +
        ". Agora é só dizer no chat: 'enviei o arquivo'.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `Falha ao receber o arquivo: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import deployConfig from "@/config/deploy.json";

// NOSSY 0220 — Rota de TEXTO colado (Task 20-f).
// O dono manda as vagas "de 50 em 50" colando no chat — mas o cliente de chat
// transforma a colagem em anexo .txt, e anexos NUNCA chegam ao servidor
// (10 falhas). Aqui a colagem vai DIRETO para o site, sem chat no meio:
// texto -> arquivo Vagas_G4_parte-NNN.txt -> tmpfiles.org (~1h) -> webhook
// avisa o vigia -> agente baixa, junta as partes e publica.

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CHARS = 500_000; // ~500 KB de texto: várias centenas de vagas por parte

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { texto?: string }
      | null;
    const texto = (body?.texto || "").toString();

    if (texto.trim().length < 20) {
      return NextResponse.json(
        { ok: false, error: "Texto muito curto — cole o conteúdo das vagas (pelo menos algumas linhas)." },
        { status: 400 },
      );
    }
    if (texto.length > MAX_CHARS) {
      return NextResponse.json(
        { ok: false, error: `Texto muito grande (${texto.length.toLocaleString("pt-BR")} caracteres). Divida em mais partes.` },
        { status: 413 },
      );
    }

    // Nome determinístico e ordenado: Vagas_G4_parte-<timestamp>.txt
    const nome = `Vagas_G4_parte-${Date.now()}.txt`;
    const blob = new Blob([texto], { type: "text/plain" });
    const tf = new FormData();
    tf.append("file", blob, nome);

    const upRes = await fetch(deployConfig.tmpfilesApi, {
      method: "POST",
      body: tf,
      headers: { "User-Agent": "nossy-enviar-texto/1.0" },
    });
    const upJson = (await upRes.json().catch(() => null)) as
      | { status?: string; data?: { url?: string } }
      | null;
    const pageUrl = upJson?.data?.url;
    if (upJson?.status !== "success" || !pageUrl) {
      return NextResponse.json(
        { ok: false, error: "O servidor de transferência não aceitou o texto agora. Tente de novo em 1 minuto." },
        { status: 502 },
      );
    }

    let directUrl = "";
    try {
      const landHtml = await (await fetch(pageUrl, { headers: { "User-Agent": "nossy-enviar-texto/1.0" } })).text();
      const m = landHtml.match(/https:\/\/tmpfiles\.org\/dl\/[^"]+/);
      directUrl = m ? m[0] : "";
    } catch {
      /* o agente extrai o link depois a partir da pageUrl */
    }

    let notificado = false;
    try {
      const whRes = await fetch(deployConfig.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "nossy-enviar-texto/1.0" },
        body: JSON.stringify({
          tipo: "vagas-g4-upload",
          arquivo: nome,
          bytes: new TextEncoder().encode(texto).length,
          url_pagina: pageUrl,
          url_direta: directUrl,
          via: "texto-colidado",
          chars: texto.length,
          ts: Date.now(),
        }),
      });
      notificado = whRes.ok;
    } catch {
      /* o dono ainda vê o link na tela */
    }

    return NextResponse.json({
      ok: true,
      arquivo: nome,
      chars: texto.length,
      url_pagina: pageUrl,
      url_direta: directUrl || undefined,
      notificado,
      message:
        "TEXTO RECEBIDO! O agente foi avisado automaticamente" +
        (notificado ? "" : " — copie o link abaixo e cole no chat") +
        ". Diga no chat: 'recebeu a parte?' para confirmar e mande a próxima.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `Falha ao receber o texto: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 },
    );
  }
}

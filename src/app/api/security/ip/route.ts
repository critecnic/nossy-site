import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * NOSSY 0220 — Diagnóstico de IP (rota isenta do bloqueio).
 *
 * O dono acessa nossy.pro/api/security/ip de qualquer rede e vê qual é o
 * IP público dele. Esse IP é o que entra na whitelist (allowedIps em
 * src/config/security.json). A rota é isenta no middleware justamente para
 * que o dono nunca fique sem como descobrir o próprio IP — mesmo com o
 * bloqueio totalmente ativo.
 */
export function GET(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for") ?? "";
  const vercelIp = req.headers.get("x-vercel-forwarded-for") ?? "";
  const realIp = req.headers.get("x-real-ip") ?? "";
  const ip =
    xff.split(",")[0]?.trim() ||
    vercelIp.split(",")[0]?.trim() ||
    realIp.trim() ||
    "desconhecido";

  return NextResponse.json(
    {
      ip,
      instrucao:
        "Este e o IP publico da sua conexao atual. Envie-o para ser adicionado a lista de acesso do NOSSY (allowedIps).",
      observacao:
        "Se o seu IP mudar (reinicio do roteador, rede movel), use sua chave de acesso na URL: nossy.pro/?acesso=SUA_CHAVE",
      diagnostico: {
        xForwardedFor: xff || null,
        xVercelForwardedFor: vercelIp || null,
        xRealIp: realIp || null,
      },
    },
    { headers: { "cache-control": "no-store" } }
  );
}

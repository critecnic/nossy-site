import { NextRequest, NextResponse } from "next/server";
import securityConfig from "./config/security.json";

/**
 * NOSSY 0220 — Proteção por IP Whitelisting (Vercel Edge Middleware, serverless)
 *
 * Duas camadas independentes:
 *
 * CAMADA 1 — Agentes de IA / Admin (agentLockEnabled):
 *   /api/agent, /api/admin, /admin → apenas o IP do dono (allowedIps) ou a
 *   chave de acesso. Página e APIs públicas ficam 100% normais para visitantes.
 *   Mesmo liberado por IP/chave, essas rotas continuam exigindo o Bearer
 *   ADMIN_TOKEN que já possuem (proteção em profundidade).
 *
 * CAMADA 2 — Bloqueio total do site (lockEnabled, desligado por padrão):
 *   todo o site fica restrito ao dono. Se ligado, aplica as mesmas regras
 *   de acesso para TODAS as rotas não isentas.
 *
 * Fluxo de cada requisição:
 *   1. Rota isenta? (webhook Paddle, diagnóstico, estáticos)  -> passa
 *   2. IP local/dev?                                          -> passa
 *   3. Camada 1: rota de agente/admin e agentLockEnabled?     -> dono? passa : 403
 *   4. Camada 2: lockEnabled?                                 -> dono? passa : 403
 *
 * Regra de acesso do dono: chave de acesso (?acesso= / ?key= / header
 * x-nossy-key / cookie nossy_acesso de 7 dias) OU IP em allowedIps.
 *
 * Fonte única de configuração: src/config/security.json (lida no build).
 * Ativação/desativação = editar o JSON e fazer deploy (commit → Vercel).
 * Obs.: process.env NÃO é usado aqui — o Next inlinha env de middleware no
 * build, o que tornaria o override silenciosamente ineficaz em self-hosted.
 */

const ACCESS_COOKIE = "nossy_acesso";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

// Caminhos isentos: chamadas servidor-a-servidor (a Paddle não teria o IP do
// dono) e infraestrutura sem conteúdo de negócio. /api/webhook-0220 é o alias
// do rewrite no next.config — o middleware roda ANTES do rewrite, então o
// pathname chega ainda como o alias original.
const EXEMPT_PREFIXES = [
  "/api/webhook",        // webhook da Paddle (servidor-a-servidor)
  "/api/security/ip",    // diagnóstico: mostra o IP do visitante ao dono
  "/api/payment/health", // health check (sem dados de negócio)
  "/_next/",             // assets do framework
];
const EXEMPT_EXACT = ["/favicon.ico", "/robots.txt"];

// CAMADA 1 — rotas de agentes de IA e administração (restritas ao dono)
const AGENT_PREFIXES = ["/api/agent", "/api/admin", "/admin"];

const LOCK_PAGE = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex, nofollow"/>
<title>Acesso restrito — NOSSY</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#0b1220;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
  .card{max-width:560px;width:100%;background:#111a2e;border:1px solid #253352;border-radius:16px;padding:48px 40px;text-align:center}
  .badge{display:inline-block;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8fa3c4;border:1px solid #253352;border-radius:999px;padding:6px 18px;margin-bottom:26px}
  h1{font-size:24px;font-weight:700;color:#f8fafc;margin-bottom:14px}
  p{font-size:15px;line-height:1.65;color:#94a7c4;margin-bottom:10px}
  .code{margin-top:30px;font-size:12px;color:#5c6f8f;letter-spacing:1px}
</style>
</head>
<body>
<div class="card">
  <div class="badge">Acesso restrito</div>
  <h1>Área protegida</h1>
  <p>Este recurso é restrito aos endereços autorizados pelo proprietário do NOSSY.</p>
  <p>Se você é o proprietário, consulte seu IP em <strong>nossy.pro/api/security/ip</strong> ou utilize sua chave de acesso (?acesso=SUA_CHAVE).</p>
  <div class="code">NOSSY 0220 — PROTEÇÃO ATIVA</div>
</div>
</body>
</html>`;

function normalizeIp(raw: string): string {
  let ip = raw.trim().toLowerCase();
  // IPv6-mapped IPv4: ::ffff:203.0.113.7 -> 203.0.113.7
  if (ip.startsWith("::ffff:") && ip.includes(".")) {
    ip = ip.slice(7);
  }
  return ip;
}

function getClientIp(req: NextRequest): string | null {
  // Ordem: headers da PLATAFORMA primeiro (impossíveis de falsificar pelo
  // cliente) e x-forwarded-for por último.
  const sources = [
    req.headers.get("x-vercel-forwarded-for"),
    req.headers.get("x-forwarded-for"),
    req.headers.get("x-real-ip"),
  ];
  for (const source of sources) {
    if (!source) continue;
    const first = source.split(",")[0]?.trim();
    if (first) return normalizeIp(first);
  }
  return null;
}

function isLocalIp(ip: string): boolean {
  // Desenvolvimento local: nunca travar o próprio dev
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "localhost" ||
    ip === "" ||
    ip === "unknown"
  );
}

function isExempt(pathname: string): boolean {
  if (EXEMPT_EXACT.includes(pathname)) return true;
  return EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAgentPath(pathname: string): boolean {
  return AGENT_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function getWhitelist(): string[] {
  return (securityConfig.allowedIps as string[])
    .join(",")
    .split(",")
    .map((entry) => normalizeIp(entry))
    .filter(Boolean);
}

/**
 * Verifica se a requisição é do dono: chave de acesso (?acesso=, ?key=,
 * header x-nossy-key, cookie) ou IP na whitelist.
 * Retorna a resposta de passagem (com cookie gravado quando a chave veio por
 * query/header) ou null quando NÃO autorizado.
 */
function grantAccess(req: NextRequest, ip: string | null): NextResponse | null {
  const accessKey = securityConfig.accessKey || "";
  const provided =
    req.nextUrl.searchParams.get("acesso") ||
    req.nextUrl.searchParams.get("key") ||
    req.headers.get("x-nossy-key") ||
    req.cookies.get(ACCESS_COOKIE)?.value ||
    "";
  if (accessKey && provided && provided === accessKey) {
    const res = NextResponse.next();
    if (!req.cookies.get(ACCESS_COOKIE)) {
      res.cookies.set(ACCESS_COOKIE, accessKey, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    }
    return res;
  }

  if (ip && getWhitelist().includes(ip)) {
    return NextResponse.next();
  }
  return null;
}

function lockResponse(): NextResponse {
  return new NextResponse(LOCK_PAGE, {
    status: 403,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, must-revalidate",
    },
  });
}

export function middleware(req: NextRequest) {
  if (isExempt(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const ip = getClientIp(req);
  // ip null só acontece fora da Vercel (conexão direta local): libera o dev.
  // Na Vercel o x-forwarded-for é SEMPRE definido pela plataforma.
  if (!ip || isLocalIp(ip)) {
    return NextResponse.next();
  }

  // CAMADA 1 — agentes de IA / admin: restritos ao dono
  if (
    securityConfig.agentLockEnabled === true &&
    isAgentPath(req.nextUrl.pathname)
  ) {
    const granted = grantAccess(req, ip);
    if (!granted) return lockResponse();
    // Autorizado: segue para a rota, que ainda exige Bearer ADMIN_TOKEN
    if (!securityConfig.lockEnabled) return granted;
  }

  // CAMADA 2 — bloqueio total do site (opcional)
  if (securityConfig.lockEnabled !== true) {
    return NextResponse.next();
  }

  const granted = grantAccess(req, ip);
  if (!granted) return lockResponse();
  return granted;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

import { NextRequest, NextResponse } from "next/server";
import securityConfig from "./config/security.json";

/**
 * NOSSY 0220 — IP Whitelisting Serverless (Vercel Edge Middleware)
 *
 * Arquitetura: função serverless executada na borda da Vercel (Edge Network),
 * ANTES de qualquer renderização, cache ou API. Escala automática, sem servidor.
 *
 * Fluxo de cada requisição:
 *   1. Rota isenta? (webhook Paddle, diagnóstico, estáticos)  -> passa
 *   2. Bloqueio desligado (lockEnabled=false)?                 -> passa (modo normal)
 *   3. IP local/dev?                                           -> passa
 *   4. accessKey válida (?acesso= ou cookie) ?                 -> passa + cookie 7 dias
 *   5. IP está na whitelist?                                   -> passa
 *   6. Caso contrário                                          -> página 403 "Acesso restrito"
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
  <h1>Site em modo privado</h1>
  <p>O acesso ao NOSSY está temporariamente limitado aos endereços autorizados pelo proprietário.</p>
  <p>Se você é o proprietário, acesse <strong>nossy.pro/api/security/ip</strong> para consultar o seu IP atual e solicite a liberação, ou utilize sua chave de acesso na URL (?acesso=SUA_CHAVE).</p>
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

export function middleware(req: NextRequest) {
  if (isExempt(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const lockEnabled = securityConfig.lockEnabled === true;
  if (!lockEnabled) {
    return NextResponse.next();
  }

  const ip = getClientIp(req);
  // ip null só acontece fora da Vercel (conexão direta local): libera o dev.
  // Na Vercel o x-forwarded-for é SEMPRE definido pela plataforma.
  if (!ip || isLocalIp(ip)) {
    return NextResponse.next();
  }

  // Chave de acesso: permite ao dono navegar de qualquer lugar (celular, 4G,
  // IP dinâmico) sem depender de um IP fixo. Na primeira aceitação grava um
  // cookie httpOnly válido por 7 dias — não precisa repetir o ?acesso=.
  const accessKey = securityConfig.accessKey || "";
  const provided =
    req.nextUrl.searchParams.get("acesso") ||
    req.nextUrl.searchParams.get("key") ||
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

  // Whitelist de IPs (separada por vírgulas no JSON)
  const whitelistRaw = (securityConfig.allowedIps as string[]).join(",");
  const whitelist = whitelistRaw
    .split(",")
    .map((entry) => normalizeIp(entry))
    .filter(Boolean);
  if (ip && whitelist.includes(ip)) {
    return NextResponse.next();
  }

  return new NextResponse(LOCK_PAGE, {
    status: 403,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, must-revalidate",
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

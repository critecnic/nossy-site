import { NextRequest } from "next/server";
import { createHash, timingSafeEqual } from "crypto";

// ═══════════════════════════════════════════════════════════════════════
// NOSSY Security Helpers (server-only)
// Fixes: hardcoded admin token, SSRF via Host header, key material leaks
// ═══════════════════════════════════════════════════════════════════════

/**
 * Returns the configured ADMIN_TOKEN (server env only).
 * FAIL-CLOSED: if not configured or too weak, admin endpoints are disabled.
 * Minimum length 16 chars enforced.
 */
export function getAdminToken(): string | null {
  const t = process.env.ADMIN_TOKEN?.trim();
  if (!t || t.length < 16) return null;
  // Reject known public/default values that were leaked in the public repo
  if (t === "nossy-admin-2024") return null;
  return t;
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export interface AdminAuthResult {
  ok: boolean;
  status: number;
  error?: string;
}

/**
 * Constant-time admin authentication. Fail-closed:
 * - 503 if ADMIN_TOKEN is not configured server-side (with setup guidance)
 * - 401 for any invalid token
 */
export function checkAdminAuth(req: NextRequest | Request): AdminAuthResult {
  const token = getAdminToken();
  if (!token) {
    return {
      ok: false,
      status: 503,
      error:
        "Admin endpoints disabled: set a strong ADMIN_TOKEN environment variable (min 16 chars, never the old default).",
    };
  }
  const provided =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() || "";
  if (!provided || !safeEqual(provided, token)) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  return { ok: true, status: 200 };
}

// ─── SSRF protection: self base URL with host allowlist ────────────────
const ALLOWED_HOSTNAMES = new Set(
  [
    "nossy.pro",
    "www.nossy.pro",
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    process.env.VERCEL_URL,
  ].filter((h): h is string => Boolean(h))
);

/**
 * Builds the base URL for server-side self-calls using an ALLOWLIST of hosts.
 * Never trusts arbitrary Host headers (prevents SSRF).
 * Local development correctly falls back to http:// for localhost.
 */
export function getSelfBaseUrl(req: NextRequest | Request): string {
  const hostHeader = req.headers.get("host") || "nossy.pro";
  const hostname = hostHeader.split(":")[0].toLowerCase().trimEnd();

  if (!ALLOWED_HOSTNAMES.has(hostname)) {
    // Untrusted Host header → use the canonical production URL instead
    const fallback = process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
    return fallback && fallback.length > 0 ? fallback : "https://nossy.pro";
  }
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
  return `${isLocal ? "http" : "https"}://${hostHeader}`;
}

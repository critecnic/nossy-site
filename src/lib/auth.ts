import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Stateless authentication for NOSSY ("magic link" flow).
 *
 * 1. User types their email -> /api/send-code e-mails a 6-digit code AND a
 *    magic access link. Both are backed by HMAC-signed tokens (this module).
 * 2. User clicks the magic link -> /api/auth/magic validates the token and
 *    issues a signed session cookie (no database needed).
 * 3. The signed session cookie IS the authentication — works across
 *    isolated serverless functions (Vercel), verified with timing-safe HMAC.
 *
 * Token format:  base64url(email) + '.' + expiry + '.' + hmac(payload)
 * Secret reuse:  UNLOCK_SECRET || VERIFICATION_SECRET || PADDLE_WEBHOOK_SECRET
 */

const SECRET =
  process.env.UNLOCK_SECRET ||
  process.env.VERIFICATION_SECRET ||
  process.env.PADDLE_WEBHOOK_SECRET ||
  '';

export const SESSION_COOKIE = 'nossy_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const MAGIC_TOKEN_TTL = 60 * 10; // magic link valid for 10 minutes

export function hasAuthSecret(): boolean {
  return SECRET.length > 0;
}

function hmac(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('hex');
}

/**
 * Creates a signed token for an email.
 * ttlSeconds = MAGIC_TOKEN_TTL for magic links, SESSION_MAX_AGE for sessions.
 */
export function createAuthToken(email: string, ttlSeconds: number): string | null {
  if (!SECRET || !email) return null;
  const normalized = email.toLowerCase().trim();
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = Buffer.from(normalized, 'utf8').toString('base64url') + '.' + exp;
  return payload + '.' + hmac(payload);
}

/**
 * Constant-time verification of a session/magic token.
 * Returns { email } when valid and not expired, otherwise null.
 */
export function verifyAuthToken(token: string | undefined | null): { email: string } | null {
  if (!SECRET || !token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [emailB64, exp, sig] = parts;
  if (!/^[A-Za-z0-9_-]+$/.test(emailB64) || !/^\d+$/.test(exp) || !/^[0-9a-f]{64}$/.test(sig)) return null;
  const expSec = parseInt(exp, 10);
  if (!Number.isFinite(expSec) || expSec * 1000 < Date.now()) return null;
  try {
    const expected = hmac(emailB64 + '.' + exp);
    if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
    const email = Buffer.from(emailB64, 'base64url').toString('utf8');
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    return { email };
  } catch {
    return null;
  }
}

/** Reads a cookie value from a raw Cookie header. */
export function readCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return undefined;
}

/**
 * Validates a client-supplied redirect path (open-redirect protection):
 * must be a relative path starting with a single "/", no backslashes,
 * no protocol-relative "//", max 300 chars.
 */
export function sanitizeRedirectPath(raw: string | null | undefined): string {
  const path = String(raw || '/');
  if (
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.startsWith('/\\') &&
    !path.includes('\\') &&
    !path.includes(' ') &&
    path.length <= 300
  ) {
    return path;
  }
  return '/';
}

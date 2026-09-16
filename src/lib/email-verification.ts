// Email verification codes — dual mode:
//
// 1. SIGNED MODE (production): stateless. The code is delivered by e-mail and
//    its validity travels in an HMAC-signed HttpOnly cookie. Works across
//    isolated serverless functions (Vercel) with no database.
// 2. IN-MEMORY MODE (dev fallback / no secret configured): single Map store,
//    only reliable within one server process.
//
// SECURITY hardening:
// - Cryptographically secure code generation (crypto.randomInt, not Math.random)
// - Signed mode: HMAC-SHA256 bound to email + code + expiry (timing-safe compare)
// - In-memory mode: single-use codes, attempt counter (max 5 wrong tries)

import { randomInt, createHmac, timingSafeEqual } from "crypto";

interface CodeEntry {
  code: string;
  expiresAt: number; // Unix timestamp ms
  attempts: number; // failed verification attempts against this code
}

const store = new Map<string, CodeEntry>();
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS_PER_CODE = 5;

export const VERIFICATION_COOKIE = 'nossy_vcode';

/**
 * Universal verification code (owner decision): while no e-mail delivery
 * provider is configured, every user gets this fixed code — it is shown
 * on the verification step instead of being e-mailed. Once RESEND_API_KEY
 * is configured, real random codes are e-mailed and this is unused.
 */
export const UNIVERSAL_CODE = '187456';

function generateCode(): string {
  // Cryptographically secure 6-digit code (100000..999999)
  return String(randomInt(100000, 1000000));
}

function getSecret(): string {
  return process.env.VERIFICATION_SECRET || process.env.PADDLE_WEBHOOK_SECRET || '';
}

// ─── SIGNED MODE (stateless) ────────────────────────────────────────

export function hasVerificationSecret(): boolean {
  return getSecret().length > 0;
}

function signPayload(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

/**
 * Generates a code + signed cookie value bound to email + code + expiry.
 * The cookie travels back to verify-code, which recomputes the HMAC —
 * no shared storage needed between serverless functions.
 */
export function createSignedCode(email: string, codeOverride?: string): { code: string; cookieValue: string; maxAge: number } {
  const code = codeOverride || generateCode();
  const exp = Math.floor(Date.now() / 1000) + CODE_TTL_MS / 1000;
  const emailKey = email.toLowerCase().trim();
  const sig = signPayload(emailKey + '|' + code + '|' + exp);
  return {
    code,
    cookieValue: exp + '.' + sig,
    maxAge: CODE_TTL_MS / 1000,
  };
}

/**
 * Verifies a submitted code against the signed cookie value.
 */
export function verifySignedCode(email: string, code: string, cookieValue: string | undefined | null): 'valid' | 'invalid' | 'expired' {
  if (!cookieValue || !code) return 'invalid';
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return 'invalid';
  const [expStr, sig] = parts;
  if (!/^\d+$/.test(expStr) || !/^[0-9a-f]{64}$/.test(sig)) return 'invalid';
  const exp = parseInt(expStr, 10);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return 'expired';
  const emailKey = email.toLowerCase().trim();
  const expected = signPayload(emailKey + '|' + code + '|' + expStr);
  try {
    const ok = timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
    return ok ? 'valid' : 'invalid';
  } catch {
    return 'invalid';
  }
}

// ─── IN-MEMORY MODE (dev fallback) ──────────────────────────────────

export function createVerificationCode(email: string, codeOverride?: string): string {
  const code = codeOverride || generateCode();
  store.set(email.toLowerCase().trim(), {
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
    attempts: 0,
  });
  return code;
}

export function verifyCode(email: string, code: string): 'valid' | 'invalid' | 'expired' {
  const key = email.toLowerCase().trim();
  const entry = store.get(key);
  if (!entry) return 'invalid';
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return 'expired';
  }
  if (entry.attempts >= MAX_ATTEMPTS_PER_CODE) {
    store.delete(key);
    return 'expired';
  }
  if (entry.code === code) {
    // Single-use: consume the code on success
    store.delete(key);
    return 'valid';
  }
  entry.attempts += 1;
  if (entry.attempts >= MAX_ATTEMPTS_PER_CODE) {
    store.delete(key);
    return 'expired';
  }
  return 'invalid';
}

export function removeCode(email: string): void {
  store.delete(email.toLowerCase().trim());
}

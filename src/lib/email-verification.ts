// Email verification code storage (in-memory)
// SECURITY hardening:
// - Cryptographically secure code generation (crypto.randomInt, not Math.random)
// - Single-use codes (deleted immediately after successful verification)
// - Attempt counter per code (max 5 wrong tries, then code is invalidated)
// Production note: replace Map with Redis/DB for multi-instance consistency

import { randomInt } from "crypto";

interface CodeEntry {
  code: string;
  expiresAt: number; // Unix timestamp ms
  attempts: number; // failed verification attempts against this code
}

const store = new Map<string, CodeEntry>();
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS_PER_CODE = 5;

function generateCode(): string {
  // Cryptographically secure 6-digit code (100000..999999)
  return String(randomInt(100000, 1000000));
}

export function createVerificationCode(email: string): string {
  const code = generateCode();
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

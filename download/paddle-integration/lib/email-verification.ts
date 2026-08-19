// ============================================================// lib/email-verification.ts — Armazenamento e logica do codigo de 6 digitos// ============================================================

/** Dados de uma verificacao */
interface VerificationEntry {
  code: string;
  expiresAt: number; // timestamp em ms
  verified: boolean;
}

/**
 * Armazenamento em memoria dos codigos.
 * TODO para producao: substituir por Vercel KV (Redis) ou Upstash Redis.
 * Exemplo com Vercel KV:
 *   import { kv } from '@vercel/kv';
 *   await kv.set(`verify:${email}`, JSON.stringify(entry), { ex: 600 });
 */
const store = new Map<string, VerificationEntry>();

/** Tempo de expiracao do codigo: 10 minutos */
const CODE_TTL_MS = 10 * 60 * 1000;

/** Gera um codigo numerico de 6 digitos */
export function generateCode(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return String(digits);
}

/** Salva o codigo para o email informado */
export function storeCode(email: string, code: string): void {
  store.set(email.toLowerCase().trim(), {
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
    verified: false,
  });
}

/**
 * Verifica se o codigo bate e nao expirou.
 * Se valido, marca como verificado e retorna true.
 */
export function verifyCode(email: string, code: string): boolean {
  const entry = store.get(email.toLowerCase().trim());

  if (!entry) return false;
  if (entry.verified) return true; // ja verificado
  if (Date.now() > entry.expiresAt) {
    store.delete(email.toLowerCase().trim());
    return false; // expirado
  }
  if (entry.code !== code) return false;

  entry.verified = true;
  return true;
}

/** Verifica se o email ja foi autenticado (codigo validado) */
export function isEmailVerified(email: string): boolean {
  const entry = store.get(email.toLowerCase().trim());
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(email.toLowerCase().trim());
    return false;
  }
  return entry.verified;
}

/** Remove codigos expirados (chamado periodicamente) */
export function cleanupExpiredCodes(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) store.delete(key);
  }
}

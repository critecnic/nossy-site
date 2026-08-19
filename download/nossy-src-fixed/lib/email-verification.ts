// In-memory 6-digit email verification code storage
// Production: replace with Redis or DB

interface CodeEntry {
  code: string;
  expiresAt: number; // Unix timestamp ms
}

const store = new Map<string, CodeEntry>();
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function createVerificationCode(email: string): string {
  const code = generateCode();
  store.set(email.toLowerCase().trim(), {
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
  });
  return code;
}

export function verifyCode(email: string, code: string): 'valid' | 'invalid' | 'expired' {
  const entry = store.get(email.toLowerCase().trim());
  if (!entry) return 'invalid';
  if (Date.now() > entry.expiresAt) {
    store.delete(email.toLowerCase().trim());
    return 'expired';
  }
  return entry.code === code ? 'valid' : 'invalid';
}

export function removeCode(email: string): void {
  store.delete(email.toLowerCase().trim());
}
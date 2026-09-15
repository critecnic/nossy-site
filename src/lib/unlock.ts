import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Signed unlock cookie helpers.
 * When a payment is verified against the Paddle API, we issue an
 * HMAC-signed cookie bound to a specific jobId. No database needed:
 * the cookie itself is the proof of purchase (valid for 1 year).
 */

const SECRET =
  process.env.UNLOCK_SECRET || process.env.PADDLE_WEBHOOK_SECRET || '';

export const UNLOCK_COOKIE_PREFIX = 'wv_unlock_';
export const UNLOCK_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function unlockCookieName(jobId: number): string {
  return UNLOCK_COOKIE_PREFIX + jobId;
}

export function hasUnlockSecret(): boolean {
  return SECRET.length > 0;
}

/**
 * Returns the signed cookie value "jobId.expiry.signature", or null if
 * no secret is configured.
 */
export function signUnlock(jobId: number): string | null {
  if (!SECRET) return null;
  const exp = Math.floor(Date.now() / 1000) + UNLOCK_MAX_AGE;
  const payload = jobId + '.' + exp;
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
  return payload + '.' + sig;
}

/**
 * Constant-time verification of an unlock cookie for a given jobId.
 */
export function verifyUnlock(jobId: number, value: string | undefined | null): boolean {
  if (!SECRET || !value) return false;
  const parts = value.split('.');
  if (parts.length !== 3) return false;
  const [id, exp, sig] = parts;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(exp) || !/^[0-9a-f]{64}$/.test(sig)) return false;
  if (Number(id) !== Number(jobId)) return false;
  const expSec = parseInt(exp, 10);
  if (!Number.isFinite(expSec) || expSec * 1000 < Date.now()) return false;
  const expected = createHmac('sha256', SECRET).update(id + '.' + exp).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

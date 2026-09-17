import { NextResponse } from 'next/server';
import { isTransactionPaidForJob, findPaidTransaction, hasPaddleKey } from '@/lib/paddle';
import { signUnlock, unlockCookieName, signPremium, PREMIUM_COOKIE, UNLOCK_MAX_AGE } from '@/lib/unlock';
export const dynamic = 'force-dynamic';

/**
 * POST /api/payment/verify
 * Body: { jobId, txn?, email? }
 *
 * Verifies with the Paddle Billing API that a COMPLETED payment exists
 * (source of truth = Paddle itself, queried with the server secret key):
 *   1. Primary (guest flow): transaction id captured client-side before the
 *      overlay opened — no email needed. The card validation (expiry, funds,
 *      3DS) happens INSIDE the Paddle checkout; we only ever see the result
 *      (status completed/paid) — an unauthorized payment can never unlock.
 *   2. Legacy/restore: email + job match against the customer's history.
 *
 * On success the user status becomes "Premium": an HMAC-signed premium
 * cookie (unlocks ALL paywalled content for 1 year) is issued, plus the
 * per-job unlock cookie. No database required.
 */

// Simple in-memory rate limit (per serverless instance) — each call hits
// the Paddle API, so we keep it tight but generous for real retry loops.
const verifyHits = new Map<string, number[]>();
function verifyRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (verifyHits.get(ip) || []).filter(t => now - t < 60_000);
  arr.push(now);
  verifyHits.set(ip, arr);
  return arr.length > 30;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (verifyRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const { email, jobId, txn } = body || {};

    if (!hasPaddleKey()) {
      return NextResponse.json({ error: 'Payment system is being configured. Please try again later.' }, { status: 503 });
    }

    const txnId = typeof txn === 'string' && /^txn_[a-z0-9]+$/i.test(txn) ? txn : '';
    const emailOk = !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));

    if (!txnId && !emailOk) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const jobIdNum = Number(jobId);
    if (!Number.isInteger(jobIdNum) || jobIdNum <= 0 || jobIdNum > 1e9) {
      return NextResponse.json({ error: 'Invalid job' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      let paid = false;

        if (txnId) {
          paid = await isTransactionPaidForJob(txnId, jobIdNum, controller.signal);
        }
        if (!paid && emailOk) {
          const found = await findPaidTransaction(String(email), jobIdNum, controller.signal);
          paid = found.paid;
        }
        clearTimeout(timeout);

        if (!paid) {
          return NextResponse.json({ unlocked: false }, { status: 200 });
        }

        const cookieVal = signUnlock(jobIdNum);
        if (!cookieVal) {
          // Signing secret missing — do not unlock silently
          console.error('payment/verify: UNLOCK_SECRET / PADDLE_WEBHOOK_SECRET not configured');
          return NextResponse.json({ error: 'Unlock signing not configured' }, { status: 503 });
        }

        const res = NextResponse.json({ unlocked: true, premium: true });
        res.cookies.set(unlockCookieName(jobIdNum), cookieVal, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: UNLOCK_MAX_AGE,
          path: '/',
        });
        // User status -> Premium: unlocks all paywalled content
        const premiumVal = signPremium();
        if (premiumVal) {
          res.cookies.set(PREMIUM_COOKIE, premiumVal, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: UNLOCK_MAX_AGE,
            path: '/',
          });
        }
        return res;
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') return NextResponse.json({ error: 'Verification timeout' }, { status: 504 });
      console.error('payment/verify error:', err.message || 'Verification error');
      return NextResponse.json({ error: 'Verification error' }, { status: 500 });
    }
  } catch (err: any) {
    console.error('payment/verify fatal:', err.message);
    return NextResponse.json({ error: 'Verification error' }, { status: 500 });
  }
}

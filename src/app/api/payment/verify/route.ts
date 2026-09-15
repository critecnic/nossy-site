import { NextResponse } from 'next/server';
import { isTransactionPaidForJob, findPaidTransaction, hasPaddleKey } from '@/lib/paddle';
import { signUnlock, unlockCookieName, signPremium, PREMIUM_COOKIE, UNLOCK_MAX_AGE } from '@/lib/unlock';
export const dynamic = 'force-dynamic';

/**
 * POST /api/payment/verify
 * Body: { email, jobId, txn? }
 *
 * Verifies with the Paddle Billing API that a completed payment exists for
 * this email + job (directly by transaction id when available, otherwise by
 * matching the customer's completed transactions).
 *
 * On success the user status becomes "Premium": an HMAC-signed premium
 * cookie (unlocks ALL paywalled content for 1 year) is issued, plus the
 * legacy per-job unlock cookie. No database required.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, jobId, txn } = body || {};

    if (!hasPaddleKey()) {
      return NextResponse.json({ error: 'Payment system is being configured. Please try again later.' }, { status: 503 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const jobIdNum = Number(jobId);
    if (!Number.isInteger(jobIdNum) || jobIdNum <= 0 || jobIdNum > 1e9) {
      return NextResponse.json({ error: 'Invalid job' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      let paid = false;
      const txnId = typeof txn === 'string' && /^txn_[a-z0-9]+$/i.test(txn) ? txn : '';

        if (txnId) {
          paid = await isTransactionPaidForJob(txnId, jobIdNum, controller.signal);
        }
        if (!paid) {
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

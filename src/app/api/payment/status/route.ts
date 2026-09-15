import { NextResponse } from 'next/server';
import { verifyUnlock, unlockCookieName, verifyPremium, PREMIUM_COOKIE } from '@/lib/unlock';
import { verifyAuthToken, readCookieValue, SESSION_COOKIE } from '@/lib/auth';
import { findAnyPaidTransaction, hasPaddleKey } from '@/lib/paddle';
export const dynamic = 'force-dynamic';

/**
 * GET /api/payment/status?jobId=123
 *
 * Returns the unlock state for a job:
 * - { unlocked: true, premium: true }  -> valid premium cookie (all content)
 * - { unlocked: true, premium: false } -> valid per-job unlock cookie
 * - { unlocked: false, premium: false }
 *
 * Premium restore: when the visitor is authenticated (signed session cookie)
 * but has no premium cookie yet (e.g. bought on another device), the Paddle
 * Billing API is queried as the source of truth. If any completed payment
 * exists for that email, the premium cookie is (re-)issued on the spot.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const jobIdNum = Number(url.searchParams.get('jobId'));

  if (!Number.isInteger(jobIdNum) || jobIdNum <= 0 || jobIdNum > 1e9) {
    return NextResponse.json({ error: 'Invalid job' }, { status: 400 });
  }

  const cookieHeader = request.headers.get('cookie');

  // 1. Premium cookie -> user status "Premium", everything unlocked
  const premiumVal = readCookieValue(cookieHeader, PREMIUM_COOKIE);
  if (verifyPremium(premiumVal)) {
    return NextResponse.json({ unlocked: true, premium: true });
  }

  // 2. Per-job unlock cookie
  const jobVal = readCookieValue(cookieHeader, unlockCookieName(jobIdNum));
  if (verifyUnlock(jobIdNum, jobVal)) {
    return NextResponse.json({ unlocked: true, premium: false });
  }

  // 3. Authenticated user without premium cookie: ask Paddle whether this
  //    email has ANY completed payment (cross-device restore). Only do the
  //    network lookup when the API key is configured; never on cache-able
  //    responses (route is force-dynamic).
  const sessionVal = readCookieValue(cookieHeader, SESSION_COOKIE);
  const session = verifyAuthToken(sessionVal);
  if (session && hasPaddleKey()) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const found = await findAnyPaidTransaction(session.email, controller.signal);
      if (found.paid) {
        const { signPremium } = await import('@/lib/unlock');
        const fresh = signPremium();
        const res = NextResponse.json({ unlocked: true, premium: true });
        if (fresh) {
          res.cookies.set(PREMIUM_COOKIE, fresh, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
          });
        }
        return res;
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.error('payment/status: Paddle restore lookup timeout');
      } else {
        console.error('payment/status: Paddle restore lookup failed');
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  return NextResponse.json({ unlocked: false, premium: false });
}

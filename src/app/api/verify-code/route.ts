import { NextResponse } from 'next/server';
import { verifySignedChallenge, verifyCode, hasVerificationSecret, VERIFICATION_COOKIE } from '@/lib/email-verification';

const verifyAttempts: Record<string, number[]> = {};
const MAX_VERIFY_PER_MINUTE = 12;

function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'anon';
}

function isVerifyRateLimited(key: string): boolean {
  const now = Date.now();
  if (!verifyAttempts[key]) verifyAttempts[key] = [];
  verifyAttempts[key] = verifyAttempts[key].filter(t => now - t < 60000);
  if (verifyAttempts[key].length >= MAX_VERIFY_PER_MINUTE) return true;
  verifyAttempts[key].push(now);
  return false;
}

function readCookie(req: Request, name: string): string | undefined {
  const cookieHeader = req.headers.get('cookie') || '';
  for (const part of cookieHeader.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return rest.join('=');
  }
  return undefined;
}

// On-screen verification (owner decision): the user types the random
// numbers displayed on the page. The typed code is checked against the
// HMAC-signed challenge cookie — no email involved.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = String(body?.code || '').trim();
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ valid: false, error: 'Missing code' }, { status: 400 });
    }

    if (isVerifyRateLimited(clientKey(req))) {
      return NextResponse.json({ valid: false, error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    const cookieValue = readCookie(req, VERIFICATION_COOKIE);
    const result = cookieValue
      ? verifySignedChallenge(code, cookieValue)
      : (hasVerificationSecret() ? 'invalid' : verifyCode('local', code));

    if (result === 'valid') {
      const res = NextResponse.json({ valid: true });
      if (cookieValue) {
        // Consume the signed challenge (single-use)
        res.cookies.set(VERIFICATION_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 0, path: '/' });
      }
      return res;
    } else if (result === 'expired') {
      return NextResponse.json({ valid: 'expired' });
    } else {
      return NextResponse.json({ valid: false });
    }
  } catch {
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 });
  }
}

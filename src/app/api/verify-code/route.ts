import { NextResponse } from 'next/server';
import { verifyCode, verifySignedCode, VERIFICATION_COOKIE } from '@/lib/email-verification';
import { createAuthToken, hasAuthSecret, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth';

const verifyAttempts: Record<string, number[]> = {};
const MAX_VERIFY_PER_MINUTE = 10;

function isVerifyRateLimited(email: string): boolean {
  const now = Date.now();
  if (!verifyAttempts[email]) verifyAttempts[email] = [];
  verifyAttempts[email] = verifyAttempts[email].filter(t => now - t < 60000);
  if (verifyAttempts[email].length >= MAX_VERIFY_PER_MINUTE) return true;
  verifyAttempts[email].push(now);
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

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ valid: false, error: 'Missing fields' }, { status: 400 });
    }

    if (isVerifyRateLimited(String(email))) {
      return NextResponse.json({ valid: false, error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    const cookieValue = readCookie(req, VERIFICATION_COOKIE);
    const result = cookieValue
      ? verifySignedCode(String(email), String(code), cookieValue)
      : verifyCode(String(email), String(code));

    if (result === 'valid') {
      const res = NextResponse.json({ valid: true });
      if (cookieValue) {
        // Consume the signed verification (single-use)
        res.cookies.set(VERIFICATION_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 0, path: '/' });
      }
      // Authenticated on the site: the verified email becomes a signed
      // 30-day session (same result as clicking the magic link).
      if (hasAuthSecret()) {
        const session = createAuthToken(String(email), SESSION_MAX_AGE);
        if (session) {
          res.cookies.set(SESSION_COOKIE, session, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: SESSION_MAX_AGE,
            path: '/',
          });
        }
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

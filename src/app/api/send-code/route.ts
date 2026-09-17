import { NextResponse } from 'next/server';
import { createSignedChallenge, createVerificationCode, hasVerificationSecret, VERIFICATION_COOKIE } from '@/lib/email-verification';

// Simple in-memory rate limiting (per function instance)
const sendCodeAttempts: Record<string, number[]> = {};
// 12/min: o painel busca os números a cada abertura; com 6/min o usuário
// que reabria o quadro algumas vezes recebia 429 e ficava SEM números
// ("não avança" — bug reportado pelo dono).
const MAX_ATTEMPTS_PER_MINUTE = 12;

function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'anon';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  if (!sendCodeAttempts[key]) sendCodeAttempts[key] = [];
  sendCodeAttempts[key] = sendCodeAttempts[key].filter(t => now - t < 60000);
  if (sendCodeAttempts[key].length >= MAX_ATTEMPTS_PER_MINUTE) return true;
  sendCodeAttempts[key].push(now);
  return false;
}

// On-screen verification (owner decision): NO email is collected or sent.
// The server generates a RANDOM 6-digit code, the page displays it and the
// user must type it back manually to reach the payment step. Validity
// travels in an HMAC-signed HttpOnly cookie (stateless across serverless
// functions — no database).
export async function POST(req: Request) {
  try {
    if (isRateLimited(clientKey(req))) {
      return NextResponse.json({ success: false, error: 'Too many requests. Try again later.' }, { status: 429 });
    }

    if (process.env.NODE_ENV === 'production' && !hasVerificationSecret()) {
      console.error('send-code: VERIFICATION_SECRET (or PADDLE_WEBHOOK_SECRET) not configured');
      return NextResponse.json({ success: false, error: 'Verification service is being configured. Please try again later.' }, { status: 503 });
    }

    if (hasVerificationSecret()) {
      // SIGNED MODE (stateless): random code + HMAC-signed HttpOnly cookie.
      const challenge = createSignedChallenge();
      const res = NextResponse.json({ success: true, code: challenge.code });
      res.cookies.set(VERIFICATION_COOKIE, challenge.cookieValue, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: challenge.maxAge,
        path: '/',
      });
      return res;
    }

    // Dev fallback: in-memory store (single process only)
    const code = createVerificationCode('local');
    return NextResponse.json({ success: true, code });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

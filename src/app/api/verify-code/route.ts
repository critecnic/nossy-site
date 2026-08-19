
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

import { NextResponse } from 'next/server';
import { verifyCode } from '@/lib/email-verification';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ valid: false, error: 'Missing fields' }, { status: 400 });
    }

    if (isVerifyRateLimited(email)) {
      return NextResponse.json({ valid: false, error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    const result = verifyCode(email, code);

    if (result === 'valid') {
      return NextResponse.json({ valid: true });
    } else if (result === 'expired') {
      return NextResponse.json({ valid: 'expired' });
    } else {
      return NextResponse.json({ valid: false });
    }
  } catch {
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 });
  }
}

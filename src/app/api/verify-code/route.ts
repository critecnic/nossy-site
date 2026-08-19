import { NextResponse } from 'next/server';
import { verifyCode } from '@/lib/email-verification';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ valid: false, error: 'Missing fields' }, { status: 400 });
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

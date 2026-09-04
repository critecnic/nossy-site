
const checkoutAttempts: Record<string, number[]> = {};

function isCheckoutRateLimited(email: string): boolean {
  const now = Date.now();
  if (!checkoutAttempts[email]) checkoutAttempts[email] = [];
  checkoutAttempts[email] = checkoutAttempts[email].filter(t => now - t < 300000); // 5 min window
  if (checkoutAttempts[email].length >= 5) return true;
  checkoutAttempts[email].push(now);
  return false;
}

import { NextResponse } from 'next/server';
import { createPaddleCheckout } from '@/lib/paddle';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, jobId, jobTitle, lang } = body;

    if (isCheckoutRateLimited(email)) {
      return NextResponse.json({ error: 'Too many checkout attempts. Try again later.' }, { status: 429 });
    }

    if (!process.env.PADDLE_API_KEY) {
      return NextResponse.json({ error: 'Payment system is being configured. Please try again later.' }, { status: 503 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const langCode = lang || 'en';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const checkoutUrl = await createPaddleCheckout(email, jobId || 0, jobTitle || '', langCode);
      clearTimeout(timeout);

      if (checkoutUrl) return NextResponse.json({ url: checkoutUrl });
      return NextResponse.json({ error: 'Checkout error' }, { status: 400 });
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') return NextResponse.json({ error: 'Payment timeout' }, { status: 504 });
      const msg = err.message || 'Checkout error';
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  } catch (err: any) {
    if (err.name === 'AbortError') return NextResponse.json({ error: 'Payment timeout' }, { status: 504 });
    return NextResponse.json({ error: 'Checkout error' }, { status: 500 });
  }
}

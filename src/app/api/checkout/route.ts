import { NextResponse } from 'next/server';
import { createPaddleCheckout, hasPaddleKey } from '@/lib/paddle';

const checkoutAttempts: Record<string, number[]> = {};

function isCheckoutRateLimited(email: string): boolean {
  const now = Date.now();
  if (!checkoutAttempts[email]) checkoutAttempts[email] = [];
  checkoutAttempts[email] = checkoutAttempts[email].filter(t => now - t < 300000); // 5 min window
  if (checkoutAttempts[email].length >= 5) return true;
  checkoutAttempts[email].push(now);
  return false;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, jobId, jobTitle, lang, jobUrl } = body || {};

    if (!hasPaddleKey()) {
      return NextResponse.json({ error: 'Payment system is being configured. Please try again later.' }, { status: 503 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const jobIdNum = Number(jobId);
    if (!Number.isInteger(jobIdNum) || jobIdNum <= 0 || jobIdNum > 1e9) {
      return NextResponse.json({ error: 'Invalid job' }, { status: 400 });
    }

    if (isCheckoutRateLimited(String(email))) {
      return NextResponse.json({ error: 'Too many checkout attempts. Try again later.' }, { status: 429 });
    }

    const langCode = typeof lang === 'string' ? lang.slice(0, 10) : 'en';
    const jobTitleSafe = typeof jobTitle === 'string' ? jobTitle.slice(0, 200) : '';
    const jobUrlSafe = typeof jobUrl === 'string' && jobUrl.startsWith('/') && !jobUrl.startsWith('//')
      ? jobUrl.slice(0, 300)
      : undefined;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const { checkoutUrl } = await createPaddleCheckout(
        String(email),
        jobIdNum,
        jobTitleSafe,
        langCode,
        jobUrlSafe,
        controller.signal
      );
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

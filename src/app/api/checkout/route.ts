import { NextResponse } from 'next/server';

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nossy.com';

const PLANS: Record<string, { amount: number; name: string }> = {
  single: { amount: 299, name: 'Single Job Contact' },
  pack5: { amount: 999, name: '5 Job Contacts Pack' },
  pack10: { amount: 1799, name: '10 Job Contacts Pack' },
  unlimited: { amount: 4999, name: 'Unlimited Access (30 days)' },
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { plan, jobId, lang } = body;
    const pk = plan || 'single';
    const planCfg = PLANS[pk] || PLANS.single;
    const langCode = lang || 'en';
    const baseUrl = BASE_URL.replace(/\/$/, '');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': 'Basic ' + Buffer.from(STRIPE_SECRET + ':').toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'payment_method_types[0]': 'card',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][unit_amount]': String(planCfg.amount),
        'line_items[0][price_data][product_data][name]': planCfg.name,
        'line_items[0][quantity]': '1',
        'success_url': `${baseUrl}/${langCode}/jobs?payment=success`,
        'cancel_url': `${baseUrl}/${langCode}/jobs?payment=cancelled`,
        'metadata[plan]': pk,
        'metadata[jobId]': String(jobId || ''),
      }),
    });
    clearTimeout(timeout);

    const session = await res.json();
    if (session.url) return NextResponse.json({ url: session.url, sessionId: session.id });
    return NextResponse.json({ error: session.error?.message || 'Checkout error' }, { status: 400 });
  } catch (err: any) {
    if (err.name === 'AbortError') return NextResponse.json({ error: 'Stripe timeout' }, { status: 504 });
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 });
  }
}

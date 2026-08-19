import { NextResponse } from 'next/server';

const PADDLE_API_KEY = process.env.PADDLE_API_KEY || '';
const PADDLE_PRICE_ID = process.env.PADDLE_PRICE_ID || 'pri_01m0bhvecckh078qxexjwest9x';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nossy.pro';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, jobId, jobTitle, lang } = body;

    if (!PADDLE_API_KEY) {
      return NextResponse.json({ error: 'Payment system is being configured. Please try again later.' }, { status: 503 });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const langCode = lang || 'en';
    const baseUrl = BASE_URL.replace(/\/$/, '');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('https://vendor-api.paddle.com/transactions/create', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': 'Bearer ' + PADDLE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ price_id: PADDLE_PRICE_ID, quantity: 1 }],
        customer_email: email,
        custom_data: { jobId: String(jobId || ''), jobTitle: jobTitle || '', lang: langCode },
        checkout: {
          url: 'https://checkout.paddle.com/checkout/' + PADDLE_PRICE_ID,
          allowed_payment_methods: ['card'],
          mode: 'checkout',
          redirect_url: `${baseUrl}/${langCode}/jobs?payment=success`,
        },
      }),
    });
    clearTimeout(timeout);

    const data = await res.json() as any;
    const checkoutUrl = data?.data?.urls?.checkout?.url;

    if (checkoutUrl) return NextResponse.json({ url: checkoutUrl, txId: data?.data?.id });
    return NextResponse.json({ error: data?.error?.detail || 'Checkout error' }, { status: 400 });
  } catch (err: any) {
    if (err.name === 'AbortError') return NextResponse.json({ error: 'Payment timeout' }, { status: 504 });
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 });
  }
}

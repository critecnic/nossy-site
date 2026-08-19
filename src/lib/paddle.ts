// Paddle API helpers for server-side

const PADDLE_API_KEY = process.env.PADDLE_API_KEY || '';
const PADDLE_PRICE_ID = process.env.PADDLE_PRICE_ID || 'pri_01m0bhvecckh078qxexjwest9x';

const PADDLE_BASE = 'https://vendor-api.paddle.com';

export async function createPaddleCheckout(email: string, jobId: number, jobTitle: string, lang: string): Promise<string> {
  const res = await fetch(PADDLE_BASE + '/transactions/create', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + PADDLE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{ price_id: PADDLE_PRICE_ID, quantity: 1 }],
      customer_email: email,
      custom_data: { jobId: String(jobId), jobTitle, lang },
      checkout: {
        url: 'https://checkout.paddle.com/checkout/' + PADDLE_PRICE_ID,
        allowed_payment_methods: ['card'],
        mode: 'checkout',
        redirect_url: '',
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('Paddle API error: ' + res.status + ' ' + err);
  }

  const data = await res.json() as any;
  return data?.data?.urls?.checkout?.url || '';
}

export async function verifyPaddleWebhookSignature(body: string, signature: string): Promise<boolean> {
  if (!process.env.PADDLE_WEBHOOK_SECRET) {
    console.warn('PADDLE_WEBHOOK_SECRET not set');
    return false;
  }

  // Paddle uses HMAC-SHA256 for webhook signatures
  const crypto = await import('crypto');
  const hmac = crypto.createHmac('sha256', process.env.PADDLE_WEBHOOK_SECRET);
  hmac.update(body);
  const expected = hmac.digest('hex');

  // Paddle sends signature as hex
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}

export const PADDLE_CONFIG = {
  PRICE_ID: PADDLE_PRICE_ID,
  CURRENCY: 'USD',
  AMOUNT: 7,
} as const;

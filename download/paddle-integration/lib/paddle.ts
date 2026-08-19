// ============================================================// lib/paddle.ts — Paddle API helpers (Sandbox + Production)// ============================================================

const PADDLE_API_KEY = process.env.PADDLE_API_KEY!;
const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET!;
const PADDLE_PRICE_ID = process.env.PADDLE_PRICE_ID!;

/** Detecta ambiente sandbox vs producao */
const PADDLE_API_BASE =
  process.env.NODE_ENV === 'production'
    ? 'https://api.paddle.com'
    : 'https://sandbox-api.paddle.com';

/**
 * Cria uma transacao (checkout hospedado) no Paddle.
 * Retorna a URL de checkout para redirecionar o cliente.
 */
export async function createCheckout({
  email,
  jobId,
}: {
  email: string;
  jobId: string;
}): Promise<{ checkoutUrl: string; transactionId: string }> {
  const response = await fetch(`${PADDLE_API_BASE}/transactions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PADDLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{ price_id: PADDLE_PRICE_ID, quantity: 1 }],
      custom_data: { jobId },
      customer_email: email,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Paddle API error ${response.status}: ${errorText}`);
  }

  const json = await response.json();
  const data = json.data;

  // A URL de checkout pode estar em data.checkout.url ou data.checkout_url
  const checkoutUrl =
    data?.checkout?.url ||
    data?.checkout_url ||
    '';

  if (!checkoutUrl) {
    throw new Error(
      `Nao foi possivel obter a URL de checkout. Resposta: ${JSON.stringify(data)}`
    );
  }

  return {
    checkoutUrl,
    transactionId: data.id,
  };
}

/**
 * Verifica a assinatura do webhook do Paddle (HMAC-SHA256).
 * Header: paddle-signature  ->  ts={timestamp};h1={hash}
 */
export function verifyWebhookSignature({
  signature,
  body,
}: {
  signature: string;
  body: string;
}): boolean {
  try {
    const crypto = await import('crypto');

    // Parse: ts=1234567890;h1=abc123...
    const parts = signature.split(';');
    const timestamp = parts
      .find((p: string) => p.startsWith('ts='))
      ?.split('=')[1];
    const hash = parts
      .find((p: string) => p.startsWith('h1='))
      ?.split('=')[1];

    if (!timestamp || !hash) return false;

    const message = `${timestamp}:${body}`;
    const expectedHash = crypto
      .createHmac('sha256', PADDLE_WEBHOOK_SECRET)
      .update(message)
      .digest('hex');

    return hash === expectedHash;
  } catch {
    return false;
  }
}

/**
 * Tipo do payload do evento payment.paid
 */
export interface PaymentPaidEvent {
  event_id: string;
  event_type: 'payment.paid';
  occurred_at: string;
  data: {
    id: string;
    amount: string;
    currency: string;
    status: string;
    transaction_id: string;
    custom_data?: {
      jobId?: string;
      [key: string]: unknown;
    };
    customer?: {
      id: string;
      email: string;
    };
  };
}

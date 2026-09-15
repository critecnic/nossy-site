// Paddle Billing API helpers for server-side
// Docs: https://developer.paddle.com/api-reference/transactions/create-transaction
//
// PADDLE_ENV=sandbox  -> https://sandbox-api.paddle.com (test mode, default)
// PADDLE_ENV=live     -> https://api.paddle.com         (real money)

// Premium 0220 — configuration precedence:
//   1. Vercel environment variables (set automatically by GitHub Actions
//      workflow `.github/workflows/sync-vercel-env.yml`, or manually);
//   2. Nothing committed here: API keys must never live in this public repo
//      (GitHub Push Protection blocks them anyway).
// Default environment is sandbox until the live key is configured.
const PADDLE_ENV = (process.env.PADDLE_ENV || 'sandbox').toLowerCase();
const PADDLE_API_KEY = process.env.PADDLE_API_KEY || '';
const PADDLE_PRICE_ID = process.env.PADDLE_PRICE_ID || 'pri_01m0bhvecckh078qxexjwest9x';

/**
 * True when an effective API key is available (env var OR committed sandbox
 * default). Used by the API routes instead of reading process.env directly.
 */
export function hasPaddleKey(): boolean {
  return PADDLE_API_KEY.length > 0;
}

const PADDLE_BASE = PADDLE_ENV === 'sandbox'
  ? 'https://sandbox-api.paddle.com'
  : 'https://api.paddle.com';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://nossy.pro';

export const PADDLE_CONFIG = {
  ENV: PADDLE_ENV,
  PRICE_ID: PADDLE_PRICE_ID,
  CURRENCY: 'USD',
  AMOUNT: 7,
} as const;

interface CheckoutResult {
  checkoutUrl: string;
  transactionId: string;
}

function paddleHeaders(): Record<string, string> {
  return {
    'Authorization': 'Bearer ' + PADDLE_API_KEY,
    'Content-Type': 'application/json',
  };
}

/**
 * Creates a Paddle Billing checkout transaction for a $7 job unlock.
 * Uses `customer: { email }` (Billing style) so a customer is created or
 * matched automatically. Returns the hosted checkout URL + transaction id.
 */
export async function createPaddleCheckout(
  email: string,
  jobId: number,
  jobTitle: string,
  lang: string,
  jobUrl?: string,
  signal?: AbortSignal
): Promise<CheckoutResult> {
  if (!PADDLE_API_KEY) {
    throw new Error('PADDLE_API_KEY not configured');
  }

  const baseUrl = BASE_URL.replace(/\/$/, '');
  // Return to the job page itself when a job path is provided;
  // otherwise fall back to the jobs list.
  const successPath = jobUrl && jobUrl.startsWith('/')
    ? jobUrl + (jobUrl.includes('?') ? '&' : '?') + 'payment=success'
    : '/' + (lang || 'en') + '/jobs?payment=success';
  const successUrl = baseUrl + successPath;

  const res = await fetch(PADDLE_BASE + '/transactions', {
    method: 'POST',
    headers: paddleHeaders(),
    signal,
    body: JSON.stringify({
      items: [{ price_id: PADDLE_PRICE_ID, quantity: 1 }],
      customer: { email },
      custom_data: { jobId: String(jobId), jobTitle, lang },
      checkout: {
        settings: {
          success_url: successUrl,
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('Paddle API error: ' + res.status + ' ' + err);
  }

  const data = await res.json() as any;
  const checkoutUrl = data?.data?.urls?.checkout?.url || '';
  const transactionId = data?.data?.id || '';
  if (!checkoutUrl) {
    throw new Error('Paddle API did not return a checkout URL: ' + JSON.stringify(data).slice(0, 500));
  }
  return { checkoutUrl, transactionId };
}

/**
 * Read-only integration check (Premium 0220 diagnostic): verifies that the
 * API key works and that the configured price exists/active. Never returns
 * secret values. Used by /api/payment/health.
 */
export async function checkPaddleIntegration(): Promise<{
  ok: boolean;
  status?: number;
  code?: string;
  priceStatus?: string;
  amount?: string;
  currency?: string;
}> {
  if (!PADDLE_API_KEY) return { ok: false, code: 'no_api_key' };
  try {
    const res = await fetch(
      PADDLE_BASE + '/prices/' + encodeURIComponent(PADDLE_PRICE_ID),
      { headers: paddleHeaders(), signal: AbortSignal.timeout(6000) }
    );
    if (res.ok) {
      const data = await res.json() as any;
      const price = data?.data;
      const cents = Number(price?.unit_price?.amount || 0);
      return {
        ok: true,
        priceStatus: price?.status,
        amount: cents ? String(cents / 100) : undefined,
        currency: price?.unit_price?.currency_code,
      };
    }
    const body = await res.json().catch(() => ({}) as any);
    return { ok: false, status: res.status, code: body?.error?.code };
  } catch (err: any) {
    return { ok: false, code: err?.name === 'AbortError' ? 'timeout' : 'network_error' };
  }
}

/**
 * Checks whether a transaction id is a completed payment for the given job.
 */
export async function isTransactionPaidForJob(
  transactionId: string,
  jobId: number,
  signal?: AbortSignal
): Promise<boolean> {
  if (!PADDLE_API_KEY) return false;
  const res = await fetch(
    PADDLE_BASE + '/transactions/' + encodeURIComponent(transactionId),
    { headers: paddleHeaders(), signal }
  );
  if (!res.ok) return false;
  const data = await res.json() as any;
  const tx = data?.data;
  if (!tx) return false;
  const statusOk = tx.status === 'completed' || tx.status === 'paid';
  const txJobId = tx?.custom_data?.jobId;
  return statusOk && (String(txJobId) === String(jobId) || txJobId === undefined);
}

/**
 * Resolves the Paddle customer id for an email (or null when unknown).
 */
async function findCustomerId(email: string, signal?: AbortSignal): Promise<string | null> {
  const cRes = await fetch(
    PADDLE_BASE + '/customers?email=' + encodeURIComponent(email),
    { headers: paddleHeaders(), signal }
  );
  if (!cRes.ok) return null;
  const cData = await cRes.json() as any;
  return cData?.data?.[0]?.id || null;
}

/**
 * Looks for a completed transaction matching a customer email + jobId.
 * Used when no transaction id is available after the redirect.
 */
export async function findPaidTransaction(
  email: string,
  jobId: number,
  signal?: AbortSignal
): Promise<{ paid: boolean; transactionId?: string }> {
  if (!PADDLE_API_KEY) return { paid: false };

  const customerId = await findCustomerId(email, signal);
  if (!customerId) return { paid: false };

  const tRes = await fetch(
    PADDLE_BASE + '/transactions?customer_id=' + encodeURIComponent(customerId) +
    '&status=completed&per_page=25',
    { headers: paddleHeaders(), signal }
  );
  if (!tRes.ok) return { paid: false };
  const tData = await tRes.json() as any;
  const transactions: any[] = tData?.data || [];
  for (const tx of transactions) {
    if (String(tx?.custom_data?.jobId) === String(jobId)) {
      return { paid: true, transactionId: tx.id };
    }
  }
  return { paid: false };
}

/**
 * Looks for ANY completed transaction from a customer email.
 * Used to restore "Premium" status for authenticated users on a new
 * device: login with the same email -> Paddle confirms a past payment
 * -> premium cookie is re-issued. Paddle is the source of truth.
 */
export async function findAnyPaidTransaction(
  email: string,
  signal?: AbortSignal
): Promise<{ paid: boolean; transactionId?: string }> {
  if (!PADDLE_API_KEY) return { paid: false };

  const customerId = await findCustomerId(email, signal);
  if (!customerId) return { paid: false };

  const tRes = await fetch(
    PADDLE_BASE + '/transactions?customer_id=' + encodeURIComponent(customerId) +
    '&status=completed&per_page=5',
    { headers: paddleHeaders(), signal }
  );
  if (!tRes.ok) return { paid: false };
  const tData = await tRes.json() as any;
  const transactions: any[] = tData?.data || [];
  if (transactions.length > 0) {
    return { paid: true, transactionId: transactions[0].id };
  }
  return { paid: false };
}

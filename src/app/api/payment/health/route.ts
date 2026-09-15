import { NextResponse } from 'next/server';
import { checkPaddleIntegration, hasPaddleKey, PADDLE_CONFIG } from '@/lib/paddle';
export const dynamic = 'force-dynamic';

/**
 * GET /api/payment/health
 * Integration diagnostic — reports which pieces of the payment/auth
 * pipeline are configured. NEVER returns secret values, only booleans
 * plus a read-only Paddle API check (key validity + price status).
 * Use it to confirm the Paddle integration is wired up in production:
 *   curl https://nossy.pro/api/payment/health
 */
export async function GET() {
  // Single source of truth: PADDLE_CONFIG (env var or committed sandbox default)
  const paddleEnv = PADDLE_CONFIG.ENV;
  const apiUrl = paddleEnv === 'sandbox' ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';

  // Live check (read-only): key validity + price exists/active
  let paddleApi: Awaited<ReturnType<typeof checkPaddleIntegration>> = { ok: false, code: 'skipped' };
  try {
    paddleApi = await checkPaddleIntegration();
  } catch { /* report as not ok */ }

  return NextResponse.json({
    ok: true,
    paddle: {
      env: paddleEnv,
      apiUrl: apiUrl,
      // Effective configuration: env vars override committed sandbox defaults
      apiKeyConfigured: hasPaddleKey(),
      priceIdConfigured: Boolean(PADDLE_CONFIG.PRICE_ID),
      webhookSecretConfigured: Boolean(process.env.PADDLE_WEBHOOK_SECRET),
      api: paddleApi,
    },
    unlock: {
      unlockSecretConfigured: Boolean(process.env.UNLOCK_SECRET || process.env.PADDLE_WEBHOOK_SECRET),
    },
    auth: {
      verificationSecretConfigured: Boolean(
        process.env.VERIFICATION_SECRET || process.env.PADDLE_WEBHOOK_SECRET
      ),
      emailDeliveryConfigured: Boolean(process.env.RESEND_API_KEY),
    },
    webhookUrl: (process.env.NEXT_PUBLIC_BASE_URL || 'https://nossy.pro').replace(/\/$/, '') + '/api/webhook',
  });
}

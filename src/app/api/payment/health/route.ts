import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

/**
 * GET /api/payment/health
 * Integration diagnostic — reports which pieces of the payment/auth
 * pipeline are configured. NEVER returns secret values, only booleans.
 * Use it to confirm the Paddle integration is wired up in production:
 *   curl https://nossy.pro/api/payment/health
 */
export async function GET() {
  const paddleEnv = (process.env.PADDLE_ENV || 'live').toLowerCase();
  return NextResponse.json({
    ok: true,
    paddle: {
      env: paddleEnv,
      apiUrl: paddleEnv === 'sandbox' ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com',
      apiKeyConfigured: Boolean(process.env.PADDLE_API_KEY),
      priceIdConfigured: Boolean(process.env.PADDLE_PRICE_ID),
      webhookSecretConfigured: Boolean(process.env.PADDLE_WEBHOOK_SECRET),
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

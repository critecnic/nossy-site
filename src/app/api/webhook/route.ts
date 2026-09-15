import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get('paddle-signature') || '';
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || '';

    // SECURITY: Reject if webhook secret is not configured
    if (!webhookSecret) {
      console.error('PADDLE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }
    if (!sig) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Paddle sends signature as: ts=...;h1=...
    const elements = sig.split(';');
    let ts = '';
    let h1 = '';
    for (const el of elements) {
      const [key, value] = el.split('=');
      if (key === 'ts') ts = value;
      if (key === 'h1') h1 = value;
    }

    if (!ts || !h1) {
      return NextResponse.json({ error: 'Invalid signature format' }, { status: 400 });
    }

    const signedPayload = ts + ':' + body;
    const expectedSig = createHmac('sha256', webhookSecret).update(signedPayload).digest('hex');

    try {
      if (!timingSafeEqual(Buffer.from(h1, 'hex'), Buffer.from(expectedSig, 'hex'))) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Signature mismatch' }, { status: 400 });
    }

    // SECURITY: anti-replay — reject events older than 5 minutes
    // (signature is valid, but the timestamp must be fresh)
    const tsMs = parseInt(ts, 10) * 1000;
    if (!Number.isFinite(tsMs) || Math.abs(Date.now() - tsMs) > 5 * 60 * 1000) {
      console.error('Paddle webhook: stale or invalid timestamp (possible replay)');
      return NextResponse.json({ error: 'Stale timestamp' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event_type || event.eventType || '';
    console.log('Paddle event:', eventType);

    if (eventType === 'transaction.completed' || eventType === 'transaction.paid') {
      const tx = event.data;
      const customData = tx?.custom_data || {};
      const email = tx?.customer?.email || customData?.email || 'unknown';
      // SERVER-SIDE PAYMENT CONFIRMATION ("Webhook Seguro").
      // The unlock itself is stateless: when the buyer returns to the site
      // (success_url redirect), POST /api/payment/verify confirms the
      // payment against the Paddle Billing API and upgrades the user to
      // "Premium" via an HMAC-signed cookie. Authenticated users are also
      // upgraded automatically by /api/payment/status (Paddle lookup).
      console.log('Payment approved:', tx?.id, 'buyer:', email, 'job:', customData?.jobId, '-> user eligible for Premium status');
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 400 });
  }
}

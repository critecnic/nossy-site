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

    const event = JSON.parse(body);
    const eventType = event.event_type || event.eventType || '';
    console.log('Paddle event:', eventType);

    if (eventType === 'transaction.completed' || eventType === 'transaction.paid') {
      const tx = event.data;
      const customData = tx?.custom_data || {};
      console.log('Payment success:', tx?.id, customData);
      // TODO: Store unlocked jobs in database
      // customData.jobId = '12345'
      // customData.jobTitle = 'Senior Engineer'
      // customData.lang = 'en'
      // tx.customer_email = 'user@example.com'
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    // When webhook secret is not set, just acknowledge receipt
    if (!webhookSecret || !sig) {
      console.log('Webhook received (no verification):', body.slice(0, 200));
      return NextResponse.json({ received: true });
    }

    // Verify Stripe webhook signature
    const elements = sig.split(',');
    let sigTimestamp = '';
    let sigSignature = '';
    for (const element of elements) {
      const [key, value] = element.split('=');
      if (key === 't') sigTimestamp = value;
      if (key === 'v1') sigSignature = value;
    }

    if (!sigTimestamp || !sigSignature) {
      return NextResponse.json({ error: 'Invalid signature format' }, { status: 400 });
    }

    const signedPayload = `${sigTimestamp}.${body}`;
    const expectedSig = createHmac('sha256', webhookSecret).update(signedPayload).digest('hex');

    if (!timingSafeEqual(Buffer.from(sigSignature), Buffer.from(expectedSig))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('Stripe event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object;
      console.log('Payment success:', session?.id, session?.metadata);
      // TODO: Store unlocked jobs in database, send confirmation email, etc.
      // session.metadata.plan = 'single' | 'pack5' | 'pack10' | 'lifetime'
      // session.metadata.jobId = '12345'
      // session.amount_total = 8990 (cents)
      // session.currency = 'brl'
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

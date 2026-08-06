import { NextResponse } from 'next/server';

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

    // In production: verify signature with crypto module
    // const payload = sig + '.' + body;
    // const expectedSig = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');

    const event = JSON.parse(body);
    console.log('Stripe event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object;
      console.log('Payment success:', session?.id, session?.metadata);
      // Store unlocked jobs, send confirmation, etc.
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

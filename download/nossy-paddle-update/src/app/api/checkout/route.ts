// ============================================================
// src/app/api/checkout/route.ts — Cria checkout Paddle ($7 USD)
// So funciona se o email foi verificado (codigo 6 digitos)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createCheckout } from '@/lib/paddle';
import { isEmailVerified, cleanupExpiredCodes } from '@/lib/email-verification';

export async function POST(request: NextRequest) {
  try {
    const { email, jobId } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email e obrigatorio.' }, { status: 400 });
    }

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json({ error: 'ID da vaga e obrigatorio.' }, { status: 400 });
    }

    cleanupExpiredCodes();

    const verified = isEmailVerified(email);
    if (!verified) {
      return NextResponse.json(
        { error: 'Email nao verificado. Faca a autenticacao primeiro.' },
        { status: 403 }
      );
    }

    const { checkoutUrl, transactionId } = await createCheckout({ email, jobId });

    return NextResponse.json({
      success: true,
      checkoutUrl,
      transactionId,
    });
  } catch (error) {
    console.error('Erro em checkout:', error);
    const message = error instanceof Error ? error.message : 'Erro ao criar checkout.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

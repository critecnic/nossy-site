// ============================================================
// app/api/webhook/route.ts — Recebe webhook payment.paid do Paddle
// Verifica assinatura e desbloqueia os dados de contato da vaga
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, type PaymentPaidEvent } from '@/lib/paddle';

/**
 * Funcao para desbloquear os dados de contato de uma vaga.
 * Substitua esta logica pela sua implementacao real
 * (atualizar o banco de dados, etc.).
 */
async function unlockJobContact(jobId: string, email: string): Promise<void> {
  // ========================================================
  // TODO: Substituir pela logica real do nossy.pro
  // Exemplo com Prisma:
  //   await prisma.job.update({
  //     where: { id: jobId },
  //     data: { unlockedBy: email, unlockedAt: new Date() },
  //   });
  // ========================================================
  console.log(`
  === DESBLOQUEIO ===
  Vaga: ${jobId}
  Email: ${email}
  ====================
  `);
}

export async function POST(request: NextRequest) {
  try {
    // --- Obter e verificar assinatura ---
    const signature = request.headers.get('paddle-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Assinatura ausente.' },
        { status: 401 }
      );
    }

    // O corpo precisa ser lido como texto para verificacao HMAC
    const rawBody = await request.text();

    const isValid = verifyWebhookSignature({
      signature,
      body: rawBody,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Assinatura invalida.' },
        { status: 401 }
      );
    }

    // --- Parsear o evento ---
    const event: PaymentPaidEvent = JSON.parse(rawBody);

    // So processar payment.paid
    if (event.event_type !== 'payment.paid') {
      return NextResponse.json({ received: true });
    }

    const { data } = event;
    const jobId = data.custom_data?.jobId;
    const email = data.customer?.email;

    if (!jobId) {
      console.error('Webhook recebido sem jobId no custom_data:', event.event_id);
      return NextResponse.json({ received: true });
    }

    if (!email) {
      console.error('Webhook recebido sem email do cliente:', event.event_id);
      return NextResponse.json({ received: true });
    }

    // --- Desbloquear os dados de contato ---
    await unlockJobContact(jobId, email);

    console.log(`Pagamento confirmado: ${data.amount} ${data.currency} | Vaga: ${jobId} | Email: ${email}`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno.' },
      { status: 500 }
    );
  }
}

// ============================================================// app/api/send-code/route.ts — Envia codigo de 6 digitos por email// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateCode, storeCode, cleanupExpiredCodes } from '@/lib/email-verification';

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL!;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // --- Validacao do email ---
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email e obrigatorio.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email invalido.' },
        { status: 400 }
      );
    }

    // Limpa codigos expirados
    cleanupExpiredCodes();

    // --- Gerar e armazenar o codigo ---
    const code = generateCode();
    storeCode(email, code);

    // --- Enviar email via Resend ---
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [email],
        subject: 'Seu codigo de acesso - nossy.pro',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
            <div style="background: #0f172a; border-radius: 12px; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0 0 8px; font-size: 22px;">nossy.pro</h1>
              <p style="color: #94a3b8; margin: 0 0 24px; font-size: 14px;">Codigo de verificacao</p>
              <div style="background: #1e293b; border-radius: 8px; padding: 16px 24px; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; color: #22c55e; letter-spacing: 8px;">${code}</span>
              </div>
              <p style="color: #64748b; margin: 24px 0 0; font-size: 13px;">Este codigo expira em 10 minutos.</p>
              <p style="color: #475569; margin: 8px 0 0; font-size: 12px;">Se voce nao solicitou, ignore este email.</p>
            </div>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error('Erro ao enviar email via Resend:', error);
      return NextResponse.json(
        { error: 'Falha ao enviar o email. Tente novamente.' },
        { status: 500 }
      );
    }

    // Mascara o email para exibicao (ex: u***@gmail.com)
    const [user, domain] = email.split('@');
    const maskedEmail =
      user[0] + '***' + user.slice(-1) + '@' + domain;

    return NextResponse.json({
      success: true,
      message: `Codigo enviado para ${maskedEmail}`,
      maskedEmail,
    });
  } catch (error) {
    console.error('Erro em send-code:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

// ============================================================
// src/app/api/verify-code/route.ts — Valida o codigo de 6 digitos
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyCode, cleanupExpiredCodes } from '@/lib/email-verification';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email e obrigatorio.' }, { status: 400 });
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Codigo e obrigatorio.' }, { status: 400 });
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'O codigo deve conter exatamente 6 digitos.' }, { status: 400 });
    }

    cleanupExpiredCodes();

    const isValid = verifyCode(email, code);

    if (!isValid) {
      return NextResponse.json({ error: 'Codigo invalido ou expirado.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email verificado com sucesso.',
    });
  } catch (error) {
    console.error('Erro em verify-code:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

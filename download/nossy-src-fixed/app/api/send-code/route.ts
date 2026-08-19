
// Simple in-memory rate limiting
const sendCodeAttempts: Record<string, number[]> = {};
const MAX_ATTEMPTS_PER_MINUTE = 3;

function isRateLimited(email: string): boolean {
  const now = Date.now();
  if (!sendCodeAttempts[email]) sendCodeAttempts[email] = [];
  sendCodeAttempts[email] = sendCodeAttempts[email].filter(t => now - t < 60000);
  if (sendCodeAttempts[email].length >= MAX_ATTEMPTS_PER_MINUTE) return true;
  sendCodeAttempts[email].push(now);
  return false;
}

import { NextResponse } from 'next/server';
import { createVerificationCode } from '@/lib/email-verification';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    if (isRateLimited(email)) {
      return NextResponse.json({ success: false, error: 'Too many requests. Try again later.' }, { status: 429 });
    }

    const code = createVerificationCode(email);

    // Send email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@nossy.pro';

    if (resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + resendApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [email],
            subject: 'NOSSY - Verification Code',
            html: `
              <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0ea5e9;">NOSSY</h2>
                <p>Your verification code is:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b; text-align: center; padding: 16px; background: #f1f5f9; border-radius: 12px; margin: 16px 0;">${code}</div>
                <p style="color: #64748b; font-size: 14px;">This code expires in 10 minutes.</p>
              </div>
            `,
          }),
        });
        if (!res.ok) {
          console.error('Resend API error:', await res.text());
        }
      } catch (e) {
        console.error('Failed to send email:', e);
      }
    } else {
      // Dev mode: log code to console
      console.log('[DEV] Verification code for ' + email + ': ' + code);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

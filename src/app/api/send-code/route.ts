
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
              <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #0ea5e9; font-size: 32px; font-weight: 800; letter-spacing: 4px; margin: 0;">NOSSY</h1>
                  <p style="color: #94a3b8; font-size: 13px; font-style: italic; margin: 4px 0 0;">Seek and you shall find.</p>
                </div>
                <div style="background: white; border-radius: 12px; padding: 24px; text-align: center;">
                  <p style="color: #475569; font-size: 15px; margin: 0 0 16px;">Your verification code is:</p>
                  <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #0f172a; text-align: center; padding: 20px; background: #f1f5f9; border-radius: 12px; margin: 0 0 16px;">${code}</div>
                  <p style="color: #64748b; font-size: 13px; margin: 0;">This code expires in 10 minutes.</p>
                </div>
                <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 NOSSY · <a href="mailto:Cristecnic@outlook.com" style="color: #0ea5e9;">Cristecnic@outlook.com</a></p>
                </div>
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

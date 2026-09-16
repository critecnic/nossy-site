import { NextResponse } from 'next/server';
import { createSignedCode, createVerificationCode, hasVerificationSecret, UNIVERSAL_CODE } from '@/lib/email-verification';
import { createAuthToken, hasAuthSecret, sanitizeRedirectPath, MAGIC_TOKEN_TTL } from '@/lib/auth';

// Simple in-memory rate limiting (per function instance)
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

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://nossy.pro').replace(/\/$/, '');

export async function POST(req: Request) {
  try {
    const { email, jobUrl } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    if (isRateLimited(String(email))) {
      return NextResponse.json({ success: false, error: 'Too many requests. Try again later.' }, { status: 429 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@nossy.pro';
    const emailKey = String(email).toLowerCase().trim();

    // The magic link points back at the page the user came from
    // (open-redirect protected) so they land there already authenticated.
    const redirectPath = sanitizeRedirectPath(typeof jobUrl === 'string' ? jobUrl : '/');
    let magicToken: string | null = null;
    if (hasAuthSecret()) {
      magicToken = createAuthToken(emailKey, MAGIC_TOKEN_TTL);
    }

    // The verification pipeline always works: with an e-mail provider the
    // code is e-mailed (random); without one, the universal code is used and
    // shown on the verification step (owner decision) so the flow still
    // completes. Only a missing signing secret in production blocks it.
    if (process.env.NODE_ENV === 'production' && !hasVerificationSecret()) {
      console.error('send-code: VERIFICATION_SECRET (or PADDLE_WEBHOOK_SECRET) not configured');
      return NextResponse.json({ success: false, error: 'Email service is being configured. Please try again later.' }, { status: 503 });
    }

    let code: string;
    let res: NextResponse;

    if (hasVerificationSecret()) {
      // SIGNED MODE (stateless): validity travels in an HMAC-signed
      // HttpOnly cookie — works across isolated serverless functions.
      const signed = createSignedCode(String(email), resendApiKey ? undefined : UNIVERSAL_CODE);
      code = signed.code;
      res = NextResponse.json({
        success: true,
        emailConfigured: Boolean(resendApiKey),
        ...(resendApiKey ? {} : { code: UNIVERSAL_CODE }),
      });
      res.cookies.set('nossy_vcode', signed.cookieValue, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: signed.maxAge,
        path: '/',
      });
    } else {
      // Dev fallback: in-memory store (single process only)
      code = createVerificationCode(String(email), resendApiKey ? undefined : UNIVERSAL_CODE);
      res = NextResponse.json({ success: true, emailConfigured: false, code: UNIVERSAL_CODE });
    }

    // Dev convenience: expose the code + magic link ONLY outside production
    // and only when e-mail delivery is not configured, so the full flow
    // can be tested locally / before wiring Resend.
    const devMode = process.env.NODE_ENV !== 'production' && !resendApiKey;
    if (devMode) {
      console.log('[DEV] Verification code for ' + email + ': ' + code);
      res = NextResponse.json({
        success: true,
        emailConfigured: false,
        code: UNIVERSAL_CODE,
        devCode: code,
        devMagicLink: magicToken
          ? BASE_URL + '/api/auth/magic?token=' + magicToken + '&redirect=' + encodeURIComponent(redirectPath)
          : null,
      });
    }

    // Send email via Resend: 6-digit code + magic access link (both work)
    if (resendApiKey) {
      const magicUrl = magicToken
        ? BASE_URL + '/api/auth/magic?token=' + magicToken + '&redirect=' + encodeURIComponent(redirectPath)
        : null;
      try {
        const sendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + resendApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [email],
            subject: 'NOSSY - Your access link',
            html: `
              <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #0ea5e9; font-size: 32px; font-weight: 800; letter-spacing: 4px; margin: 0;">NOSSY</h1>
                  <p style="color: #94a3b8; font-size: 13px; font-style: italic; margin: 4px 0 0;">Seek and you shall find.</p>
                </div>
                <div style="background: white; border-radius: 12px; padding: 24px; text-align: center;">
                  <p style="color: #475569; font-size: 15px; margin: 0 0 16px;">Click the button below to access your account:</p>
                  ${magicUrl ? `
                  <a href="${magicUrl}" style="display: inline-block; background: linear-gradient(90deg, #0ea5e9, #2563eb); color: #ffffff; font-size: 16px; font-weight: bold; padding: 14px 32px; border-radius: 12px; text-decoration: none; margin: 0 0 20px;">Access NOSSY &#8594;</a>
                  <p style="color: #94a3b8; font-size: 12px; margin: 0 0 24px;">This link expires in 10 minutes and can only be used once.</p>
                  ` : ''}
                  <div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
                    <p style="color: #64748b; font-size: 13px; margin: 0 0 8px;">Or enter this verification code manually:</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #0f172a; text-align: center; padding: 16px; background: #f1f5f9; border-radius: 12px; margin: 0 0 8px;">${code}</div>
                    <p style="color: #64748b; font-size: 13px; margin: 0;">This code expires in 10 minutes.</p>
                  </div>
                </div>
                <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 NOSSY · <a href="mailto:CRITECNIC@OUTLOOK.COM" style="color: #0ea5e9;">CRITECNIC@OUTLOOK.COM</a></p>
                </div>
              </div>
            `,
          }),
        });
        if (!sendRes.ok) {
          console.error('Resend API error:', await sendRes.text());
          return NextResponse.json({ success: false, error: 'Could not send the verification email. Please try again.' }, { status: 502 });
        }
      } catch (e) {
        console.error('Failed to send email:', e);
        return NextResponse.json({ success: false, error: 'Could not send the verification email. Please try again.' }, { status: 502 });
      }
    }

    return res;
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

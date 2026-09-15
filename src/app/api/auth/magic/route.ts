import { NextResponse } from 'next/server';
import {
  verifyAuthToken,
  createAuthToken,
  sanitizeRedirectPath,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from '@/lib/auth';
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/magic?token=...&redirect=/en/jobs/...
 *
 * Magic-link landing endpoint (target of the e-mail button).
 * Validates the signed token, issues a 30-day signed session cookie and
 * redirects the user back to where they started, now authenticated.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const redirectTo = sanitizeRedirectPath(url.searchParams.get('redirect'));

  const decoded = verifyAuthToken(token);
  if (!decoded) {
    // Invalid/expired link -> send back with a visible failure flag
    const sep = redirectTo.includes('?') ? '&' : '?';
    return NextResponse.redirect(new URL(redirectTo + sep + 'auth=failed', url.origin), 302);
  }

  const session = createAuthToken(decoded.email, SESSION_MAX_AGE);
  if (!session) {
    console.error('auth/magic: signing secret not configured');
    const sep = redirectTo.includes('?') ? '&' : '?';
    return NextResponse.redirect(new URL(redirectTo + sep + 'auth=failed', url.origin), 302);
  }

  const sep = redirectTo.includes('?') ? '&' : '?';
  const res = NextResponse.redirect(new URL(redirectTo + sep + 'auth=success', url.origin), 302);
  res.cookies.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  return res;
}

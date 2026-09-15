import { NextResponse } from 'next/server';
import { verifyAuthToken, readCookieValue, SESSION_COOKIE } from '@/lib/auth';
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/session
 * Returns the current authentication state derived from the signed
 * session cookie: { authenticated: boolean, email?: string }.
 * The email is only ever returned to the browser that owns the cookie.
 */
export async function GET(request: Request) {
  const value = readCookieValue(request.headers.get('cookie'), SESSION_COOKIE);
  const decoded = verifyAuthToken(value);
  if (decoded) {
    return NextResponse.json({ authenticated: true, email: decoded.email });
  }
  return NextResponse.json({ authenticated: false });
}

/**
 * POST /api/auth/logout — clears the session cookie.
 */
export async function POST() {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return res;
}

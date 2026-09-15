import { NextResponse } from 'next/server';
import { verifyUnlock, unlockCookieName } from '@/lib/unlock';
export const dynamic = 'force-dynamic';

/**
 * GET /api/payment/status?jobId=123
 * Returns { unlocked: true } when a valid signed unlock cookie exists
 * for this job. The cookie is the proof of purchase — no database.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const jobIdNum = Number(url.searchParams.get('jobId'));

  if (!Number.isInteger(jobIdNum) || jobIdNum <= 0 || jobIdNum > 1e9) {
    return NextResponse.json({ error: 'Invalid job' }, { status: 400 });
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const name = unlockCookieName(jobIdNum);
  let value: string | undefined;
  for (const part of cookieHeader.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) {
      value = rest.join('=');
      break;
    }
  }

  return NextResponse.json({ unlocked: verifyUnlock(jobIdNum, value) });
}

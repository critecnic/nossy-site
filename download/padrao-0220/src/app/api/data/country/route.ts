import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get('file');
  if (!file || !/^[a-z0-9\-_.]+\.json$/.test(file)) {
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
  }
  try {
    const p = path.join(process.cwd(), 'public', 'data', file);
    const data = fs.readFileSync(p, 'utf-8');
    return new NextResponse(data, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=3600' },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

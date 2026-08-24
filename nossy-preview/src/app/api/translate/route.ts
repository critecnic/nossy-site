import { NextRequest, NextResponse } from 'next/server';

const translationCache = new Map<string, { text: string; ts: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const translateRateLimits: Record<string, number[]> = {};
const MAX_TRANSLATE_PER_MINUTE = 60;
const MAX_TEXT_LENGTH = 15000;

function isTranslateRateLimited(ip: string): boolean {
  const now = Date.now();
  if (!translateRateLimits[ip]) translateRateLimits[ip] = [];
  translateRateLimits[ip] = translateRateLimits[ip].filter(t => now - t < 60000);
  if (translateRateLimits[ip].length >= MAX_TRANSLATE_PER_MINUTE) return true;
  translateRateLimits[ip].push(now);
  return false;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

async function translateWithMyMemory(text: string, targetLang: string): Promise<string> {
  // Normalize lang codes for MyMemory
  const langMap: Record<string, string> = { 'zh-CN': 'zh-CN', 'ja': 'ja', 'ko': 'ko' };
  const target = langMap[targetLang] || targetLang;
  const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text.slice(0, 500)) + '&langpair=pt|' + encodeURIComponent(target);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('MyMemory HTTP ' + res.status);
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (translated && translated !== text && !translated.includes('MYMEMORY WARNING')) return translated;
    throw new Error('MyMemory empty result');
  } catch (err: any) {
    clearTimeout(timeout);
    throw err;
  }
}

async function translateWithGoogle(text: string, targetLang: string): Promise<string> {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=' + encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(text);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('Google HTTP ' + res.status);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) throw new Error('Google blocked');
    const data = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) throw new Error('Invalid format');
    let translated = '';
    for (const segment of data[0]) {
      if (Array.isArray(segment) && typeof segment[0] === 'string') translated += segment[0];
    }
    return translated || text;
  } catch (err: any) {
    clearTimeout(timeout);
    throw err;
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (isTranslateRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const body = await req.json().catch(() => ({}));
    const { text, to } = body;
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }
    if (!to || typeof to !== 'string') {
      return NextResponse.json({ error: 'Missing target language' }, { status: 400 });
    }
    const allowedLangs = new Set(['en', 'es', 'fr', 'de', 'it', 'nl', 'pl', 'ru', 'zh-CN', 'ja', 'ko', 'hi', 'bn', 'ar', 'tr', 'vi', 'th', 'ur', 'tl', 'sw']);
    if (!allowedLangs.has(to)) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }
    if (to === 'pt') {
      return NextResponse.json({ translated: text, cached: true });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: 'Text too long' }, { status: 400 });
    }
    const cacheKey = to + ':' + simpleHash(text);
    const cached = translationCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json({ translated: cached.text, cached: true });
    }
    // Try Google first, then MyMemory as fallback
    let translated = '';
    let success = false;
    // Try Google
    try { translated = await translateWithGoogle(text, to); success = true; } catch {}
    // Fallback to MyMemory
    if (!success) {
      try { translated = await translateWithMyMemory(text, to); success = true; } catch {}
    }
    if (!success) {
      return NextResponse.json({ error: 'Translation failed', original: true }, { status: 200 });
    }
    translationCache.set(cacheKey, { text: translated, ts: Date.now() });
    return NextResponse.json({ translated, cached: false });
  } catch (err: any) {
    return NextResponse.json({ error: 'Translation failed', original: true }, { status: 200 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for translations
const translationCache = new Map<string, { text: string; ts: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Rate limiting
const translateRateLimits: Record<string, number[]> = {};
const MAX_TRANSLATE_PER_MINUTE = 30;
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

async function callGoogleTranslate(text: string, targetLang: string): Promise<string> {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=' + encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(text);
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    
    if (!res.ok) throw new Error('Google Translate API error: ' + res.status);
    
    const data = await res.json();
    
    // Google Translate response format:
    // [ [ ["translated", "original", ...], ... ], ... ]
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
      throw new Error('Invalid response format');
    }
    
    let translated = '';
    for (const segment of data[0]) {
      if (Array.isArray(segment) && typeof segment[0] === 'string') {
        translated += segment[0];
      }
    }
    
    return translated || text;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('Translation timeout');
    throw err;
  }
}

// Clean old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of translationCache.entries()) {
    if (now - val.ts > CACHE_TTL_MS) {
      translationCache.delete(key);
    }
  }
}, 60 * 60 * 1000); // Clean every hour

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (isTranslateRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many translation requests' }, { status: 429 });
    }
    
    const body = await req.json().catch(() => ({}));
    const { text, to } = body;
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }
    
    if (!to || typeof to !== 'string') {
      return NextResponse.json({ error: 'Missing target language' }, { status: 400 });
    }
    
    // Validate target language
    const allowedLangs = new Set(['en', 'es', 'fr', 'de', 'it', 'nl', 'pl', 'ru', 'zh-CN', 'ja', 'ko', 'hi', 'bn', 'ar', 'tr', 'vi', 'th', 'ur', 'tl', 'sw']);
    if (!allowedLangs.has(to)) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }
    
    // Skip if target is Portuguese (source language)
    if (to === 'pt') {
      return NextResponse.json({ translated: text, cached: true });
    }
    
    // Check text length
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: 'Text too long' }, { status: 400 });
    }
    
    // Check server cache
    const cacheKey = to + ':' + simpleHash(text);
    const cached = translationCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json({ translated: cached.text, cached: true });
    }
    
    // Call Google Translate
    const translated = await callGoogleTranslate(text, to);
    
    // Store in cache
    translationCache.set(cacheKey, { text: translated, ts: Date.now() });
    
    return NextResponse.json({ translated, cached: false });
  } catch (err: any) {
    console.error('Translation error:', err.message);
    return NextResponse.json({ error: 'Translation failed', original: true }, { status: 200 });
  }
}
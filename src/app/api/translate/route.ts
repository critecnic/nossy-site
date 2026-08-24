import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// NOSSY Translation API — Multi-provider with fallback
// Source: Portuguese (pt) → Target: any supported language
// Providers: Google Translate (primary) + MyMemory (fallback)
// ============================================================

const translationCache = new Map<string, { text: string; ts: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_TEXT_LENGTH = 15000;

// Rate limiting: 40 req/min per IP
const rateLimits: Record<string, number[]> = {};
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (!rateLimits[ip]) rateLimits[ip] = [];
  rateLimits[ip] = rateLimits[ip].filter(t => now - t < 60000);
  if (rateLimits[ip].length >= 40) return true;
  rateLimits[ip].push(now);
  return false;
}

function hashKey(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h = h & h; }
  return Math.abs(h).toString(36);
}

// ---- Provider 1: Google Translate (with browser-like headers) ----
async function googleTranslate(text: string, targetLang: string): Promise<string | null> {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl='
    + encodeURIComponent(targetLang)
    + '&dt=t&q=' + encodeURIComponent(text);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://translate.google.com/',
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.error('[NOSSY Translate] Google returned status:', res.status);
      return null;
    }

    const data = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
      console.error('[NOSSY Translate] Google returned invalid format');
      return null;
    }

    let translated = '';
    for (const segment of data[0]) {
      if (Array.isArray(segment) && typeof segment[0] === 'string') {
        translated += segment[0];
      }
    }
    return translated || null;
  } catch (err: any) {
    clearTimeout(timer);
    console.error('[NOSSY Translate] Google error:', err.message);
    return null;
  }
}

// ---- Provider 2: MyMemory API (free fallback) ----
async function myMemoryTranslate(text: string, targetLang: string): Promise<string | null> {
  const gtToMem: Record<string, string> = { 'zh-CN': 'zh-CN', 'pt': 'pt' };
  const memLang = gtToMem[targetLang] || targetLang;
  const url = 'https://api.mymemory.translated.net/get?q='
    + encodeURIComponent(text.slice(0, 2000)) // MyMemory has 2000 char limit
    + '&langpair=pt|' + encodeURIComponent(memLang);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });
    clearTimeout(timer);

    if (!res.ok) return null;

    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      let result = data.responseData.translatedText;
      // MyMemory sometimes returns uppercase when confidence is low
      if (result === text.toUpperCase()) return null;
      return result;
    }
    return null;
  } catch (err: any) {
    clearTimeout(timer);
    console.error('[NOSSY Translate] MyMemory error:', err.message);
    return null;
  }
}

// ---- Split long text into chunks ----
function splitText(text: string, maxLen = 4000): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) { chunks.push(remaining); break; }
    let idx = remaining.lastIndexOf('\n\n', maxLen);
    if (idx < maxLen * 0.3) idx = remaining.lastIndexOf('\n', maxLen);
    if (idx < maxLen * 0.3) idx = remaining.lastIndexOf('. ', maxLen);
    if (idx < maxLen * 0.3) idx = remaining.lastIndexOf(' ', maxLen);
    if (idx < maxLen * 0.3) idx = maxLen;
    else idx += 1;
    chunks.push(remaining.slice(0, idx));
    remaining = remaining.slice(idx);
  }
  return chunks;
}

// ---- Main translate with dual-provider fallback ----
async function translateWithFallback(text: string, targetLang: string): Promise<string> {
  const chunks = splitText(text);
  const results: string[] = [];

  for (const chunk of chunks) {
    // Try Google first
    let result = await googleTranslate(chunk, targetLang);

    // Fallback to MyMemory
    if (!result) {
      console.warn('[NOSSY Translate] Google failed, trying MyMemory for', targetLang);
      result = await myMemoryTranslate(chunk, targetLang);
    }

    results.push(result || chunk); // ultimate fallback: original text
  }

  return results.join('');
}

// Clean cache every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of translationCache.entries()) {
    if (now - val.ts > CACHE_TTL_MS) translationCache.delete(key);
  }
}, 60 * 60 * 1000);

// ============================================================
// POST /api/translate
// Body: { text: string, to: string }
// Returns: { translated: string, cached?: boolean, provider?: string }
// ============================================================
export async function POST(req: NextRequest) {
  let text = '';
  let to = '';

  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    if (body && typeof body.text === 'string') text = body.text;
    if (body && typeof body.to === 'string') to = body.to;

    if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    if (!to) return NextResponse.json({ error: 'Missing target language' }, { status: 400 });

    const allowed = new Set(['en','es','fr','de','it','nl','pl','ru','zh-CN','ja','ko','hi','bn','ar','tr','vi','th','ur','tl','sw','pt']);
    if (!allowed.has(to)) return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });

    // Portuguese source — no translation needed
    if (to === 'pt') return NextResponse.json({ translated: text, cached: true });

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: 'Text too long' }, { status: 400 });
    }

    // Check cache
    const ck = to + ':' + hashKey(text);
    const cached = translationCache.get(ck);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json({ translated: cached.text, cached: true });
    }

    // Translate with dual-provider fallback
    const translated = await translateWithFallback(text, to);

    // Cache result
    translationCache.set(ck, { text: translated, ts: Date.now() });

    return NextResponse.json({ translated, cached: false });
  } catch (err: any) {
    console.error('[NOSSY Translate] POST error:', err.message);
    // Always return translated text (original as fallback) with 200
    return NextResponse.json({ translated: text || '', error: err.message, fallback: true });
  }
}

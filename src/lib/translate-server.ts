// ============================================================
// NOSSY Server-Side Translation Library v1.0
// Translates Portuguese job content to target language.
// Uses MyMemory API as PRIMARY provider (Google blocked on Vercel).
// All translation happens SERVER-SIDE only.
// ============================================================

import type { Lang } from './i18n';

// Map NOSSY lang codes → MyMemory language codes
const LANG_MAP: Record<string, string> = {
  'en': 'en',
  'pt-br': 'pt',
  'pt-pt': 'pt',
  'es': 'es',
  'fr': 'fr',
  'de': 'de',
  'it': 'it',
  'nl': 'nl',
  'pl': 'pl',
  'ru': 'ru',
  'zh': 'zh-CN',
  'ja': 'ja',
  'ko': 'ko',
  'hi': 'hi',
  'bn': 'bn',
  'ar': 'ar',
  'tr': 'tr',
  'vi': 'vi',
  'th': 'th',
  'ur': 'ur',
  'tl': 'tl',
  'sw': 'sw',
};

// Portuguese source languages — no translation needed
const SOURCE_LANGS = new Set(['pt-br', 'pt-pt']);

export function needsServerTranslation(lang: string): boolean {
  return !SOURCE_LANGS.has(lang);
}

export function getMyMemoryLang(lang: string): string {
  return LANG_MAP[lang] || 'en';
}

// ---- In-memory cache ----
// Key: "lang:text_hash" → { text, ts }
const cache = new Map<string, { text: string; ts: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function hashStr(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h).toString(36);
}

function getCacheKey(text: string, lang: string): string {
  return lang + ':' + hashStr(text);
}

function getCached(text: string, lang: string): string | null {
  const key = getCacheKey(text, lang);
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) {
    return entry.text;
  }
  if (entry) cache.delete(key);
  return null;
}

function setCache(text: string, lang: string, translated: string): void {
  const key = getCacheKey(text, lang);
  cache.set(key, { text: translated, ts: Date.now() });
}

// ---- MyMemory API ----
const MYMEMORY_MAX_CHARS = 2000;
const MYMEMORY_DELAY_MS = 300; // delay between requests to avoid rate limit

async function myMemoryTranslate(text: string, targetLang: string): Promise<string | null> {
  const url = 'https://api.mymemory.translated.net/get?q='
    + encodeURIComponent(text)
    + '&langpair=pt|' + encodeURIComponent(targetLang);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });
    clearTimeout(timer);

    if (!res.ok) return null;

    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      let result = data.responseData.translatedText;
      // MyMemory returns UPPERCASE text when it can't translate (confidence too low)
      if (result === text.toUpperCase() && text !== text.toUpperCase()) return null;
      // MyMemory sometimes adds "NO QUERY SPECIFIED" or similar
      if (result.toUpperCase().includes('NO QUERY SPECIFIED')) return null;
      // If result is empty, fail
      if (!result.trim()) return null;
      return result;
    }
    return null;
  } catch (err: any) {
    clearTimeout(timer);
    console.error('[NOSSY Translate] MyMemory error:', err.message);
    return null;
  }
}

// ---- Text chunking for MyMemory 2000 char limit ----
function splitText(text: string, maxLen = MYMEMORY_MAX_CHARS): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    // Try to split at sentence boundaries
    let idx = remaining.lastIndexOf('. ', maxLen);
    if (idx < maxLen * 0.3) idx = remaining.lastIndexOf('\n\n', maxLen);
    if (idx < maxLen * 0.3) idx = remaining.lastIndexOf('\n', maxLen);
    if (idx < maxLen * 0.3) idx = remaining.lastIndexOf('; ', maxLen);
    if (idx < maxLen * 0.3) idx = remaining.lastIndexOf(', ', maxLen);
    if (idx < maxLen * 0.3) idx = remaining.lastIndexOf(' ', maxLen);
    if (idx < maxLen * 0.3) idx = maxLen;
    else idx += 1; // include the separator
    chunks.push(remaining.slice(0, idx));
    remaining = remaining.slice(idx);
  }
  return chunks;
}

// ---- Core translate function ----
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Translate a single text string from Portuguese to target language (SERVER-SIDE) */
export async function translateServer(text: string, targetLang: Lang): Promise<string> {
  if (!text || !needsServerTranslation(targetLang)) return text;

  // Check cache
  const cached = getCached(text, targetLang);
  if (cached) return cached;

  const memLang = getMyMemoryLang(targetLang);
  const chunks = splitText(text);
  const results: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    // Check cache for each chunk
    const chunkCached = getCached(chunks[i], targetLang);
    if (chunkCached) {
      results.push(chunkCached);
      continue;
    }

    let translated: string | null = null;

    // Retry logic
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        console.log(`[NOSSY Translate] Retry ${attempt} for lang=${memLang}, chunk=${i + 1}/${chunks.length}`);
        await delay(RETRY_DELAY_MS * attempt);
      }
      translated = await myMemoryTranslate(chunks[i], memLang);
      if (translated) break;
    }

    const result = translated || chunks[i]; // fallback to original
    results.push(result);

    // Cache individual chunk
    setCache(chunks[i], targetLang, result);

    // Rate limit: small delay between chunks
    if (i < chunks.length - 1) {
      await delay(MYMEMORY_DELAY_MS);
    }
  }

  const finalText = results.join('');
  // Cache full text
  setCache(text, targetLang, finalText);
  return finalText;
}

/** Batch translate job fields sequentially to avoid overwhelming the API */
export async function translateJobListFields(
  jobs: Array<{ id: number; title: string; company: string; location: string }>,
  targetLang: Lang
): Promise<Map<number, { title: string; company: string; location: string }>> {
  if (!needsServerTranslation(targetLang)) return new Map();

  const results = new Map<number, { title: string; company: string; location: string }>();

  // Process ONE job at a time (title, company, location in parallel within single job)
  // This avoids too many concurrent outbound connections
  for (const job of jobs) {
    try {
      const [title, company, location] = await Promise.all([
        translateServer(job.title, targetLang),
        translateServer(job.company, targetLang),
        translateServer(job.location, targetLang),
      ]);
      results.set(job.id, { title, company, location });
    } catch (err: any) {
      console.error('[NOSSY Translate] Error translating job', job.id, ':', err.message);
      results.set(job.id, { title: job.title, company: job.company, location: job.location });
    }
    // Small delay between jobs to be gentle on the API
    await delay(100);
  }

  return results;
}

/** Translate full job (including description) — for detail page */
export async function translateJobFull(
  job: { title: string; description: string; company: string; location: string },
  targetLang: Lang
): Promise<{ title: string; description: string; company: string; location: string }> {
  if (!needsServerTranslation(targetLang)) {
    return { title: job.title, description: job.description, company: job.company, location: job.location };
  }

  const [title, description, company, location] = await Promise.all([
    translateServer(job.title, targetLang),
    translateServer(job.description, targetLang),
    translateServer(job.company, targetLang),
    translateServer(job.location, targetLang),
  ]);

  return { title, description, company, location };
}

// Clean cache every hour
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, val] of cache.entries()) {
      if (now - val.ts > CACHE_TTL_MS) {
        cache.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) console.log(`[NOSSY Translate] Cache cleaned: ${cleaned} entries`);
  }, 60 * 60 * 1000);
}

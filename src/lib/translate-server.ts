// NOSSY Translation v4.0 — Google GTX (primary) + MyMemory (fallback)
// Free, no API key needed. Reliable for all languages.

import type { Lang } from './i18n';

const SOURCE_LANGS = new Set(['pt-br', 'pt-pt']);

const LANG_TO_GT: Record<string, string> = {
  'en': 'en', 'pt-br': 'pt', 'pt-pt': 'pt', 'es': 'es', 'fr': 'fr',
  'de': 'de', 'it': 'it', 'nl': 'nl', 'pl': 'pl', 'ru': 'ru',
  'zh': 'zh-CN', 'ja': 'ja', 'ko': 'ko', 'hi': 'hi', 'bn': 'bn',
  'ar': 'ar', 'tr': 'tr', 'vi': 'vi', 'th': 'th', 'ur': 'ur',
  'tl': 'tl', 'sw': 'sw',
};

const LANG_NAMES: Record<string, string> = {
  'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
  'it': 'Italian', 'nl': 'Dutch', 'pl': 'Polish', 'ru': 'Russian',
  'zh': 'Simplified Chinese', 'ja': 'Japanese', 'ko': 'Korean',
  'hi': 'Hindi', 'bn': 'Bengali', 'ar': 'Arabic', 'tr': 'Turkish',
  'vi': 'Vietnamese', 'th': 'Thai', 'ur': 'Urdu', 'tl': 'Filipino/Tagalog',
  'sw': 'Swahili',
};

export function needsServerTranslation(lang: string): boolean {
  return !SOURCE_LANGS.has(lang);
}

// ---- Cache ----
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE = 2000;

function getCached(key: string): any | null {
  const e = cache.get(key);
  if (e && Date.now() - e.ts < CACHE_TTL) return e.data;
  if (e) cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  if (cache.size >= MAX_CACHE) {
    // Delete oldest 10% of entries
    const keys = [...cache.keys()];
    for (let i = 0; i < Math.ceil(keys.length * 0.1); i++) cache.delete(keys[i]);
  }
  cache.set(key, { data, ts: Date.now() });
}

// ---- Provider 1: Google Translate GTX (free, fast, no key) ----
async function googleTranslate(text: string, targetLang: string): Promise<string | null> {
  const gtLang = LANG_TO_GT[targetLang] || targetLang;
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl='
    + encodeURIComponent(gtLang)
    + '&dt=t&q=' + encodeURIComponent(text);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.error('[NOSSY T] Google GTX HTTP', res.status);
      return null;
    }

    const data = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
      console.error('[NOSSY T] Google GTX invalid format');
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
    console.error('[NOSSY T] Google GTX error:', err.message.slice(0, 80));
    return null;
  }
}

// ---- Provider 2: MyMemory API (free fallback) ----
async function myMemoryTranslate(text: string, targetLang: string): Promise<string | null> {
  const gtLang = LANG_TO_GT[targetLang] || targetLang;
  const url = 'https://api.mymemory.translated.net/get?q='
    + encodeURIComponent(text.slice(0, 2000))
    + '&langpair=pt|' + encodeURIComponent(gtLang);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
    console.error('[NOSSY T] MyMemory error:', err.message.slice(0, 80));
    return null;
  }
}

// ---- Combined translation with fallback ----
async function translateText(text: string, targetLang: Lang): Promise<string> {
  if (!text || !needsServerTranslation(targetLang)) return text;

  // Try Google GTX first (fast, reliable)
  let result = await googleTranslate(text, targetLang);
  if (result) return result;

  // Fallback to MyMemory
  console.warn('[NOSSY T] Google GTX failed, trying MyMemory for', targetLang);
  result = await myMemoryTranslate(text, targetLang);
  if (result) return result;

  // Ultimate fallback: return original
  console.warn('[NOSSY T] Both providers failed for', targetLang, '- returning original');
  return text;
}

// ---- Public API ----

export async function translateJobListFields(
  jobs: Array<{ id: number; title: string; company: string; location: string }>,
  targetLang: Lang
): Promise<{ map: Map<number, { title: string; company: string; location: string }>; ok: boolean }> {
  const empty = { map: new Map<number, { title: string; company: string; location: string }>(), ok: true };
  if (!needsServerTranslation(targetLang) || jobs.length === 0) return empty;

  const allResults = new Map<number, { title: string; company: string; location: string }>();
  let anyFailed = false;

  // Translate all 3 fields for each job in parallel (with concurrency limit)
  const CONCURRENCY = 6;
  const queue = [...jobs];
  const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length > 0) {
      const job = queue.shift()!;
      const cacheKey = `list:${targetLang}:${job.id}`;
      const cached = getCached(cacheKey);
      if (cached) {
        allResults.set(job.id, cached);
        continue;
      }

      try {
        // Translate all 3 fields in parallel for this job
        const [title, company, location] = await Promise.all([
          translateText(job.title, targetLang),
          translateText(job.company, targetLang),
          translateText(job.location, targetLang),
        ]);

        const entry = { title, company, location };
        allResults.set(job.id, entry);
        setCache(cacheKey, entry);
      } catch (e: any) {
        anyFailed = true;
        allResults.set(job.id, { title: job.title, company: job.company, location: job.location });
      }
    }
  });

  await Promise.all(workers);

  return { map: allResults, ok: !anyFailed };
}

export async function translateJobFull(
  job: { title: string; description: string; company: string; location: string },
  targetLang: Lang
): Promise<{ title: string; description: string; company: string; location: string; ok: boolean }> {
  const passThrough = { title: job.title, description: job.description, company: job.company, location: job.location, ok: true };
  if (!needsServerTranslation(targetLang)) return passThrough;

  const cacheKey = `detail:${targetLang}:${job.title.slice(0, 80)}`;
  const cached = getCached(cacheKey);
  if (cached) return { ...cached, ok: true };

  console.log(`[NOSSY T] Detail: ${job.description.length} chars -> ${targetLang}`);

  try {
    // Translate all 4 fields in parallel
    const [title, description, company, location] = await Promise.all([
      translateText(job.title, targetLang),
      translateText(job.description, targetLang),
      translateText(job.company, targetLang),
      translateText(job.location, targetLang),
    ]);

    const result = { title, description, company, location, ok: true };
    setCache(cacheKey, result);
    console.log(`[NOSSY T] Detail OK: ${title.slice(0, 50)}`);
    return result;
  } catch (e: any) {
    console.error('[NOSSY T] Detail error:', e.message);
    return { ...passThrough, ok: false };
  }
}

export function getMyMemoryLang(lang: string): string { return lang; }

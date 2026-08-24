// Translation system for job descriptions, titles, and company names.
// Source language is Portuguese (pt). Translates to selected UI language.
// Calls Google Translate DIRECTLY from the browser (client-side) to avoid
// server-side IP blocking by Google on Vercel/cloud providers.
// Results are cached in localStorage for 7 days.

import type { Lang } from './i18n';

// Map NOSSY lang codes to Google Translate language codes
export const LANG_TO_GT: Record<string, string> = {
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

// Languages that don't need translation (source is Portuguese)
export const SOURCE_LANGS = new Set(['pt-br', 'pt-pt']);

/** Check if a language needs translation from Portuguese */
export function needsTranslation(lang: Lang): boolean {
  return !SOURCE_LANGS.has(lang);
}

/** Simple hash for cache keys */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/** Get localStorage cache key */
function cacheKey(text: string, targetLang: string): string {
  return 'nossy_tr_' + targetLang + '_' + simpleHash(text);
}

/** Try to get cached translation from localStorage */
export function getCachedTranslation(text: string, targetLang: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = cacheKey(text, targetLang);
    const cached = localStorage.getItem(key);
    if (cached) {
      const entry = JSON.parse(cached);
      if (entry.ts && Date.now() - entry.ts < 7 * 24 * 60 * 60 * 1000) {
        return entry.text;
      }
      localStorage.removeItem(key);
    }
  } catch {
    // localStorage not available
  }
  return null;
}

/** Save translation to localStorage cache */
export function setCachedTranslation(text: string, targetLang: string, translated: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = cacheKey(text, targetLang);
    localStorage.setItem(key, JSON.stringify({ text: translated, ts: Date.now() }));
  } catch {
    // localStorage full or not available
  }
}

/** Split text into chunks at sentence/paragraph boundaries */
function splitTextForTranslation(text: string, maxLen = 4000): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) { chunks.push(remaining); break; }
    let splitIdx = remaining.lastIndexOf('\n\n', maxLen);
    if (splitIdx < maxLen * 0.3) splitIdx = -1;
    if (splitIdx === -1) { splitIdx = remaining.lastIndexOf('\n', maxLen); if (splitIdx < maxLen * 0.3) splitIdx = -1; }
    if (splitIdx === -1) { splitIdx = remaining.lastIndexOf('. ', maxLen); if (splitIdx < maxLen * 0.3) splitIdx = -1; }
    if (splitIdx === -1) { splitIdx = remaining.lastIndexOf(' ', maxLen); if (splitIdx < maxLen * 0.3) splitIdx = -1; }
    if (splitIdx === -1) splitIdx = maxLen; else splitIdx += 1;
    chunks.push(remaining.slice(0, splitIdx));
    remaining = remaining.slice(splitIdx);
  }
  return chunks;
}

/** Call Google Translate directly from the browser (client-side) */
async function callGoogleTranslateClient(text: string, targetLang: string): Promise<string> {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=' + encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(text);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('Google Translate error: ' + res.status);
    const data = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) throw new Error('Invalid response');
    let translated = '';
    for (const segment of data[0]) {
      if (Array.isArray(segment) && typeof segment[0] === 'string') translated += segment[0];
    }
    return translated || text;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('Translation timeout');
    throw err;
  }
}

/** Translate text - calls Google Translate directly from the browser */
export async function translateText(text: string, targetLang: Lang): Promise<string> {
  if (!text || !needsTranslation(targetLang)) return text;
  const cached = getCachedTranslation(text, targetLang);
  if (cached) return cached;
  const gtLang = LANG_TO_GT[targetLang] || 'en';
  try {
    const chunks = splitTextForTranslation(text);
    const translatedChunks: string[] = [];
    for (const chunk of chunks) {
      const translated = await callGoogleTranslateClient(chunk, gtLang);
      translatedChunks.push(translated);
    }
    const result = translatedChunks.join('');
    setCachedTranslation(text, targetLang, result);
    return result;
  } catch {
    return text;
  }
}

/** Batch translate multiple fields of a job */
export interface TranslatedJob {
  title: string;
  description: string;
  company: string;
  location: string;
}

export async function translateJob(
  job: { title: string; description: string; company: string; location: string },
  targetLang: Lang,
  onProgress?: (field: string) => void
): Promise<TranslatedJob> {
  if (!needsTranslation(targetLang)) {
    return { title: job.title, description: job.description, company: job.company, location: job.location };
  }
  const translations = await Promise.all([
    translateText(job.title, targetLang).then(t => { onProgress?.('title'); return t; }),
    translateText(job.description, targetLang).then(t => { onProgress?.('description'); return t; }),
    translateText(job.company, targetLang).then(t => { onProgress?.('company'); return t; }),
    translateText(job.location, targetLang).then(t => { onProgress?.('location'); return t; }),
  ]);
  return { title: translations[0], description: translations[1], company: translations[2], location: translations[3] };
}

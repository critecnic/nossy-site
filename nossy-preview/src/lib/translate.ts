// Translation system for job descriptions, titles, and company names.
// Source language is Portuguese (pt). Translates to selected UI language.
// Uses server-side API route with Google Translate, cached in localStorage.

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
    if (splitIdx === -1) splitIdx = maxLen;
    else splitIdx += 1;
    chunks.push(remaining.slice(0, splitIdx));
    remaining = remaining.slice(splitIdx);
  }
  return chunks;
}

/** Translate text via server API route */
export async function translateText(text: string, targetLang: Lang): Promise<string> {
  if (!text || !needsTranslation(targetLang)) return text;
  const cached = getCachedTranslation(text, targetLang);
  if (cached) return cached;
  const gtLang = LANG_TO_GT[targetLang] || 'en';
  try {
    const chunks = splitTextForTranslation(text);
    const translatedChunks: string[] = [];
    for (const chunk of chunks) {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: chunk, to: gtLang }),
      });
      if (!res.ok) throw new Error('Translation API error');
      const data = await res.json();
      if (data.translated) { translatedChunks.push(data.translated); }
      else { translatedChunks.push(chunk); }
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
  title: string; description: string; company: string; location: string;
}

export async function translateJob(
  job: { title: string; description: string; company: string; location: string },
  targetLang: Lang,
): Promise<TranslatedJob> {
  if (!needsTranslation(targetLang)) {
    return { title: job.title, description: job.description, company: job.company, location: job.location };
  }
  const result: TranslatedJob = { ...job };
  const translations = await Promise.all([
    translateText(job.title, targetLang),
    translateText(job.description, targetLang),
    translateText(job.company, targetLang),
    translateText(job.location, targetLang),
  ]);
  result.title = translations[0];
  result.description = translations[1];
  result.company = translations[2];
  result.location = translations[3];
  return result;
}

// Translation system for NOSSY job board
// Source language: Portuguese (pt). Translates to selected UI language.
// Uses Google Translate client-side endpoint with localStorage caching (7 days).

import type { Lang } from './i18n';

// Map NOSSY lang codes to Google Translate language codes
const LANG_TO_GT: Record<string, string> = {
  'en': 'en', 'pt-br': 'pt', 'pt-pt': 'pt', 'es': 'es', 'fr': 'fr',
  'de': 'de', 'it': 'it', 'nl': 'nl', 'pl': 'pl', 'ru': 'ru',
  'zh': 'zh-CN', 'ja': 'ja', 'ko': 'ko', 'hi': 'hi', 'bn': 'bn',
  'ar': 'ar', 'tr': 'tr', 'vi': 'vi', 'th': 'th', 'ur': 'ur',
  'tl': 'tl', 'sw': 'sw',
};

const SOURCE_LANGS = new Set(['pt-br', 'pt-pt']);

export function needsTranslation(lang: Lang): boolean {
  return !SOURCE_LANGS.has(lang);
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

function cacheKey(text: string, targetLang: string): string {
  return 'nossy_tr_' + targetLang + '_' + simpleHash(text);
}

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
  } catch { /* ignore */ }
  return null;
}

function setCache(text: string, targetLang: string, translated: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(cacheKey(text, targetLang), JSON.stringify({ text: translated, ts: Date.now() }));
  } catch { /* ignore */ }
}

function splitForTranslate(text: string, maxLen = 4000): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) { chunks.push(remaining); break; }
    let idx = remaining.lastIndexOf('\n\n', maxLen);
    if (idx < maxLen * 0.3) idx = -1;
    if (idx === -1) { idx = remaining.lastIndexOf('\n', maxLen); if (idx < maxLen * 0.3) idx = -1; }
    if (idx === -1) { idx = remaining.lastIndexOf('. ', maxLen); if (idx < maxLen * 0.3) idx = -1; }
    if (idx === -1) { idx = remaining.lastIndexOf(' ', maxLen); if (idx < maxLen * 0.3) idx = -1; }
    if (idx === -1) idx = maxLen; else idx += 1;
    chunks.push(remaining.slice(0, idx));
    remaining = remaining.slice(idx);
  }
  return chunks;
}

async function callGT(text: string, targetLang: string): Promise<string> {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=' + encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(text);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('GT error: ' + res.status);
    const data = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) throw new Error('Invalid GT response');
    let result = '';
    for (const seg of data[0]) {
      if (Array.isArray(seg) && typeof seg[0] === 'string') result += seg[0];
    }
    return result || text;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('Translation timeout');
    throw err;
  }
}

export async function translateText(text: string, targetLang: Lang): Promise<string> {
  if (!text || !needsTranslation(targetLang)) return text;
  const cached = getCachedTranslation(text, targetLang);
  if (cached) return cached;
  const gtLang = LANG_TO_GT[targetLang] || 'en';
  try {
    const chunks = splitForTranslate(text);
    const results: string[] = [];
    for (const chunk of chunks) {
      const translated = await callGT(chunk, gtLang);
      results.push(translated);
    }
    const final = results.join('');
    setCache(text, targetLang, final);
    return final;
  } catch {
    return text;
  }
}

export interface TranslatedJob {
  title: string;
  description: string;
  company: string;
  location: string;
}

export async function translateJob(
  job: { title: string; description: string; company: string; location: string },
  targetLang: Lang
): Promise<TranslatedJob> {
  if (!needsTranslation(targetLang)) {
    return { title: job.title, description: job.description, company: job.company, location: job.location };
  }
  const [title, description, company, location] = await Promise.all([
    translateText(job.title, targetLang),
    translateText(job.description, targetLang),
    translateText(job.company, targetLang),
    translateText(job.location, targetLang),
  ]);
  return { title, description, company, location };
}

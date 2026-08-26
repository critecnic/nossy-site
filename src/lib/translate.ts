// ============================================================
// NOSSY Translation Client Library v2.0
// Translates Portuguese job content to selected UI language.
// Uses /api/translate (dual-provider: Google + MyMemory fallback).
// Caches results in localStorage for 7 days.
// ============================================================

import type { Lang } from './i18n';

// Map NOSSY lang codes → Google Translate language codes
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

// Portuguese source languages — no translation needed
const SOURCE_LANGS = new Set(['pt-br', 'pt-pt']);

export function needsTranslation(lang: Lang): boolean {
  return !SOURCE_LANGS.has(lang);
}

// ---- Cache helpers ----

function hashStr(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h = h & h; }
  return Math.abs(h).toString(36);
}

function cacheKey(text: string, lang: string): string {
  return 'nossy_v2_' + lang + '_' + hashStr(text);
}

export function getCachedTranslation(text: string, targetLang: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(cacheKey(text, targetLang));
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (entry.ts && Date.now() - entry.ts < 7 * 24 * 60 * 60 * 1000) return entry.text;
    localStorage.removeItem(cacheKey(text, targetLang));
  } catch { /* ignore */ }
  return null;
}

export function setCachedTranslation(text: string, targetLang: string, translated: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(cacheKey(text, targetLang), JSON.stringify({ text: translated, ts: Date.now() }));
  } catch { /* ignore */ }
}

// ---- Text chunking ----

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
    if (idx < maxLen * 0.3) idx = maxLen; else idx += 1;
    chunks.push(remaining.slice(0, idx));
    remaining = remaining.slice(idx);
  }
  return chunks;
}

// ---- Core translate function with retry ----

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchTranslation(text: string, gtLang: string): Promise<string | null> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      console.log('[NOSSY] Translation retry', attempt, 'for lang=', gtLang);
      await delay(RETRY_DELAY_MS * attempt);
    }
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, to: gtLang }),
      });
      if (!res.ok) {
        console.warn('[NOSSY] /api/translate returned', res.status);
        continue;
      }
      const data = await res.json();
      if (data.translated && !data.error) {
        return data.translated;
      }
      if (data.fallback) {
        console.warn('[NOSSY] Translation fallback returned for', gtLang, ':', data.error);
        return null; // signal to retry
      }
      if (data.error && !data.fallback) {
        console.warn('[NOSSY] Translation error:', data.error);
        return null;
      }
    } catch (err: any) {
      console.warn('[NOSSY] Fetch error attempt', attempt, ':', err.message);
    }
  }
  return null;
}

/** Translate a single text string to the target language */
export async function translateText(text: string, targetLang: Lang): Promise<string> {
  if (!text || !needsTranslation(targetLang)) return text;

  // Check localStorage cache
  const cached = getCachedTranslation(text, targetLang);
  if (cached) return cached;

  const gtLang = LANG_TO_GT[targetLang] || 'en';
  const chunks = splitText(text);
  const results: string[] = [];

  for (const chunk of chunks) {
    const translated = await fetchTranslation(chunk, gtLang);
    results.push(translated || chunk); // fallback to original
  }

  const finalText = results.join('');
  setCachedTranslation(text, targetLang, finalText);
  return finalText;
}

/** Batch translate a job's 4 key fields in parallel */
export interface TranslatedJob {
  title: string;
  description: string;
  company: string;
  location: string;
}

export async function translateJob(
  job: { title: string; description: string; company: string; location: string },
  targetLang: Lang,
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

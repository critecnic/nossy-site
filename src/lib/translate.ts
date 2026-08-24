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
    hash = hash & hash; // Convert to 32bit integer
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
      // Cache valid for 7 days
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

/** Split text into chunks at sentence/paragraph boundaries for translation */
function splitTextForTranslation(text: string, maxLen = 4000): string[] {
  if (text.length <= maxLen) return [text];
  
  const chunks: string[] = [];
  let remaining = text;
  
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    
    // Try to split at paragraph boundary
    let splitIdx = remaining.lastIndexOf('\n\n', maxLen);
    if (splitIdx < maxLen * 0.3) splitIdx = -1;
    
    // Try to split at line boundary
    if (splitIdx === -1) {
      splitIdx = remaining.lastIndexOf('\n', maxLen);
      if (splitIdx < maxLen * 0.3) splitIdx = -1;
    }
    
    // Try to split at sentence boundary
    if (splitIdx === -1) {
      splitIdx = remaining.lastIndexOf('. ', maxLen);
      if (splitIdx < maxLen * 0.3) splitIdx = -1;
    }
    
    // Try to split at space
    if (splitIdx === -1) {
      splitIdx = remaining.lastIndexOf(' ', maxLen);
      if (splitIdx < maxLen * 0.3) splitIdx = -1;
    }
    
    // Hard cut
    if (splitIdx === -1) splitIdx = maxLen;
    else splitIdx += 1; // Include the separator
    
    chunks.push(remaining.slice(0, splitIdx));
    remaining = remaining.slice(splitIdx);
  }
  
  return chunks;
}

/** Translate text via server API route */
export async function translateText(text: string, targetLang: Lang): Promise<string> {
  if (!text || !needsTranslation(targetLang)) return text;
  
  // Check localStorage cache first
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
      if (data.error && data.fallback) {
        console.warn('Translation fallback for lang=' + targetLang + ':', data.error);
        translatedChunks.push(chunk);
      } else if (data.translated) {
        translatedChunks.push(data.translated);
      } else {
        translatedChunks.push(chunk);
      }
    }
    
    const result = translatedChunks.join('');
    
    // Cache the result
    setCachedTranslation(text, targetLang, result);
    
    return result;
  } catch {
    // On error, return original text
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
  
  const result: TranslatedJob = { ...job };
  
  // Translate in parallel for speed
  const translations = await Promise.all([
    translateText(job.title, targetLang).then(t => { onProgress?.('title'); return t; }),
    translateText(job.description, targetLang).then(t => { onProgress?.('description'); return t; }),
    translateText(job.company, targetLang).then(t => { onProgress?.('company'); return t; }),
    translateText(job.location, targetLang).then(t => { onProgress?.('location'); return t; }),
  ]);
  
  result.title = translations[0];
  result.description = translations[1];
  result.company = translations[2];
  result.location = translations[3];
  
  return result;
}

/** Translate only title (for listing cards) */
export async function translateJobTitle(title: string, targetLang: Lang): Promise<string> {
  return translateText(title, targetLang);
}

/** Translate short text (for card snippets) */
export async function translateShort(text: string, targetLang: Lang): Promise<string> {
  return translateText(text, targetLang);
}

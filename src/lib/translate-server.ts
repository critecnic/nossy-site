// NOSSY Translation v4.0 — Gemini (primary) → Google GTX (fallback) → MyMemory (last resort)
// Free GTX+MyMemory work without API key. Gemini enhances batch quality when available.
// Chunking prevents truncation on long descriptions.

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
const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE = 500;

function getCached(key: string): any | null {
  const e = cache.get(key);
  if (e && Date.now() - e.ts < CACHE_TTL) return e.data;
  if (e) cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  if (cache.size >= MAX_CACHE) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { data, ts: Date.now() });
}

// ---- Provider 1: Google Translate GTX (free, fast, no key needed) ----
async function googleGTX(text: string, targetLang: string): Promise<string | null> {
  const gtLang = LANG_TO_GT[targetLang] || targetLang;
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl='
    + encodeURIComponent(gtLang)
    + '&dt=t&q=' + encodeURIComponent(text);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);

  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
    let translated = '';
    for (const segment of data[0]) {
      if (Array.isArray(segment) && typeof segment[0] === 'string') translated += segment[0];
    }
    return translated || null;
  } catch { clearTimeout(timer); return null; }
}

// ---- Provider 2: MyMemory API (free fallback) ----
async function myMemoryTranslate(text: string, targetLang: string): Promise<string | null> {
  const gtLang = LANG_TO_GT[targetLang] || targetLang;
  const url = 'https://api.mymemory.translated.net/get?q='
    + encodeURIComponent(text.slice(0, 2000))
    + '&langpair=pt|' + encodeURIComponent(gtLang);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);

  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      let result = data.responseData.translatedText;
      if (result === text.toUpperCase()) return null;
      return result;
    }
    return null;
  } catch { clearTimeout(timer); return null; }
}

// ---- Chunking for long text ----
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

// ---- Translate single text with GTX → MyMemory fallback ----
async function translateTextFree(text: string, targetLang: string): Promise<string> {
  if (!text) return text;
  let result = await googleGTX(text, targetLang);
  if (result) return result;
  result = await myMemoryTranslate(text, targetLang);
  if (result) return result;
  return text;
}

// ---- Translate long text with chunking ----
async function translateTextChunked(text: string, targetLang: string): Promise<string> {
  if (!text) return text;
  const chunks = splitText(text);
  if (chunks.length === 1) return translateTextFree(text, targetLang);
  const results: string[] = [];
  for (const chunk of chunks) results.push(await translateTextFree(chunk, targetLang));
  return results.join('');
}

// ---- Gemini API (optional, for batch quality) ----
const GEMINI_MODEL = 'gemini-2.0-flash';
const MAX_RETRIES = 2;
function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function callGemini(systemPrompt: string, userContent: string, jsonMode = false): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const body: any = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userContent }] }],
    generationConfig: { temperature: 0.1 },
  };
  if (jsonMode) body.generationConfig.responseMimeType = 'application/json';
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) { if (attempt < MAX_RETRIES) { await delay(500 * (attempt + 1)); continue; } return null; }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text?.trim()) return null;
      return text.trim();
    } catch { if (attempt < MAX_RETRIES) { await delay(500 * (attempt + 1)); continue; } return null; }
  }
  return null;
}

function extractJSON(text: string): string {
  const m1 = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m1) return m1[1].trim();
  const m2 = text.match(/(\[[\s\S]*\])/);
  if (m2) return m2[1].trim();
  const m3 = text.match(/(\{[\s\S]*\})/);
  if (m3) return m3[1].trim();
  return text.trim();
}

// ---- Public API: Job List (title, company, location, description snippet) ----

export async function translateJobListFields(
  jobs: Array<{ id: number; title: string; company: string; location: string; description?: string }>,
  targetLang: Lang
): Promise<{ map: Map<number, { title: string; company: string; location: string; description?: string }>; ok: boolean }> {
  const empty = { map: new Map<number, { title: string; company: string; location: string; description?: string }>(), ok: true };
  if (!needsServerTranslation(targetLang) || jobs.length === 0) return empty;

  const gtLang = LANG_TO_GT[targetLang] || targetLang;
  const allResults = new Map<number, { title: string; company: string; location: string; description?: string }>();
  let anyFailed = false;

  // Try Gemini batch first
  const BATCH = 30;
  let geminiOk = false;
  for (let i = 0; i < jobs.length; i += BATCH) {
    const batch = jobs.slice(i, i + BATCH);
    const cacheKey = `list:${targetLang}:${batch.map(j => j.id).join(',')}`;
    const cached = getCached(cacheKey);
    if (cached) { for (const [k, v] of Object.entries(cached as Record<string, any>)) allResults.set(Number(k), v); geminiOk = true; continue; }

    const langName = LANG_NAMES[targetLang] || targetLang;
    const jobsData = batch.map(j => ({ id: j.id, title: j.title, company: j.company, location: j.location }));
    const sysPrompt = `You are a professional translator. Translate job listings from Portuguese to ${langName}.
Rules:
- Translate ONLY the values of "title", "company", and "location" fields
- NEVER change the "id" field
- Return ONLY a valid JSON array with the same structure, nothing else
- Keep brand/company names in original language if they are international brands
- Use standard native names for cities and countries`;

    const response = await callGemini(sysPrompt, JSON.stringify(jobsData), true);
    if (response) {
      try {
        const parsed = JSON.parse(extractJSON(response));
        const batchCache: Record<string, any> = {};
        for (const item of parsed) {
          if (item.id !== undefined) {
            const orig = batch.find(j => j.id === item.id);
            const entry = { title: item.title || orig?.title || '', company: item.company || orig?.company || '', location: item.location || orig?.location || '' };
            allResults.set(Number(item.id), entry);
            batchCache[String(item.id)] = entry;
          }
        }
        setCache(cacheKey, batchCache);
        geminiOk = true;
      } catch { anyFailed = true; for (const j of batch) allResults.set(j.id, { title: j.title, company: j.company, location: j.location }); }
    } else { break; }
  }

  // If Gemini translated all, also translate description snippets with GTX
  if (geminiOk && allResults.size === jobs.length) {
    const CONCURRENCY = 6;
    const descQueue = [...jobs];
    const descWorkers = Array.from({ length: Math.min(CONCURRENCY, descQueue.length) }, async () => {
      while (descQueue.length > 0) {
        const job = descQueue.shift()!;
        if (!job.description) continue;
        try {
          const snippet = job.description.slice(0, 300);
          const translated = await translateTextFree(snippet, gtLang);
          const existing = allResults.get(job.id);
          if (existing) existing.description = translated;
        } catch { const existing = allResults.get(job.id); if (existing && job.description) existing.description = job.description.slice(0, 300); }
      }
    });
    await Promise.all(descWorkers);
    return { map: allResults, ok: !anyFailed };
  }

  // Gemini not available — use Google GTX + MyMemory
  const CONCURRENCY = 6;
  const queue = [...jobs];
  const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length > 0) {
      const job = queue.shift()!;
      const cacheKey = `list-gtx:${targetLang}:${job.id}`;
      const cached = getCached(cacheKey);
      if (cached) { allResults.set(job.id, cached); continue; }
      try {
        const descSnippet = job.description ? job.description.slice(0, 300) : undefined;
        const [title, company, location, description] = await Promise.all([
          translateTextFree(job.title, gtLang),
          translateTextFree(job.company, gtLang),
          translateTextFree(job.location, gtLang),
          descSnippet ? translateTextFree(descSnippet, gtLang) : Promise.resolve(undefined),
        ]);
        const entry: { title: string; company: string; location: string; description?: string } = { title, company, location };
        if (description) entry.description = description;
        allResults.set(job.id, entry);
        setCache(cacheKey, entry);
      } catch {
        anyFailed = true;
        const fallback: { title: string; company: string; location: string; description?: string } = { title: job.title, company: job.company, location: job.location };
        if (job.description) fallback.description = job.description;
        allResults.set(job.id, fallback);
      }
    }
  });
  await Promise.all(workers);
  return { map: allResults, ok: !anyFailed };
}

// ---- Public API: Job Detail (full description with chunking) ----

export async function translateJobFull(
  job: { title: string; description: string; company: string; location: string },
  targetLang: Lang
): Promise<{ title: string; description: string; company: string; location: string; ok: boolean }> {
  const passThrough = { title: job.title, description: job.description, company: job.company, location: job.location, ok: true };
  if (!needsServerTranslation(targetLang)) return passThrough;

  const cacheKey = `detail:${targetLang}:${job.title.slice(0, 80)}`;
  const cached = getCached(cacheKey);
  if (cached) return { ...cached, ok: true };

  const gtLang = LANG_TO_GT[targetLang] || targetLang;
  const langName = LANG_NAMES[targetLang] || targetLang;

  // Try Gemini first
  const sysPrompt = `You are a professional translator. Translate this job listing from Portuguese to ${langName}.
Rules:
- Translate "title", "description", "company", and "location"
- Return ONLY a valid JSON object with the same 4 keys, nothing else
- Keep the description formatting (paragraphs, lists)
- Keep company name in original language if it is a brand
- Use natural, professional language
- IMPORTANT: Translate the ENTIRE description, do not truncate or abbreviate`;

  const geminiResponse = await callGemini(sysPrompt, JSON.stringify(job), true);
  if (geminiResponse) {
    try {
      const parsed = JSON.parse(extractJSON(geminiResponse));
      const descRatio = parsed.description ? parsed.description.length / job.description.length : 0;
      if (parsed.description && descRatio >= 0.5) {
        const result = { title: parsed.title || job.title, description: parsed.description, company: parsed.company || job.company, location: parsed.location || job.location, ok: true };
        setCache(cacheKey, result);
        return result;
      }
    } catch {}
  }

  // Fallback: Google GTX + MyMemory with chunking
  try {
    const [title, description, company, location] = await Promise.all([
      translateTextFree(job.title, gtLang),
      translateTextChunked(job.description, gtLang),
      translateTextFree(job.company, gtLang),
      translateTextFree(job.location, gtLang),
    ]);
    const result = { title, description, company, location, ok: true };
    setCache(cacheKey, result);
    return result;
  } catch { return { ...passThrough, ok: false }; }
}

export function getMyMemoryLang(lang: string): string { return lang; }

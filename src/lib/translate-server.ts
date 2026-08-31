// NOSSY Translation v3.3 — Google Gemini (auto-fallback models)
// Tenta modelos na ordem: gemini-2.5-flash, gemini-2.0-flash-lite, gemini-1.5-flash
// Se todos falharem, retorna texto original em português.

import type { Lang } from './i18n';

const SOURCE_LANGS = new Set(['pt-br', 'pt-pt']);

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

// ---- Gemini API with model fallback ----
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite', 
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];
const GEMINI_APIS = [
  'https://generativelanguage.googleapis.com/v1beta/models/',
  'https://generativelanguage.googleapis.com/v1/models/',
];
let workingModel: string | null = null;

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function callGemini(systemPrompt: string, userContent: string, jsonMode = false): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[NOSSY] GEMINI_API_KEY is NOT set');
    return null;
  }

  const modelsToTry = workingModel
    ? [workingModel, ...GEMINI_MODELS.filter(m => m !== workingModel)]
    : GEMINI_MODELS;

  const body: any = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userContent }] }],
    generationConfig: { temperature: 0.1 },
  };
  if (jsonMode) body.generationConfig.responseMimeType = 'application/json';

  for (const model of modelsToTry) {
    for (const apiBase of GEMINI_APIS) {
      const url = `${apiBase}${model}:generateContent?key=${apiKey}`;
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 6000);
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });
        clearTimeout(timer);

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          console.error(`[NOSSY] ${apiBase}${model} HTTP ${res.status}: ${errText.slice(0, 120)}`);
          continue;
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text?.trim()) { console.error(`[NOSSY] ${model} returned empty`); continue; }

        if (workingModel !== model) {
          workingModel = model;
          console.log(`[NOSSY] Working model: ${model}`);
        }
        return text.trim();
      } catch (err: any) {
        console.error(`[NOSSY] ${model} error: ${err.message.slice(0, 80)}`);
        continue;
      }
    }
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

// ---- Public API ----

export async function translateJobListFields(
  jobs: Array<{ id: number; title: string; company: string; location: string }>,
  targetLang: Lang
): Promise<{ map: Map<number, { title: string; company: string; location: string }>; ok: boolean }> {
  const empty = { map: new Map<number, { title: string; company: string; location: string }>(), ok: true };
  if (!needsServerTranslation(targetLang) || jobs.length === 0) return empty;

  const BATCH = 30;
  const allResults = new Map<number, { title: string; company: string; location: string }>();
  let anyFailed = false;

  for (let i = 0; i < jobs.length; i += BATCH) {
    const batch = jobs.slice(i, i + BATCH);
    const cacheKey = `list:${targetLang}:${batch.map(j => j.id).join(',')}`;
    const cached = getCached(cacheKey);
    if (cached) {
      for (const [k, v] of Object.entries(cached as Record<string, any>)) allResults.set(Number(k), v);
      continue;
    }

    const langName = LANG_NAMES[targetLang] || targetLang;
    const jobsData = batch.map(j => ({ id: j.id, title: j.title, company: j.company, location: j.location }));
    const sysPrompt = `You are a professional translator. Translate job listings from Portuguese to ${langName}.
Rules:
- Translate ONLY the values of "title", "company", and "location" fields
- NEVER change the "id" field
- Return ONLY a valid JSON array with the same structure, nothing else
- Keep brand/company names in original language if they are international brands
- Use standard native names for cities and countries
- For job titles, use the most natural equivalent in ${langName}`;

    console.log(`[NOSSY] Batch ${Math.floor(i/BATCH)+1}: ${batch.length} jobs -> ${langName}`);
    const response = await callGemini(sysPrompt, JSON.stringify(jobsData), true);

    if (!response) {
      console.warn(`[NOSSY] Batch ${Math.floor(i/BATCH)+1} FAILED - returning original`);
      anyFailed = true;
      for (const j of batch) allResults.set(j.id, { title: j.title, company: j.company, location: j.location });
      continue;
    }

    try {
      const parsed = JSON.parse(extractJSON(response));
      const batchCache: Record<string, any> = {};
      for (const item of parsed) {
        if (item.id !== undefined) {
          const orig = batch.find(j => j.id === item.id);
          const entry = {
            title: item.title || orig?.title || '',
            company: item.company || orig?.company || '',
            location: item.location || orig?.location || '',
          };
          allResults.set(Number(item.id), entry);
          batchCache[String(item.id)] = entry;
        }
      }
      setCache(cacheKey, batchCache);
      console.log(`[NOSSY] Batch ${Math.floor(i/BATCH)+1} OK: ${Object.keys(batchCache).length} translated`);
    } catch (e: any) {
      console.error(`[NOSSY] Batch ${Math.floor(i/BATCH)+1} PARSE ERROR:`, e.message);
      anyFailed = true;
      for (const j of batch) allResults.set(j.id, { title: j.title, company: j.company, location: j.location });
    }
  }

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

  const langName = LANG_NAMES[targetLang] || targetLang;
  const sysPrompt = `You are a professional translator. Translate this job listing from Portuguese to ${langName}.
Rules:
- Translate "title", "description", "company", and "location"
- Return ONLY a valid JSON object with the same 4 keys, nothing else
- Keep the description formatting (paragraphs, lists)
- Keep company name in original language if it is a brand
- Use natural, professional language`;

  console.log(`[NOSSY] Detail: ${job.description.length} chars -> ${langName}`);
  const response = await callGemini(sysPrompt, JSON.stringify(job), true);

  if (!response) {
    console.warn('[NOSSY] Detail FAILED - returning original text');
    return { ...passThrough, ok: false };
  }

  try {
    const parsed = JSON.parse(extractJSON(response));
    const result = {
      title: parsed.title || job.title,
      description: parsed.description || job.description,
      company: parsed.company || job.company,
      location: parsed.location || job.location,
      ok: true,
    };
    setCache(cacheKey, result);
    console.log(`[NOSSY] Detail OK: ${result.title.slice(0, 50)}`);
    return result;
  } catch (e: any) {
    console.error('[NOSSY] Detail PARSE ERROR:', e.message);
    return { ...passThrough, ok: false };
  }
}

export function getMyMemoryLang(lang: string): string { return lang; }

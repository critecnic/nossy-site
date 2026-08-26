// ============================================================
// NOSSY Translation Library v3.0 — Google Gemini 2.0 Flash
// - Synchronous: client receives translated data immediately.
// - No-cache on failure: prevents CDN caching Portuguese as "translated".
// - No 30-job cap: translates ALL jobs in batches.
// - Full description: no truncation (splits large descriptions).
// - Fallback: returns a flag so API routes can skip CDN cache.
// ============================================================

import type { Lang } from './i18n';

// ---- Language config ----
const SOURCE_LANGS = new Set(['pt-br', 'pt-pt']);

const LANG_NAMES: Record<string, string> = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'nl': 'Dutch',
  'pl': 'Polish',
  'ru': 'Russian',
  'zh': 'Simplified Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'hi': 'Hindi',
  'bn': 'Bengali',
  'ar': 'Arabic',
  'tr': 'Turkish',
  'vi': 'Vietnamese',
  'th': 'Thai',
  'ur': 'Urdu',
  'tl': 'Filipino/Tagalog',
  'sw': 'Swahili',
};

export function needsServerTranslation(lang: string): boolean {
  return !SOURCE_LANGS.has(lang);
}

// ---- In-memory cache ----
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 5000;

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  if (entry) cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts);
    const toRemove = oldest.slice(0, Math.floor(MAX_CACHE_SIZE * 0.25));
    toRemove.forEach(([k]) => cache.delete(k));
  }
  cache.set(key, { data, ts: Date.now() });
}

// ---- Google Gemini Flash API ----
const GEMINI_MODEL = 'gemini-2.0-flash';
const MAX_RETRIES = 2;
const API_TIMEOUT = 14000; // 14s (Vercel has 10s for Hobby, but serverless can stretch)

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGemini(systemPrompt: string, userContent: string, jsonMode = false): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[NOSSY Translate] GEMINI_API_KEY not configured. Translations will return original text.');
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body: any = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userContent }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
    },
  };

  if (jsonMode) {
    body.generationConfig.responseMimeType = 'application/json';
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), API_TIMEOUT);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        const errorBody = await res.text().catch(() => '');
        console.error(`[NOSSY Translate] Gemini API ${res.status}: ${errorBody.slice(0, 300)}`);
        if (attempt < MAX_RETRIES) { await delay(500 * (attempt + 1)); continue; }
        return null;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text || !text.trim()) {
        console.error('[NOSSY Translate] Gemini returned empty content');
        return null;
      }

      return text.trim();
    } catch (err: any) {
      console.error(`[NOSSY Translate] Gemini call failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, err.message);
      if (attempt < MAX_RETRIES) { await delay(500 * (attempt + 1)); continue; }
      return null;
    }
  }

  return null;
}

// ---- JSON extraction (fallback if jsonMode fails) ----
function extractJSON(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  const arrMatch = text.match(/(\[[\s\S]*\])/);
  if (arrMatch) return arrMatch[1].trim();
  const objMatch = text.match(/(\{[\s\S]*\})/);
  if (objMatch) return objMatch[1].trim();
  return text.trim();
}

// ---- Translation result with success flag ----
export interface TranslateResult<T> {
  data: T;
  translated: boolean; // false if Gemini failed — caller should not cache at CDN
}

// ---- Public API ----

/** Batch translate job list fields (title, company, location) — handles ALL jobs via batching */
export async function translateJobListFields(
  jobs: Array<{ id: number; title: string; company: string; location: string }>,
  targetLang: Lang
): Promise<TranslateResult<Map<number, { title: string; company: string; location: string }>>> {
  if (!needsServerTranslation(targetLang) || jobs.length === 0) {
    return { data: new Map(), translated: true };
  }

  // Check cache for each batch
  const BATCH_SIZE = 30;
  const allResults = new Map<number, { title: string; company: string; location: string }>();
  let anyFailed = false;

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);
    const cacheKey = `list:${targetLang}:${batch.map(j => j.id).join(',')}`;
    const cached = getCached(cacheKey);

    if (cached) {
      for (const [k, v] of Object.entries(cached as Record<string, any>)) {
        allResults.set(Number(k), v);
      }
      continue;
    }

    const langName = LANG_NAMES[targetLang] || targetLang;
    const jobsData = batch.map(j => ({ id: j.id, title: j.title, company: j.company, location: j.location }));

    const systemPrompt = `You are a professional translator. Translate job listings from Portuguese to ${langName}.
Rules:
- Translate ONLY the values of "title", "company", and "location" fields
- NEVER change the "id" field
- Return ONLY a valid JSON array with the same structure, nothing else
- Keep brand/company names in original language if they are international brands
- Use standard native names for cities and countries
- For job titles, use the most natural equivalent in ${langName}`;

    console.log(`[NOSSY Translate] Batch ${Math.floor(i / BATCH_SIZE) + 1}: Translating ${batch.length} jobs to ${langName}`);

    const response = await callGemini(systemPrompt, JSON.stringify(jobsData), true);

    if (!response) {
      console.warn(`[NOSSY Translate] Batch ${Math.floor(i / BATCH_SIZE) + 1}: Gemini failed, using original text`);
      anyFailed = true;
      // Return original text for failed batch (but don't cache)
      for (const j of batch) {
        allResults.set(j.id, { title: j.title, company: j.company, location: j.location });
      }
      continue;
    }

    try {
      const jsonStr = extractJSON(response);
      const translated = JSON.parse(jsonStr);

      const batchResults: Record<string, any> = {};
      for (const item of translated) {
        if (item.id !== undefined) {
          const orig = batch.find(j => j.id === item.id);
          allResults.set(Number(item.id), {
            title: item.title || orig?.title || '',
            company: item.company || orig?.company || '',
            location: item.location || orig?.location || '',
          });
          batchResults[String(item.id)] = allResults.get(Number(item.id));
        }
      }

      setCache(cacheKey, batchResults);
      console.log(`[NOSSY Translate] Batch ${Math.floor(i / BATCH_SIZE) + 1}: Translated ${Object.keys(batchResults).length}/${batch.length} jobs`);
    } catch (err: any) {
      console.error(`[NOSSY Translate] Batch ${Math.floor(i / BATCH_SIZE) + 1}: Parse error:`, err.message);
      anyFailed = true;
      for (const j of batch) {
        allResults.set(j.id, { title: j.title, company: j.company, location: j.location });
      }
    }
  }

  return { data: allResults, translated: !anyFailed };
}

/** Translate full job (including description) — splits large descriptions if needed */
export async function translateJobFull(
  job: { title: string; description: string; company: string; location: string },
  targetLang: Lang
): Promise<TranslateResult<{ title: string; description: string; company: string; location: string }>> {
  if (!needsServerTranslation(targetLang)) {
    return { data: { title: job.title, description: job.description, company: job.company, location: job.location }, translated: true };
  }

  const cacheKey = `detail:${targetLang}:${job.title.slice(0, 80)}`;
  const cached = getCached(cacheKey);
  if (cached) return { data: cached, translated: true };

  const langName = LANG_NAMES[targetLang] || targetLang;

  // Split description if too long (Gemini handles ~8000 tokens well)
  const MAX_DESC_CHUNK = 4000;
  let translatedDesc = job.description;
  let descTranslated = false;

  if (job.description.length > MAX_DESC_CHUNK) {
    // Translate title + company + location + first chunk
    const firstChunk = job.description.slice(0, MAX_DESC_CHUNK);
    const jobData = { title: job.title, description: firstChunk, company: job.company, location: job.location };

    const systemPrompt = `You are a professional translator. Translate this job listing from Portuguese to ${langName}.
Rules:
- Translate "title", "description", "company", and "location"
- Return ONLY a valid JSON object with the same 4 keys, nothing else
- Keep the description formatting (paragraphs, lists)
- Keep company name in original language if it is a brand
- Use natural, professional language`;

    console.log(`[NOSSY Translate] Translating job detail (chunked, ${job.description.length} chars) to ${langName}`);

    const response = await callGemini(systemPrompt, JSON.stringify(jobData), true);

    if (response) {
      try {
        const jsonStr = extractJSON(response);
        const translated = JSON.parse(jsonStr);

        // Now translate remaining description chunks
        const remainingDesc = job.description.slice(MAX_DESC_CHUNK);
        let translatedRemaining = remainingDesc;

        if (remainingDesc.trim().length > 10) {
          const chunkPrompt = `You are a professional translator. Translate the following job description continuation from Portuguese to ${langName}. Return ONLY the translated text, nothing else. Keep formatting.`;
          const chunkResponse = await callGemini(chunkPrompt, remainingDesc, false);
          if (chunkResponse) {
            translatedRemaining = chunkResponse;
            descTranslated = true;
          }
        } else {
          descTranslated = true;
        }

        translatedDesc = (translated.description || firstChunk) + translatedRemaining;
        const result = {
          title: translated.title || job.title,
          description: translatedDesc,
          company: translated.company || job.company,
          location: translated.location || job.location,
        };

        setCache(cacheKey, result);
        console.log(`[NOSSY Translate] Job detail (chunked) translated to ${langName}`);
        return { data: result, translated: true };
      } catch (err: any) {
        console.error('[NOSSY Translate] Failed to parse chunked Gemini response:', err.message);
      }
    }

    // Chunked approach failed — fall through to simple approach
  }

  // Simple: translate entire description in one call (for short/medium descriptions)
  const jobData = { title: job.title, description: job.description, company: job.company, location: job.location };

  const systemPrompt = `You are a professional translator. Translate this job listing from Portuguese to ${langName}.
Rules:
- Translate "title", "description", "company", and "location"
- Return ONLY a valid JSON object with the same 4 keys, nothing else
- Keep the description formatting (paragraphs, lists)
- Keep company name in original language if it is a brand
- Use natural, professional language`;

  console.log(`[NOSSY Translate] Translating job detail (${job.description.length} chars) to ${langName}`);

  const response = await callGemini(systemPrompt, JSON.stringify(jobData), true);

  if (!response) {
    console.warn('[NOSSY Translate] Gemini failed for detail, returning original text');
    return {
      data: { title: job.title, description: job.description, company: job.company, location: job.location },
      translated: false, // Tell caller: do NOT cache at CDN
    };
  }

  try {
    const jsonStr = extractJSON(response);
    const translated = JSON.parse(jsonStr);
    const result = {
      title: translated.title || job.title,
      description: translated.description || job.description,
      company: translated.company || job.company,
      location: translated.location || job.location,
    };

    setCache(cacheKey, result);
    console.log(`[NOSSY Translate] Job detail translated to ${langName} successfully`);
    return { data: result, translated: true };
  } catch (err: any) {
    console.error('[NOSSY Translate] Failed to parse Gemini detail response:', err.message);
    return {
      data: { title: job.title, description: job.description, company: job.company, location: job.location },
      translated: false,
    };
  }
}

// Keep backward compatibility
export function getMyMemoryLang(lang: string): string {
  return lang;
}
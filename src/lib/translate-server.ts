// ============================================================
// NOSSY Translation Library v2.0 — GLM-4-Flash (Zhipu AI)
// Replaces MyMemory with LLM-based batch translation.
// One API call translates an entire page of jobs.
// Synchronous: client receives translated data immediately.
// Cache: in-memory + Vercel edge (Cache-Control header).
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
const MAX_CACHE_SIZE = 3000;

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

// ---- GLM-4-Flash API ----
const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const GLM_MODEL = 'glm-4-flash';
const MAX_RETRIES = 2;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGLM(systemPrompt: string, userContent: string): Promise<string | null> {
  const apiKey = process.env.GLM_API_KEY;
  if (!apiKey) {
    console.error('[NOSSY Translate] GLM_API_KEY not configured. Translations will return original text.');
    return null;
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(GLM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GLM_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          temperature: 0.1,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        const errorBody = await res.text().catch(() => '');
        console.error(`[NOSSY Translate] GLM API ${res.status}: ${errorBody.slice(0, 200)}`);
        if (attempt < MAX_RETRIES) { await delay(500 * (attempt + 1)); continue; }
        return null;
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text || !text.trim()) {
        console.error('[NOSSY Translate] GLM returned empty content');
        return null;
      }

      return text.trim();
    } catch (err: any) {
      console.error(`[NOSSY Translate] GLM call failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, err.message);
      if (attempt < MAX_RETRIES) { await delay(500 * (attempt + 1)); continue; }
      return null;
    }
  }

  return null;
}

// ---- JSON extraction from LLM response ----
function extractJSON(text: string): string {
  // Try markdown code block first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  // Try to find JSON array or object
  const arrMatch = text.match(/(\[[\s\S]*\])/);
  if (arrMatch) return arrMatch[1].trim();
  const objMatch = text.match(/(\{[\s\S]*\})/);
  if (objMatch) return objMatch[1].trim();
  return text.trim();
}

// ---- Public API ----

/** Batch translate job list fields (title, company, location) — ONE API call for all jobs */
export async function translateJobListFields(
  jobs: Array<{ id: number; title: string; company: string; location: string }>,
  targetLang: Lang
): Promise<Map<number, { title: string; company: string; location: string }>> {
  if (!needsServerTranslation(targetLang) || jobs.length === 0) return new Map();

  const cacheKey = `list:${targetLang}:${jobs.map(j => j.id).join(',')}`;
  const cached = getCached(cacheKey);
  if (cached) {
    const m = new Map<number, { title: string; company: string; location: string }>();
    for (const [k, v] of Object.entries(cached as Record<string, any>)) {
      m.set(Number(k), v);
    }
    return m;
  }

  const langName = LANG_NAMES[targetLang] || targetLang;
  const jobsData = jobs.map(j => ({ id: j.id, title: j.title, company: j.company, location: j.location }));

  const systemPrompt = `You are a professional translator. Translate job listings from Portuguese to ${langName}.
Rules:
- Translate ONLY the values of "title", "company", and "location" fields
- NEVER change the "id" field
- Return ONLY a valid JSON array, nothing else
- Keep brand/company names in original language if they are international brands
- Use standard native names for cities and countries
- For job titles, use the most natural equivalent in ${langName}`;

  console.log(`[NOSSY Translate] Translating ${jobs.length} job fields to ${langName} via GLM-4-Flash`);

  const response = await callGLM(systemPrompt, JSON.stringify(jobsData));

  if (!response) {
    console.warn('[NOSSY Translate] GLM failed, returning original text');
    return new Map(jobs.map(j => [j.id, { title: j.title, company: j.company, location: j.location }]));
  }

  try {
    const jsonStr = extractJSON(response);
    const translated = JSON.parse(jsonStr);

    const results = new Map<number, { title: string; company: string; location: string }>();
    for (const item of translated) {
      if (item.id !== undefined) {
        results.set(Number(item.id), {
          title: item.title || jobs.find(j => j.id === item.id)?.title || '',
          company: item.company || jobs.find(j => j.id === item.id)?.company || '',
          location: item.location || jobs.find(j => j.id === item.id)?.location || '',
        });
      }
    }

    // Cache the result
    const cacheObj: Record<string, any> = {};
    for (const [k, v] of results) cacheObj[String(k)] = v;
    setCache(cacheKey, cacheObj);

    console.log(`[NOSSY Translate] Translated ${results.size}/${jobs.length} job fields to ${langName}`);
    return results;
  } catch (err: any) {
    console.error('[NOSSY Translate] Failed to parse GLM response:', err.message, response.slice(0, 200));
    return new Map(jobs.map(j => [j.id, { title: j.title, company: j.company, location: j.location }]));
  }
}

/** Translate full job (including description) — for detail page, ONE API call */
export async function translateJobFull(
  job: { title: string; description: string; company: string; location: string },
  targetLang: Lang
): Promise<{ title: string; description: string; company: string; location: string }> {
  if (!needsServerTranslation(targetLang)) {
    return { title: job.title, description: job.description, company: job.company, location: job.location };
  }

  // Simple cache key based on title prefix + lang
  const cacheKey = `detail:${targetLang}:${job.title.slice(0, 80)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const langName = LANG_NAMES[targetLang] || targetLang;

  // Truncate description to keep within token limits (~4000 chars max for free tier)
  const maxDescLen = 3000;
  const desc = job.description.length > maxDescLen
    ? job.description.slice(0, maxDescLen) + '\n...(description truncated)'
    : job.description;

  const jobData = { title: job.title, description: desc, company: job.company, location: job.location };

  const systemPrompt = `You are a professional translator. Translate this job listing from Portuguese to ${langName}.
Rules:
- Translate "title", "description", "company", and "location"
- Return ONLY a valid JSON object with the same 4 keys, nothing else
- Keep the description formatting (paragraphs, lists)
- Keep company name in original language if it is a brand
- Use natural, professional language`;  

  console.log(`[NOSSY Translate] Translating job detail to ${langName} via GLM-4-Flash`);

  const response = await callGLM(systemPrompt, JSON.stringify(jobData));

  if (!response) {
    console.warn('[NOSSY Translate] GLM failed for detail, returning original text');
    return { title: job.title, description: job.description, company: job.company, location: job.location };
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
    return result;
  } catch (err: any) {
    console.error('[NOSSY Translate] Failed to parse GLM detail response:', err.message);
    return { title: job.title, description: job.description, company: job.company, location: job.location };
  }
}

// Keep backward compatibility
export function getMyMemoryLang(lang: string): string {
  return lang;
}

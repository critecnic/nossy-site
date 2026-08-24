#!/usr/bin/env python3
"""
NOSSY i18n Translation Fix - FINAL v2
Root cause: Google Translate blocks Vercel server IPs (429).
Fix: translate.ts now calls Google Translate DIRECTLY from the browser (client-side),
bypassing the /api/translate server route that was being blocked.
Also includes all previous fixes (i18n keys, LangSelector, homepage, country page, taglines).
ZIP structure: all files inside src/ directory.
"""
import os, re, shutil, zipfile, subprocess

SRC = "/home/z/my-project/src"
OUT = "/home/z/my-project/download/nossy-src-0220.zip"
TMP = "/home/z/my-project/tmp_src_final"

# ============================================================
# 1. Copy src/ to temp directory
# ============================================================
if os.path.exists(TMP):
    shutil.rmtree(TMP)
shutil.copytree(SRC, TMP)
print("[1/9] Copied src/ to temp directory")

# ============================================================
# 2. CRITICAL FIX: Rewrite translate.ts - client-side Google Translate
# ============================================================
translate_path = os.path.join(TMP, "lib", "translate.ts")
new_translate_ts = '''// Translation system for job descriptions, titles, and company names.
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
    let splitIdx = remaining.lastIndexOf('\\n\\n', maxLen);
    if (splitIdx < maxLen * 0.3) splitIdx = -1;
    if (splitIdx === -1) { splitIdx = remaining.lastIndexOf('\\n', maxLen); if (splitIdx < maxLen * 0.3) splitIdx = -1; }
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
'''

with open(translate_path, "w", encoding="utf-8") as f:
    f.write(new_translate_ts)
print("[2/9] CRITICAL: Rewrote translate.ts - client-side Google Translate")

# ============================================================
# 3. Fix i18n.ts - Add 'language' and 'tagline' keys
# ============================================================
i18n_path = os.path.join(TMP, "lib", "i18n.ts")
with open(i18n_path, "r", encoding="utf-8") as f:
    content = f.read()

lang_map = {
    "en": ('"language": "Language",', '"tagline": "Seek and you shall find.",'),
    "pt-br": ('"language": "Idioma",', '"tagline": "Busque e encontrara."'),
    "pt-pt": ('"language": "Idioma",', '"tagline": "Procure e encontrara."'),
    "es": ('"language": "Idioma",', '"tagline": "Busca y encontraras."'),
    "fr": ('"language": "Langue",', '"tagline": "Cherchez et vous trouverez."'),
    "de": ('"language": "Sprache",', '"tagline": "Suchen und Sie werden finden."'),
    "it": ('"language": "Lingua",', '"tagline": "Cerca e troverai."'),
    "nl": ('"language": "Taal",', '"tagline": "Zoek en u zult vinden."'),
    "pl": ('"language": "Jezyk",', '"tagline": "Szukaj a znajdziesz."'),
    "ru": ('"language": "Yazyk",', '"tagline": "Iskhite i naydyote."'),
    "zh": ('"language": "\u8bed\u8a00",', '"tagline": "\u5bfb\u627e\uff0c\u4f60\u5c06\u627e\u5230\u3002"'),
    "ja": ('"language": "\u8a00\u8a9e",', '"tagline": "\u63a2\u305b\u3070\u898b\u3064\u304b\u308a\u307e\u3059\u3002"'),
    "ko": ('"language": "\uc5b4\uc5b4",', '"tagline": "\ucc3e\uc73c\uba74 \ucc3e\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4."'),
    "hi": ('"language": "\u092d\u093e\u0937\u093e",', '"tagline": "\u0916\u094b\u091c\u0947\u0902 \u0914\u0930 \u092a\u093e\u090f\u0902\u0917\u0947\u0964"'),
    "bn": ('"language": "\u09ad\u09be\u09b7\u09be",', '"tagline": "\u0996\u09c1\u0981\u099c\u09c1\u09a8 \u098f\u09ac\u0982 \u09aa\u09be\u09ac\u09c7\u09a8\u0964"'),
    "ar": ('"language": "\u0627\u0644\u0644\u063a\u0629",', '"tagline": "\u0627\u0628\u062d\u062b \u0648\u0633\u062a\u062c\u062f."'),
    "tr": ('"language": "Dil",', '"tagline": "Arayin ve bulacaksiniz."'),
    "vi": ('"language": "Ngon ngu",', '"tagline": "Tim va ban se tim thay."'),
    "th": ('"language": "\u0e20\u0e32\u0e29\u0e32",', '"tagline": "\u0e04\u0e49\u0e19\u0e2b\u0e32\u0e41\u0e25\u0e49\u0e27\u0e04\u0e38\u0e13\u0e08\u0e30\u0e1e\u0e1a."'),
    "ur": ('"language": "\u0632\u0628\u0627\u0646",', '"tagline": "\u062a\u0644\u0627\u0634 \u06a9\u0631\u06cc\u06ba \u0627\u0648\u0631 \u067e\u0627\u0626\u06cc\u06ba \u06af\u0627\u0614"'),
    "tl": ('"language": "Wika",', '"tagline": "Hanapin at makikita mo."'),
    "sw": ('"language": "Lugha",', '"tagline": "Tafuta utapata."'),
}

for lang_code, (lang_key, tagline_key) in lang_map.items():
    pattern = rf'("{re.escape(lang_code)}":\s*\{{.*?"notAvailable":\s*"[^"]*"\s*,?)'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        end_pos = match.end()
        insert_text = f"\n    {lang_key}\n    {tagline_key}"
        content = content[:end_pos] + insert_text + content[end_pos:]
    else:
        print(f"  WARNING: Could not find block for: {lang_code}")

with open(i18n_path, "w", encoding="utf-8") as f:
    f.write(content)
print("[3/9] Fixed i18n.ts - added language and tagline keys to all 22 languages")

# ============================================================
# 4. Fix LangSelector.tsx
# ============================================================
ls_path = os.path.join(TMP, "components", "LangSelector.tsx")
with open(ls_path, "r", encoding="utf-8") as f:
    ls_content = f.read()
ls_content = ls_content.replace("{(i18n[lang] || i18n['en']).language}", "{current.name}")
ls_content = ls_content.replace('aria-label="Select language"', 'aria-label={current.name}')
with open(ls_path, "w", encoding="utf-8") as f:
    f.write(ls_content)
print("[4/9] Fixed LangSelector.tsx")

# ============================================================
# 5. Fix Homepage - Add FULL translation for job cards
# ============================================================
hp_path = os.path.join(TMP, "app", "[lang]", "[slug]", "page.tsx")
with open(hp_path, "r", encoding="utf-8") as f:
    hp = f.read()

hp = hp.replace(
    'import { getCountryNameTranslated, getCountryCountLabel } from "@/lib/country-names";',
    'import { getCountryNameTranslated, getCountryCountLabel } from "@/lib/country-names";\nimport { needsTranslation, translateText, getCachedTranslation } from "@/lib/translate";'
)

hp = hp.replace(
    '  const [dataError, setDataError] = useState(false);',
    '  const [dataError, setDataError] = useState(false);\n  const [translatedLatest, setTranslatedLatest] = useState<Record<number, {title:string;description:string;company:string;location:string}>>({});\n  const [isTranslating, setIsTranslating] = useState(false);'
)

hp = hp.replace(
    '  useEffect(() => { params.then(p => setLangCode(p.lang)); }, [params]);',
    '  useEffect(() => { params.then(p => setLangCode(p.lang)); }, [params]);\n\n  useEffect(() => {\n    if (!langCode || !needsTranslation(lang as Lang)) { setTranslatedLatest({}); return; }\n    setIsTranslating(true);\n    const jobs = latestData as Job[];\n    const newT: Record<number, {title:string;description:string;company:string;location:string}> = {};\n    let cancelled = false;\n    (async () => {\n      for (const job of jobs) {\n        if (cancelled) break;\n        const ct = getCachedTranslation(job.title, lang as Lang);\n        const cd = job.description ? getCachedTranslation(job.description.slice(0, 200), lang as Lang) : null;\n        const cc2 = getCachedTranslation(job.company, lang as Lang);\n        if (ct) { newT[job.id] = { title: ct, description: cd || job.description?.slice(0, 200) || "", company: cc2 || job.company, location: job.location }; continue; }\n        try {\n          const [t, d, c] = await Promise.all([ translateText(job.title, lang as Lang), job.description ? translateText(job.description.slice(0, 200), lang as Lang) : Promise.resolve(""), translateText(job.company, lang as Lang), ]);\n          newT[job.id] = { title: t, description: d, company: c, location: job.location };\n        } catch { newT[job.id] = { title: job.title, description: job.description?.slice(0, 200) || "", company: job.company, location: job.location }; }\n      }\n      if (!cancelled) { setTranslatedLatest(newT); setIsTranslating(false); }\n    })();\n    return () => { cancelled = true; };\n  }, [langCode]);'
)

hp = hp.replace(
    '<p className="text-lg sm:text-xl text-blue-100 max-w-xl mx-auto mb-2 italic">Seek and you shall find.</p>',
    '<p className="text-lg sm:text-xl text-blue-100 max-w-xl mx-auto mb-2 italic">{T.tagline}</p>'
)
hp = hp.replace(
    '<p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>',
    '<p className="text-sky-400 text-sm font-medium italic">{T.tagline}</p>'
)

old_card = '              {latest.slice(0, 20).map((job) => {\n                const m = getSectorMeta(job.sector); const tc = getTypeStyle(job.type);\n                return (\n                  <article key={job.id} className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all border-gray-100">\n                    <div className={"h-1 w-full bg-gradient-to-r " + m.color} />\n                    <div className="p-4">\n                      <div className="flex items-center justify-between mb-2"><span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{getTypeLabel(lang, job.type)}</span><span className="text-xs text-gray-400">{job.posted}</span></div>\n                      <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">{job.title}</h3>\n                      <p className="text-xs font-medium text-gray-600 mb-2">{job.company}</p>\n                      <div className="flex items-center gap-2 text-xs text-gray-500"><span>{job.location}</span><span className="text-gray-300">|</span><span className="font-medium text-sky-600">{job.salary}</span></div>\n                      <div className="mt-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sectorNames[lang]?.[job.sector] || job.sector}</span></div>\n                    </div></article>);\n              })}'

new_card = '              {latest.slice(0, 20).map((job) => {\n                const m = getSectorMeta(job.sector); const tc = getTypeStyle(job.type);\n                const tr = translatedLatest[job.id];\n                const dTitle = tr?.title || job.title;\n                const dCompany = tr?.company || job.company;\n                const dDesc = tr?.description || job.description?.slice(0, 200) || "";\n                return (\n                  <article key={job.id} className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all border-gray-100">\n                    <div className={"h-1 w-full bg-gradient-to-r " + m.color} />\n                    <div className="p-4">\n                      <div className="flex items-center justify-between mb-2"><span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{getTypeLabel(lang, job.type)}</span><span className="text-xs text-gray-400">{job.posted}</span></div>\n                      <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">{isTranslating && !tr ? <span className="inline-block w-3/4 h-4 bg-gray-200 rounded animate-pulse" /> : dTitle}</h3>\n                      <p className="text-xs font-medium text-gray-600 mb-2">{isTranslating && !tr ? <span className="inline-block w-1/2 h-3 bg-gray-200 rounded animate-pulse" /> : dCompany}</p>\n                      <div className="flex items-center gap-2 text-xs text-gray-500"><span>{job.location}</span><span className="text-gray-300">|</span><span className="font-medium text-sky-600">{job.salary}</span></div>\n                      <div className="mt-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sectorNames[lang]?.[job.sector] || job.sector}</span></div>\n                      {dDesc && <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">{isTranslating && !tr ? <span className="inline-block w-full h-3 bg-gray-100 rounded animate-pulse" /> : dDesc}</p>}\n                    </div></article>);\n              })}'

hp = hp.replace(old_card, new_card)
with open(hp_path, "w", encoding="utf-8") as f:
    f.write(hp)
print("[5/9] Fixed Homepage - full translation for job cards + taglines")

# ============================================================
# 6. Fix Country page - translate company + location
# ============================================================
cp_path = os.path.join(TMP, "app", "[lang]", "[slug]", "[region]", "[country]", "page.tsx")
with open(cp_path, "r", encoding="utf-8") as f:
    cp = f.read()

cp = cp.replace(
    'interface TranslatedCard {\n  title: string;\n  description: string;\n}',
    'interface TranslatedCard {\n  title: string;\n  description: string;\n  company: string;\n  location: string;\n}'
)

fn_start = cp.find('  const translateVisibleCards = useCallback(async (jobsToTranslate: Job[], l: Lang) => {')
fn_end = cp.find('  }, []);', fn_start) + len('  }, []);')
if fn_start > 0 and fn_end > fn_start:
    new_fn = '''  const translateVisibleCards = useCallback(async (jobsToTranslate: Job[], l: Lang) => {
    if (!needsTranslation(l) || jobsToTranslate.length === 0) return;
    setIsTranslating(true);
    const newTranslations: Record<number, TranslatedCard> = {};
    for (const job of jobsToTranslate) {
      const cachedTitle = getCachedTranslation(job.title, l);
      const cachedDesc = job.description ? getCachedTranslation(job.description.slice(0, 200), l) : null;
      const cachedCompany = getCachedTranslation(job.company, l);
      const cachedLocation = getCachedTranslation(job.location, l);
      if (cachedTitle) {
        newTranslations[job.id] = { title: cachedTitle, description: cachedDesc || job.description?.slice(0, 200) || "", company: cachedCompany || job.company, location: cachedLocation || job.location };
        continue;
      }
      try {
        const [translatedTitle, translatedDesc, translatedCompany, translatedLocation] = await Promise.all([
          translateText(job.title, l),
          job.description ? translateText(job.description.slice(0, 200), l) : Promise.resolve(""),
          translateText(job.company, l),
          translateText(job.location, l),
        ]);
        newTranslations[job.id] = { title: translatedTitle, description: translatedDesc, company: translatedCompany, location: translatedLocation };
      } catch {
        newTranslations[job.id] = { title: job.title, description: job.description?.slice(0, 200) || "", company: job.company, location: job.location };
      }
    }
    setTranslatedCards(prev => ({ ...prev, ...newTranslations }));
    setIsTranslating(false);
  }, []);'''
    cp = cp[:fn_start] + new_fn + cp[fn_end:]

cp = cp.replace(
    '<p className="text-xs font-medium text-gray-600 mb-1">{isLocked ? \'***\' : job.company}</p>',
    '<p className="text-xs font-medium text-gray-600 mb-1">{isLocked ? \'***\' : (translated?.company || job.company)}</p>'
)
cp = cp.replace(
    '<p className="text-xs text-gray-400 mb-2 line-clamp-1">{job.location}</p>',
    '<p className="text-xs text-gray-400 mb-2 line-clamp-1">{translated?.location || job.location}</p>'
)
cp = cp.replace(
    '<p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>',
    '<p className="text-sky-400 text-sm font-medium italic">{T.tagline}</p>'
)
with open(cp_path, "w", encoding="utf-8") as f:
    f.write(cp)
print("[6/9] Fixed Country page - company/location translation + tagline")

# ============================================================
# 7. Fix Job detail + Region + Guide pages footer taglines
# ============================================================
tagline_files = [
    os.path.join(TMP, "app", "[lang]", "[slug]", "[region]", "[country]", "[id]", "page.tsx"),
    os.path.join(TMP, "app", "[lang]", "[slug]", "[region]", "page.tsx"),
]
for g in ["how-to-find-tech-jobs-in-europe", "remote-work-salary-guide-2025", "top-tech-skills-demand"]:
    tagline_files.append(os.path.join(TMP, "app", "[lang]", "[slug]", "guides", g, "page.tsx"))

fixed_count = 0
for fp in tagline_files:
    if os.path.exists(fp):
        with open(fp, "r", encoding="utf-8") as f:
            fc = f.read()
        if 'Seek and you shall find.' in fc:
            fc = fc.replace(
                '<p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>',
                '<p className="text-sky-400 text-sm font-medium italic">{T.tagline}</p>'
            )
            with open(fp, "w", encoding="utf-8") as f:
                f.write(fc)
            fixed_count += 1
print(f"[7/9] Fixed {fixed_count} footer taglines")

# ============================================================
# 8. Create ZIP with src/ root
# ============================================================
os.makedirs(os.path.dirname(OUT), exist_ok=True)
if os.path.exists(OUT): os.remove(OUT)
file_count = 0
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(TMP):
        for file in files:
            full_path = os.path.join(root, file)
            arc_name = os.path.join("src", os.path.relpath(full_path, TMP))
            zf.write(full_path, arc_name)
            file_count += 1
print(f"[8/9] ZIP created: {OUT} ({file_count} files)")

# ============================================================
# 9. VERIFICATION
# ============================================================
print("\n--- VERIFICATION ---")
with zipfile.ZipFile(OUT, "r") as zf:
    names = zf.namelist()
    print(f"All src/ root: {all(n.startswith('src/') for n in names)}")
    
    tt = zf.read('src/lib/translate.ts').decode('utf-8')
    print(f"translate.ts calls Google DIRECTLY: {'translate.googleapis.com' in tt}")
    print(f"translate.ts NO /api/translate: {'/api/translate' not in tt}")
    print(f"translate.ts has callGoogleTranslateClient: {'callGoogleTranslateClient' in tt}")
    
    hp2 = zf.read('src/app/[lang]/[slug]/page.tsx').decode('utf-8')
    print(f"Homepage translate import: {'from "@/lib/translate"' in hp2}")
    print(f"Homepage translatedLatest: {'translatedLatest' in hp2}")
    print(f"Homepage translateText(title): {'translateText(job.title' in hp2}")
    
    cp2 = zf.read('src/app/[lang]/[slug]/[region]/[country]/page.tsx').decode('utf-8')
    print(f"Country TranslatedCard company: {'company: string;' in cp2}")
    print(f"Country translateText(company): {'translateText(job.company, l)' in cp2}")
    print(f"Country translateText(location): {'translateText(job.location, l)' in cp2}")
    
    i18n2 = zf.read('src/lib/i18n.ts').decode('utf-8')
    print(f"i18n 22 language keys: {i18n2.count('"language":') == 22}")
    print(f"i18n 22 tagline keys: {i18n2.count('"tagline":') == 22}")
    
    ls2 = zf.read('src/components/LangSelector.tsx').decode('utf-8')
    print(f"LangSelector current.name: {'{current.name}' in ls2}")

result = subprocess.run(['rg', '-l', 'Seek and you shall find', TMP], capture_output=True, text=True)
remaining = [f for f in result.stdout.strip().split('\n') if f and 'lib/i18n.ts' not in f and 'lib/countries.ts' not in f and 'app/layout.tsx' not in f and 'components/SiteLogo.tsx' not in f and '[slug]/layout.tsx' not in f]
print(f"No hardcoded taglines: {len(remaining) == 0}")

shutil.rmtree(TMP)
print(f"\n[DONE] {file_count} files -> {OUT}")

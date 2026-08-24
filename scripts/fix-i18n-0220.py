#!/usr/bin/env python3
"""
Fix ALL i18n translation issues for NOSSY project - Pattern 0220
Generates complete src/ folder with all language fixes applied.
"""
import os
import re
import shutil
import zipfile

SRC = "/home/z/my-project/src"
OUT = "/home/z/my-project/download/nossy-src-0220.zip"
TMP = "/home/z/my-project/tmp_src_0220"

# ============================================================
# 1. Copy src/ to temp directory for modifications
# ============================================================
if os.path.exists(TMP):
    shutil.rmtree(TMP)
shutil.copytree(SRC, TMP)
print("[1/7] Copied src/ to temp directory")

# ============================================================
# 2. Fix i18n.ts - Add 'language' and 'tagline' keys to all 22 languages
# ============================================================
i18n_path = os.path.join(TMP, "lib", "i18n.ts")
with open(i18n_path, "r", encoding="utf-8") as f:
    content = f.read()

# The tagline and language translations for each language
lang_map = {
    "en": ('"language": "Language",', '"tagline": "Seek and you shall find.",'),
    "pt-br": ('"language": "Idioma",', '"tagline": "Busque e encontrará."'),
    "pt-pt": ('"language": "Idioma",', '"tagline": "Procure e encontrará."'),
    "es": ('"language": "Idioma",', '"tagline": "Busca y encontrarás."'),
    "fr": ('"language": "Langue",', '"tagline": "Cherchez et vous trouverez."'),
    "de": ('"language": "Sprache",', '"tagline": "Suchen und Sie werden finden."'),
    "it": ('"language": "Lingua",', '"tagline": "Cerca e troverai."'),
    "nl": ('"language": "Taal",', '"tagline": "Zoek en u zult vinden."'),
    "pl": ('"language": "Język",', '"tagline": "Szukaj a znajdziesz."'),
    "ru": ('"language": "Язык",', '"tagline": "Ищите и найдёте."'),
    "zh": ('"language": "语言",', '"tagline": "寻找，你将找到。"'),
    "ja": ('"language": "言語",', '"tagline": "探せば見つかります。"'),
    "ko": ('"language": "언어",', '"tagline": "찾으면 찾을 수 있습니다."'),
    "hi": ('"language": "भाषा",', '"tagline": "खोजें और पाएंगे।"'),
    "bn": ('"language": "ভাষা",', '"tagline": "খুঁজুন এবং পাবেন।"'),
    "ar": ('"language": "اللغة",', '"tagline": "ابحث وستجد."'),
    "tr": ('"language": "Dil",', '"tagline": "Arayın ve bulacaksınız."'),
    "vi": ('"language": "Ngôn ngữ",', '"tagline": "Tìm và bạn sẽ tìm thấy."'),
    "th": ('"language": "ภาษา",', '"tagline": "ค้นหาแล้วคุณจะพบ."'),
    "ur": ('"language": "زبان",', '"tagline": "تلاش کریں اور پائیں گا۔"'),
    "tl": ('"language": "Wika",', '"tagline": "Hanapin at makikita mo."'),
    "sw": ('"language": "Lugha",', '"tagline": "Tafuta utapata."'),
}

# We need to find each language block in the i18n Record and add the keys
# Each language block ends with `"notAvailable": "...",\n  },`
# We insert before the closing `},`

for lang_code, (lang_key, tagline_key) in lang_map.items():
    # Find the pattern for this language's notAvailable entry in the i18n section
    # The i18n section starts after `export const i18n: Record<Lang, Record<string, string>> = {`
    # Each language block is:  "lang-code": { ... "notAvailable": "..."\n  },
    
    # We need to be precise - find the right language block
    # Pattern: inside the i18n Record, find `"<lang>": {` then find its `"notAvailable"` line
    
    # Find the notAvailable line that belongs to this language block
    # Strategy: find `"<lang>": {` and then find the next `"notAvailable"` after it
    
    pattern = rf'("{re.escape(lang_code)}":\s*\{{.*?"notAvailable":\s*"[^"]*"\s*,?)'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        end_pos = match.end()
        # Insert the two new keys after the notAvailable line
        insert_text = f"\n    {lang_key}\n    {tagline_key}"
        content = content[:end_pos] + insert_text + content[end_pos:]
        print(f"  Added language/tagline keys for: {lang_code}")
    else:
        print(f"  WARNING: Could not find block for: {lang_code}")

with open(i18n_path, "w", encoding="utf-8") as f:
    f.write(content)
print("[2/7] Fixed i18n.ts - added language and tagline keys")

# ============================================================
# 3. Fix LangSelector.tsx - Replace undefined i18n[lang].language with current.name
# ============================================================
ls_path = os.path.join(TMP, "components", "LangSelector.tsx")
with open(ls_path, "r", encoding="utf-8") as f:
    ls_content = f.read()

# Replace the undefined key reference
ls_content = ls_content.replace(
    '{(i18n[lang] || i18n[\'en\']).language}',
    '{current.name}'
)
# Also fix the hardcoded aria-label
ls_content = ls_content.replace(
    'aria-label="Select language"',
    'aria-label={current.name}'
)

with open(ls_path, "w", encoding="utf-8") as f:
    f.write(ls_content)
print("[3/7] Fixed LangSelector.tsx - replaced undefined language key")

# ============================================================
# 4. Fix Homepage - Add translation for job cards (THE CRITICAL FIX)
# ============================================================
hp_path = os.path.join(TMP, "app", "[lang]", "[slug]", "page.tsx")
with open(hp_path, "r", encoding="utf-8") as f:
    hp_content = f.read()

# 4a. Add imports for translation
old_imports = '''import { getSectorMeta, getTypeStyle, getTypeLabel, getRegionName, getCompanyCareerUrl } from "@/lib/shared";
import { getCountryNameTranslated, getCountryCountLabel } from "@/lib/country-names";'''
new_imports = '''import { getSectorMeta, getTypeStyle, getTypeLabel, getRegionName, getCompanyCareerUrl } from "@/lib/shared";
import { getCountryNameTranslated, getCountryCountLabel } from "@/lib/country-names";
import { needsTranslation, translateText, getCachedTranslation } from "@/lib/translate";'''
hp_content = hp_content.replace(old_imports, new_imports)

# 4b. Add translation state after existing state declarations
old_state = '''  const [dataError, setDataError] = useState(false);

  useEffect(() => { setLatest(latestData as Job[]); setCountries(countriesData as CountryInfo[]); }, []);'''
new_state = '''  const [dataError, setDataError] = useState(false);
  const [translatedLatest, setTranslatedLatest] = useState<Record<number, {title:string;description:string;company:string;location:string}>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => { setLatest(latestData as Job[]); setCountries(countriesData as CountryInfo[]); }, []);'''
hp_content = hp_content.replace(old_state, new_state)

# 4c. Add translation effect after the langCode resolution
old_effect = '''  useEffect(() => { params.then(p => setLangCode(p.lang)); }, [params]);'''
new_effect = '''  useEffect(() => { params.then(p => setLangCode(p.lang)); }, [params]);

  // Translate homepage job cards when language changes
  useEffect(() => {
    if (!langCode || !needsTranslation(lang as Lang)) {
      setTranslatedLatest({});
      return;
    }
    setIsTranslating(true);
    const jobs = latestData as Job[];
    const newT: Record<number, {title:string;description:string;company:string;location:string}> = {};
    let cancelled = false;
    (async () => {
      for (const job of jobs) {
        if (cancelled) break;
        const ct = getCachedTranslation(job.title, lang as Lang);
        const cd = job.description ? getCachedTranslation(job.description.slice(0, 200), lang as Lang) : null;
        const cc2 = getCachedTranslation(job.company, lang as Lang);
        if (ct) {
          newT[job.id] = { title: ct, description: cd || job.description?.slice(0, 200) || '', company: cc2 || job.company, location: job.location };
          continue;
        }
        try {
          const [t, d, c] = await Promise.all([
            translateText(job.title, lang as Lang),
            job.description ? translateText(job.description.slice(0, 200), lang as Lang) : Promise.resolve(''),
            translateText(job.company, lang as Lang),
          ]);
          newT[job.id] = { title: t, description: d, company: c, location: job.location };
        } catch {
          newT[job.id] = { title: job.title, description: job.description?.slice(0, 200) || '', company: job.company, location: job.location };
        }
      }
      if (!cancelled) { setTranslatedLatest(newT); setIsTranslating(false); }
    })();
    return () => { cancelled = true; };
  }, [langCode]);'''
hp_content = hp_content.replace(old_effect, new_effect)

# 4d. Fix footer tagline on homepage (appears twice)
hp_content = hp_content.replace(
    '<p className="text-lg sm:text-xl text-blue-100 max-w-xl mx-auto mb-2 italic">Seek and you shall find.</p>',
    '<p className="text-lg sm:text-xl text-blue-100 max-w-xl mx-auto mb-2 italic">{T.tagline}</p>'
)
hp_content = hp_content.replace(
    '<p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>',
    '<p className="text-sky-400 text-sm font-medium italic">{T.tagline}</p>'
)

# 4e. Fix job cards to use translated content
old_card = '''              {latest.slice(0, 20).map((job) => {
                const m = getSectorMeta(job.sector); const tc = getTypeStyle(job.type);
                return (
                  <article key={job.id} className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all border-gray-100">
                    <div className={"h-1 w-full bg-gradient-to-r " + m.color} />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2"><span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{getTypeLabel(lang, job.type)}</span><span className="text-xs text-gray-400">{job.posted}</span></div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">{job.title}</h3>
                      <p className="text-xs font-medium text-gray-600 mb-2">{job.company}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500"><span>{job.location}</span><span className="text-gray-300">|</span><span className="font-medium text-sky-600">{job.salary}</span></div>
                      <div className="mt-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sectorNames[lang]?.[job.sector] || job.sector}</span></div>
                    </div></article>);
              })}'''

new_card = '''              {latest.slice(0, 20).map((job) => {
                const m = getSectorMeta(job.sector); const tc = getTypeStyle(job.type);
                const tr = translatedLatest[job.id];
                const dTitle = tr?.title || job.title;
                const dCompany = tr?.company || job.company;
                const dDesc = tr?.description || job.description?.slice(0, 200) || '';
                return (
                  <article key={job.id} className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all border-gray-100">
                    <div className={"h-1 w-full bg-gradient-to-r " + m.color} />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2"><span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{getTypeLabel(lang, job.type)}</span><span className="text-xs text-gray-400">{job.posted}</span></div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">{isTranslating && !tr ? <span className="inline-block w-3/4 h-4 bg-gray-200 rounded animate-pulse" /> : dTitle}</h3>
                      <p className="text-xs font-medium text-gray-600 mb-2">{isTranslating && !tr ? <span className="inline-block w-1/2 h-3 bg-gray-200 rounded animate-pulse" /> : dCompany}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500"><span>{job.location}</span><span className="text-gray-300">|</span><span className="font-medium text-sky-600">{job.salary}</span></div>
                      <div className="mt-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sectorNames[lang]?.[job.sector] || job.sector}</span></div>
                      {dDesc && <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">{isTranslating && !tr ? <span className="inline-block w-full h-3 bg-gray-100 rounded animate-pulse" /> : dDesc}</p>}
                    </div></article>);
              })}'''

hp_content = hp_content.replace(old_card, new_card)

with open(hp_path, "w", encoding="utf-8") as f:
    f.write(hp_content)
print("[4/7] Fixed Homepage - added translation for job cards + tagline")

# ============================================================
# 5. Fix Region page footer tagline
# ============================================================
rp_path = os.path.join(TMP, "app", "[lang]", "[slug]", "[region]", "page.tsx")
with open(rp_path, "r", encoding="utf-8") as f:
    rp_content = f.read()

rp_content = rp_content.replace(
    '<p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>',
    '<p className="text-sky-400 text-sm font-medium italic">{T.tagline}</p>'
)

with open(rp_path, "w", encoding="utf-8") as f:
    f.write(rp_content)
print("[5/7] Fixed Region page footer tagline")

# ============================================================
# 6. Fix Country page - footer tagline + translate location on cards
# ============================================================
cp_path = os.path.join(TMP, "app", "[lang]", "[slug]", "[region]", "[country]", "page.tsx")
with open(cp_path, "r", encoding="utf-8") as f:
    cp_content = f.read()

# 6a. Fix footer tagline
cp_content = cp_content.replace(
    '<p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>',
    '<p className="text-sky-400 text-sm font-medium italic">{T.tagline}</p>'
)

# 6b. Add location translation to translateVisibleCards
old_translate_fn = '''  // Translate visible job cards when language changes
  const translateVisibleCards = useCallback(async (jobsToTranslate: Job[], l: Lang) => {
    if (!needsTranslation(l) || jobsToTranslate.length === 0) return;
    setIsTranslating(true);

    const newTranslations: Record<number, TranslatedCard> = {};

    for (const job of jobsToTranslate) {
      // Skip if already translated for this language
      const cachedTitle = getCachedTranslation(job.title, l);
      const cachedDesc = job.description ? getCachedTranslation(job.description.slice(0, 200), l) : null;

      if (cachedTitle) {
        newTranslations[job.id] = {
          title: cachedTitle,
          description: cachedDesc || job.description?.slice(0, 200) || '',
        };
        continue;
      }

      try {
        const [translatedTitle, translatedDesc] = await Promise.all([
          translateText(job.title, l),
          job.description ? translateText(job.description.slice(0, 200), l) : Promise.resolve(''),
        ]);
        newTranslations[job.id] = { title: translatedTitle, description: translatedDesc };
      } catch {
        newTranslations[job.id] = { title: job.title, description: job.description?.slice(0, 200) || '' };
      }
    }

    setTranslatedCards(prev => ({ ...prev, ...newTranslations }));
    setIsTranslating(false);
  }, []);'''

new_translate_fn = '''  // Translate visible job cards when language changes
  const translateVisibleCards = useCallback(async (jobsToTranslate: Job[], l: Lang) => {
    if (!needsTranslation(l) || jobsToTranslate.length === 0) return;
    setIsTranslating(true);

    const newTranslations: Record<number, TranslatedCard> = {};

    for (const job of jobsToTranslate) {
      // Skip if already translated for this language
      const cachedTitle = getCachedTranslation(job.title, l);
      const cachedDesc = job.description ? getCachedTranslation(job.description.slice(0, 200), l) : null;
      const cachedLocation = getCachedTranslation(job.location, l);

      if (cachedTitle) {
        newTranslations[job.id] = {
          title: cachedTitle,
          description: cachedDesc || job.description?.slice(0, 200) || '',
          location: cachedLocation || job.location,
        };
        continue;
      }

      try {
        const [translatedTitle, translatedDesc, translatedLocation] = await Promise.all([
          translateText(job.title, l),
          job.description ? translateText(job.description.slice(0, 200), l) : Promise.resolve(''),
          translateText(job.location, l),
        ]);
        newTranslations[job.id] = { title: translatedTitle, description: translatedDesc, location: translatedLocation };
      } catch {
        newTranslations[job.id] = { title: job.title, description: job.description?.slice(0, 200) || '', location: job.location };
      }
    }

    setTranslatedCards(prev => ({ ...prev, ...newTranslations }));
    setIsTranslating(false);
  }, []);'''

cp_content = cp_content.replace(old_translate_fn, new_translate_fn)

# 6c. Update TranslatedCard interface to include location
old_interface = '''interface TranslatedCard {
  title: string;
  description: string;
}'''
new_interface = '''interface TranslatedCard {
  title: string;
  description: string;
  location: string;
}'''
cp_content = cp_content.replace(old_interface, new_interface)

# 6d. Use translated location in card display
cp_content = cp_content.replace(
    '<p className="text-xs text-gray-400 mb-2 line-clamp-1">{job.location}</p>',
    '<p className="text-xs text-gray-400 mb-2 line-clamp-1">{translated?.location || job.location}</p>'
)

with open(cp_path, "w", encoding="utf-8") as f:
    f.write(cp_content)
print("[6/7] Fixed Country page - footer tagline + location translation")

# ============================================================
# 7. Fix Job detail page footer tagline
# ============================================================
jd_path = os.path.join(TMP, "app", "[lang]", "[slug]", "[region]", "[country]", "[id]", "page.tsx")
with open(jd_path, "r", encoding="utf-8") as f:
    jd_content = f.read()

jd_content = jd_content.replace(
    '<p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>',
    '<p className="text-sky-400 text-sm font-medium italic">{T.tagline}</p>'
)

with open(jd_path, "w", encoding="utf-8") as f:
    f.write(jd_content)
print("[7/7] Fixed Job detail page footer tagline")

# ============================================================
# 8. Fix Guide pages footer taglines
# ============================================================
guides_dir = os.path.join(TMP, "app", "[lang]", "[slug]", "guides")
for guide_name in ["how-to-find-tech-jobs-in-europe", "remote-work-salary-guide-2025", "top-tech-skills-demand"]:
    guide_path = os.path.join(guides_dir, guide_name, "page.tsx")
    if os.path.exists(guide_path):
        with open(guide_path, "r", encoding="utf-8") as f:
            gc = f.read()
        gc = gc.replace(
            '<p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>',
            '<p className="text-sky-400 text-sm font-medium italic">{T.tagline}</p>'
        )
        with open(guide_path, "w", encoding="utf-8") as f:
            f.write(gc)
        print(f"  Fixed guide: {guide_name}")
print("[8/9] Fixed 3 Guide pages footer taglines")

# ============================================================
# 9. Create ZIP
# ============================================================
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(TMP):
        for file in files:
            full_path = os.path.join(root, file)
            arc_name = os.path.relpath(full_path, TMP)
            zf.write(full_path, arc_name)

print(f"\n[OK] ZIP created: {OUT}")
print(f"     Files in ZIP: {sum(len(files) for _, _, files in os.walk(TMP))}")

# Verify: no more hardcoded taglines in user-facing pages
import subprocess
result = subprocess.run(['rg', '-l', 'Seek and you shall find', TMP], capture_output=True, text=True)
remaining = [f for f in result.stdout.strip().split('\n') if f and 'lib/i18n.ts' not in f and 'lib/countries.ts' not in f and 'app/layout.tsx' not in f and 'components/SiteLogo.tsx' not in f and '[slug]/layout.tsx' not in f]
if remaining:
    print(f"\n  WARNING: {len(remaining)} files still have hardcoded taglines:")
    for r in remaining:
        print(f"    - {os.path.relpath(r, TMP)}")
else:
    print("\n[OK] Verification: No hardcoded taglines in user-facing pages")

# Cleanup
count = sum(len(files) for _, _, files in os.walk(TMP))
shutil.rmtree(TMP)
print(f"[OK] Temp directory cleaned. {count} files processed.")

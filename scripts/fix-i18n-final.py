#!/usr/bin/env python3
"""
NOSSY i18n Translation Fix - FINAL VERSION
Fixes ALL translation issues and creates src/ zip with correct structure.
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
print("[1/8] Copied src/ to temp directory")

# ============================================================
# 2. Fix i18n.ts - Add 'language' and 'tagline' keys
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
    "zh": ('"language": "语言",', '"tagline": "寻找，你将找到。"'),
    "ja": ('"language": "言語",', '"tagline": "探せば見つかります。"'),
    "ko": ('"language": "언어",', '"tagline": "찾으면 찾을 수 있습니다."'),
    "hi": ('"language": "भाषा",', '"tagline": "खोजें और पाएंगे।"'),
    "bn": ('"language": "ভাষা",', '"tagline": "খুঁজুন এবং পাবেন।"'),
    "ar": ('"language": "اللغة",', '"tagline": "ابحث وستجد."'),
    "tr": ('"language": "Dil",', '"tagline": "Arayin ve bulacaksiniz."'),
    "vi": ('"language": "Ngon ngu",', '"tagline": "Tim va ban se tim thay."'),
    "th": ('"language": "ภาษา",', '"tagline": "ค้นหาแล้วคุณจะพบ."'),
    "ur": ('"language": "زبان",', '"tagline": "تلاش کریں اور پائیں گا۔"'),
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
        print(f"  Added language/tagline keys for: {lang_code}")
    else:
        print(f"  WARNING: Could not find block for: {lang_code}")

with open(i18n_path, "w", encoding="utf-8") as f:
    f.write(content)
print("[2/8] Fixed i18n.ts - added language and tagline keys to all 22 languages")

# ============================================================
# 3. Fix LangSelector.tsx
# ============================================================
ls_path = os.path.join(TMP, "components", "LangSelector.tsx")
with open(ls_path, "r", encoding="utf-8") as f:
    ls_content = f.read()

ls_content = ls_content.replace(
    "{(i18n[lang] || i18n['en']).language}",
    "{current.name}"
)
ls_content = ls_content.replace(
    'aria-label="Select language"',
    "aria-label={current.name}"
)

with open(ls_path, "w", encoding="utf-8") as f:
    f.write(ls_content)
print("[3/8] Fixed LangSelector.tsx")

# ============================================================
# 4. Fix Homepage - Add FULL translation for job cards
# ============================================================
hp_path = os.path.join(TMP, "app", "[lang]", "[slug]", "page.tsx")
with open(hp_path, "r", encoding="utf-8") as f:
    hp = f.read()

# 4a. Add translate imports
hp = hp.replace(
    'import { getCountryNameTranslated, getCountryCountLabel } from "@/lib/country-names";',
    'import { getCountryNameTranslated, getCountryCountLabel } from "@/lib/country-names";\nimport { needsTranslation, translateText, getCachedTranslation } from "@/lib/translate";'
)

# 4b. Add translation state
hp = hp.replace(
    '  const [dataError, setDataError] = useState(false);',
    '  const [dataError, setDataError] = useState(false);\n  const [translatedLatest, setTranslatedLatest] = useState<Record<number, {title:string;description:string;company:string;location:string}>>({});\n  const [isTranslating, setIsTranslating] = useState(false);'
)

# 4c. Add translation useEffect after langCode effect
hp = hp.replace(
    '  useEffect(() => { params.then(p => setLangCode(p.lang)); }, [params]);',
    '  useEffect(() => { params.then(p => setLangCode(p.lang)); }, [params]);\n\n  // Translate homepage job cards when language changes\n  useEffect(() => {\n    if (!langCode || !needsTranslation(lang as Lang)) {\n      setTranslatedLatest({});\n      return;\n    }\n    setIsTranslating(true);\n    const jobs = latestData as Job[];\n    const newT: Record<number, {title:string;description:string;company:string;location:string}> = {};\n    let cancelled = false;\n    (async () => {\n      for (const job of jobs) {\n        if (cancelled) break;\n        const ct = getCachedTranslation(job.title, lang as Lang);\n        const cd = job.description ? getCachedTranslation(job.description.slice(0, 200), lang as Lang) : null;\n        const cc2 = getCachedTranslation(job.company, lang as Lang);\n        if (ct) {\n          newT[job.id] = { title: ct, description: cd || job.description?.slice(0, 200) || "", company: cc2 || job.company, location: job.location };\n          continue;\n        }\n        try {\n          const [t, d, c] = await Promise.all([\n            translateText(job.title, lang as Lang),\n            job.description ? translateText(job.description.slice(0, 200), lang as Lang) : Promise.resolve(""),\n            translateText(job.company, lang as Lang),\n          ]);\n          newT[job.id] = { title: t, description: d, company: c, location: job.location };\n        } catch {\n          newT[job.id] = { title: job.title, description: job.description?.slice(0, 200) || "", company: job.company, location: job.location };\n        }\n      }\n      if (!cancelled) { setTranslatedLatest(newT); setIsTranslating(false); }\n    })();\n    return () => { cancelled = true; };\n  }, [langCode]);'
)

# 4d. Fix hero tagline
hp = hp.replace(
    '<p className="text-lg sm:text-xl text-blue-100 max-w-xl mx-auto mb-2 italic">Seek and you shall find.</p>',
    '<p className="text-lg sm:text-xl text-blue-100 max-w-xl mx-auto mb-2 italic">{T.tagline}</p>'
)

# 4e. Fix footer tagline
hp = hp.replace(
    '<p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>',
    '<p className="text-sky-400 text-sm font-medium italic">{T.tagline}</p>'
)

# 4f. Fix job cards to use translated content
old_card = '              {latest.slice(0, 20).map((job) => {\n                const m = getSectorMeta(job.sector); const tc = getTypeStyle(job.type);\n                return (\n                  <article key={job.id} className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all border-gray-100">\n                    <div className={"h-1 w-full bg-gradient-to-r " + m.color} />\n                    <div className="p-4">\n                      <div className="flex items-center justify-between mb-2"><span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{getTypeLabel(lang, job.type)}</span><span className="text-xs text-gray-400">{job.posted}</span></div>\n                      <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">{job.title}</h3>\n                      <p className="text-xs font-medium text-gray-600 mb-2">{job.company}</p>\n                      <div className="flex items-center gap-2 text-xs text-gray-500"><span>{job.location}</span><span className="text-gray-300">|</span><span className="font-medium text-sky-600">{job.salary}</span></div>\n                      <div className="mt-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sectorNames[lang]?.[job.sector] || job.sector}</span></div>\n                    </div></article>);\n              })}'

new_card = '              {latest.slice(0, 20).map((job) => {\n                const m = getSectorMeta(job.sector); const tc = getTypeStyle(job.type);\n                const tr = translatedLatest[job.id];\n                const dTitle = tr?.title || job.title;\n                const dCompany = tr?.company || job.company;\n                const dDesc = tr?.description || job.description?.slice(0, 200) || "";\n                return (\n                  <article key={job.id} className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all border-gray-100">\n                    <div className={"h-1 w-full bg-gradient-to-r " + m.color} />\n                    <div className="p-4">\n                      <div className="flex items-center justify-between mb-2"><span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{getTypeLabel(lang, job.type)}</span><span className="text-xs text-gray-400">{job.posted}</span></div>\n                      <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">{isTranslating && !tr ? <span className="inline-block w-3/4 h-4 bg-gray-200 rounded animate-pulse" /> : dTitle}</h3>\n                      <p className="text-xs font-medium text-gray-600 mb-2">{isTranslating && !tr ? <span className="inline-block w-1/2 h-3 bg-gray-200 rounded animate-pulse" /> : dCompany}</p>\n                      <div className="flex items-center gap-2 text-xs text-gray-500"><span>{job.location}</span><span className="text-gray-300">|</span><span className="font-medium text-sky-600">{job.salary}</span></div>\n                      <div className="mt-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sectorNames[lang]?.[job.sector] || job.sector}</span></div>\n                      {dDesc && <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">{isTranslating && !tr ? <span className="inline-block w-full h-3 bg-gray-100 rounded animate-pulse" /> : dDesc}</p>}\n                    </div></article>);\n              })}'

hp = hp.replace(old_card, new_card)

with open(hp_path, "w", encoding="utf-8") as f:
    f.write(hp)
print("[4/8] Fixed Homepage - full translation for job cards + taglines")

# ============================================================
# 5. Fix Country page - translate company + location
# ============================================================
cp_path = os.path.join(TMP, "app", "[lang]", "[slug]", "[region]", "[country]", "page.tsx")
with open(cp_path, "r", encoding="utf-8") as f:
    cp = f.read()

# 5a. Add company + location to TranslatedCard interface
cp = cp.replace(
    'interface TranslatedCard {\n  title: string;\n  description: string;\n}',
    'interface TranslatedCard {\n  title: string;\n  description: string;\n  company: string;\n  location: string;\n}'
)

# 5b. Rewrite the translateVisibleCards function using line-based approach
# Find the start and end of the function
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
        newTranslations[job.id] = {
          title: cachedTitle,
          description: cachedDesc || job.description?.slice(0, 200) || "",
          company: cachedCompany || job.company,
          location: cachedLocation || job.location,
        };
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
    print("  Rewrote translateVisibleCards function")
else:
    print("  WARNING: Could not find translateVisibleCards function!")

# 5c. Use translated company and location in card display
cp = cp.replace(
    '<p className="text-xs font-medium text-gray-600 mb-1">{isLocked ? \'***\' : job.company}</p>',
    '<p className="text-xs font-medium text-gray-600 mb-1">{isLocked ? \'***\' : (translated?.company || job.company)}</p>'
)
cp = cp.replace(
    '<p className="text-xs text-gray-400 mb-2 line-clamp-1">{job.location}</p>',
    '<p className="text-xs text-gray-400 mb-2 line-clamp-1">{translated?.location || job.location}</p>'
)

# 5d. Fix footer tagline
cp = cp.replace(
    '<p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>',
    '<p className="text-sky-400 text-sm font-medium italic">{T.tagline}</p>'
)

with open(cp_path, "w", encoding="utf-8") as f:
    f.write(cp)
print("[5/8] Fixed Country page - company/location translation + tagline")

# ============================================================
# 6. Fix Job detail page footer tagline
# ============================================================
jd_path = os.path.join(TMP, "app", "[lang]", "[slug]", "[region]", "[country]", "[id]", "page.tsx")
with open(jd_path, "r", encoding="utf-8") as f:
    jd = f.read()

jd = jd.replace(
    '<p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>',
    '<p className="text-sky-400 text-sm font-medium italic">{T.tagline}</p>'
)

with open(jd_path, "w", encoding="utf-8") as f:
    f.write(jd)
print("[6/8] Fixed Job detail page footer tagline")

# ============================================================
# 7. Fix Region page + Guide pages footer taglines
# ============================================================
files_to_fix = [
    os.path.join(TMP, "app", "[lang]", "[slug]", "[region]", "page.tsx"),
]
for g in ["how-to-find-tech-jobs-in-europe", "remote-work-salary-guide-2025", "top-tech-skills-demand"]:
    files_to_fix.append(os.path.join(TMP, "app", "[lang]", "[slug]", "guides", g, "page.tsx"))

fixed_count = 0
for fp in files_to_fix:
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
print(f"[7/8] Fixed {fixed_count} page footer taglines")

# ============================================================
# 8. Create ZIP with correct src/ structure
# ============================================================
os.makedirs(os.path.dirname(OUT), exist_ok=True)
if os.path.exists(OUT):
    os.remove(OUT)

file_count = 0
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(TMP):
        for file in files:
            full_path = os.path.join(root, file)
            arc_name = os.path.join("src", os.path.relpath(full_path, TMP))
            zf.write(full_path, arc_name)
            file_count += 1

print(f"[8/8] ZIP created: {OUT}")
print(f"     Files in ZIP: {file_count}")

# ============================================================
# VERIFICATION
# ============================================================
print("\n--- VERIFICATION ---")

with zipfile.ZipFile(OUT, "r") as zf:
    names = zf.namelist()
    non_src = [n for n in names if not n.startswith("src/")]
    if non_src:
        print(f"WARNING: {len(non_src)} entries NOT starting with src/")
    else:
        print("OK: All entries start with src/")

    # Deep content checks
    hp = zf.read('src/app/[lang]/[slug]/page.tsx').decode('utf-8')
    print("\nHOMEPAGE:")
    print("  translate import:", 'from "@/lib/translate"' in hp)
    print("  translatedLatest state:", 'translatedLatest' in hp)
    print("  translateText(title):", 'translateText(job.title, lang as Lang)' in hp)
    print("  translateText(company):", 'translateText(job.company, lang as Lang)' in hp)
    print("  dTitle in cards:", 'dTitle' in hp)
    print("  dCompany in cards:", 'dCompany' in hp)
    print("  skeleton loading:", 'animate-pulse' in hp)
    print("  T.tagline hero:", '{T.tagline}' in hp)

    cp2 = zf.read('src/app/[lang]/[slug]/[region]/[country]/page.tsx').decode('utf-8')
    print("\nCOUNTRY PAGE:")
    print("  TranslatedCard company:", 'company: string;' in cp2)
    print("  TranslatedCard location:", 'location: string;' in cp2)
    print("  translateText(company):", 'translateText(job.company, l)' in cp2)
    print("  translateText(location):", 'translateText(job.location, l)' in cp2)
    print("  translated?.company:", 'translated?.company || job.company' in cp2)
    print("  translated?.location:", 'translated?.location || job.location' in cp2)
    print("  T.tagline:", '{T.tagline}' in cp2)

    ls2 = zf.read('src/components/LangSelector.tsx').decode('utf-8')
    print("\nLANGSELECTOR:")
    print("  current.name:", '{current.name}' in ls2)
    print("  no undefined ref:", '(i18n[lang] ||' not in ls2)

    i18n2 = zf.read('src/lib/i18n.ts').decode('utf-8')
    print("\nI18N:")
    print("  22 language keys:", i18n2.count('"language":') == 22)
    print("  22 tagline keys:", i18n2.count('"tagline":') == 22)

# No hardcoded taglines
result = subprocess.run(['rg', '-l', 'Seek and you shall find', TMP], capture_output=True, text=True)
remaining = [f for f in result.stdout.strip().split('\n') if f and 
             'lib/i18n.ts' not in f and 'lib/countries.ts' not in f and 
             'app/layout.tsx' not in f and 'components/SiteLogo.tsx' not in f and 
             '[slug]/layout.tsx' not in f]
if remaining:
    print(f"\nWARNING: {len(remaining)} files still have hardcoded taglines")
else:
    print("\nOK: No hardcoded taglines in user-facing pages")

shutil.rmtree(TMP)
print(f"\n[DONE] {file_count} files in ZIP -> {OUT}")

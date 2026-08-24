#!/usr/bin/env python3
"""Generate nossy-src-0220.zip with src/ folder structure."""
import os, re, shutil, zipfile

SRC = "/home/z/my-project/src"
OUT = "/home/z/my-project/download/nossy-src-0220.zip"
TMP = "/home/z/my-project/tmp_src_0220"

if os.path.exists(TMP):
    shutil.rmtree(TMP)
shutil.copytree(SRC, TMP)
print("[1] Copied src/")

# === 2. Fix i18n.ts ===
i18n_path = os.path.join(TMP, "lib", "i18n.ts")
with open(i18n_path, "r", encoding="utf-8") as f:
    content = f.read()

lang_map = {
    'en': ('"language": "Language",', '"tagline": "Seek and you shall find.",'),
    'pt-br': ('"language": "Idioma",', '"tagline": "Busque e encontrara.",'),
    'pt-pt': ('"language": "Idioma",', '"tagline": "Procure e encontrara.",'),
    'es': ('"language": "Idioma",', '"tagline": "Busca y encontraras.",'),
    'fr': ('"language": "Langue",', '"tagline": "Cherchez et vous trouverez.",'),
    'de': ('"language": "Sprache",', '"tagline": "Suchen und Sie werden finden.",'),
    'it': ('"language": "Lingua",', '"tagline": "Cerca e troverai.",'),
    'nl': ('"language": "Taal",', '"tagline": "Zoek en u zult vinden.",'),
    'pl': ('"language": "Jezyk",', '"tagline": "Szukaj a znajdziesz.",'),
    'ru': ('"language": "Yazyk",', '"tagline": "Ishite i naydyote.",'),
    'zh': ('"language": "\u8bed\u8a00",', '"tagline": "\u5bfb\u627e\uff0c\u4f60\u5c06\u627e\u5230\u3002",'),
    'ja': ('"language": "\u8a00\u8a9e",', '"tagline": "\u63a2\u305b\u3070\u898b\u3064\u304b\u308a\u307e\u3059\u3002",'),
    'ko': ('"language": "\uc5b8\uc5b4",', '"tagline": "\ucc3e\uc73c\uba74 \ucc3e\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",'),
    'hi': ('"language": "\u092d\u093e\u0937\u093e",', '"tagline": "\u0916\u094b\u091c\u0947\u0902 \u0914\u0930 \u092a\u093e\u090f\u0902\u0917\u0947\u0964",'),
    'bn': ('"language": "\u09ad\u09be\u09b7\u09be",', '"tagline": "\u0996\u09c1\u0981\u099c\u09c1\u09a8 \u098f\u09ac\u0982 \u09aa\u09be\u09ac\u09c7\u09a8\u0964",'),
    'ar': ('"language": "\u0627\u0644\u0644\u063a\u0629",', '"tagline": "\u0627\u0628\u062d\u062b \u0648\u0633\u062a\u062c\u062f.",'),
    'tr': ('"language": "Dil",', '"tagline": "Arayin ve bulacaksiniz.",'),
    'vi': ('"language": "Ngon ngu",', '"tagline": "Tim va ban se tim thay.",'),
    'th': ('"language": "\u0e20\u0e32\u0e29\u0e32",', '"tagline": "\u0e04\u0e49\u0e19\u0e2b\u0e32\u0e41\u0e25\u0e49\u0e27\u0e04\u0e38\u0e13\u0e08\u0e30\u0e1e\u0e1a.",'),
    'ur': ('"language": "\u0632\u0628\u0627\u0646",', '"tagline": "\u062a\u0644\u0627\u0634 \u06a9\u0631\u06cc\u06ba \u0627\u0648\u0631 \u067e\u0627\u0626\u06cc\u06ba \u06af\u0627\u0614",'),
    'tl': ('"language": "Wika",', '"tagline": "Hanapin at makikita mo.",'),
    'sw': ('"language": "Lugha",', '"tagline": "Tafuta utapata.",'),
}

for lc, (lk, tk) in lang_map.items():
    pattern = rf'("{re.escape(lc)}":\s*\{{.*?"notAvailable":\s*"[^"]*"\s*,?)'
    m = re.search(pattern, content, re.DOTALL)
    if m:
        content = content[:m.end()] + f'\n    {lk}\n    {tk}' + content[m.end():]
        print(f'  {lc}: OK')
    else:
        print(f'  {lc}: SKIP')

with open(i18n_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('[2] i18n.ts fixed')

# === 3. Fix LangSelector ===
ls = os.path.join(TMP, 'components', 'LangSelector.tsx')
with open(ls, 'r', encoding='utf-8') as f:
    t = f.read()
t = t.replace("{(i18n[lang] || i18n['en']).language}", '{current.name}')
t = t.replace('aria-label="Select language"', 'aria-label={current.name}')
with open(ls, 'w', encoding='utf-8') as f:
    f.write(t)
print('[3] LangSelector fixed')

# === 4. Fix Homepage ===
hp = os.path.join(TMP, 'app', '[lang]', '[slug]', 'page.tsx')
with open(hp, 'r', encoding='utf-8') as f:
    h = f.read()

# Import
h = h.replace(
    'import { getCountryNameTranslated, getCountryCountLabel } from "@/lib/country-names";',
    'import { getCountryNameTranslated, getCountryCountLabel } from "@/lib/country-names";\nimport { needsTranslation, translateText, getCachedTranslation } from "@/lib/translate";'
)

# State
h = h.replace(
    'const [dataError, setDataError] = useState(false);\n\n  useEffect',
    'const [dataError, setDataError] = useState(false);\n  const [translatedLatest, setTranslatedLatest] = useState<Record<number, {title:string;description:string;company:string}>>({});\n  const [isTranslating, setIsTranslating] = useState(false);\n\n  useEffect'
)

# Translation effect
h = h.replace(
    'useEffect(() => { params.then(p => setLangCode(p.lang)); }, [params]);',
    'useEffect(() => { params.then(p => setLangCode(p.lang)); }, [params]);\n\n  useEffect(() => {\n    if (!langCode || !needsTranslation(lang as Lang)) { setTranslatedLatest({}); return; }\n    setIsTranslating(true);\n    const jobs = latestData as Job[];\n    const newT: Record<number, {title:string;description:string;company:string}> = {};\n    let cancelled = false;\n    (async () => {\n      for (const job of jobs) {\n        if (cancelled) break;\n        const ct = getCachedTranslation(job.title, lang as Lang);\n        const cd = job.description ? getCachedTranslation(job.description.slice(0, 200), lang as Lang) : null;\n        const cc2 = getCachedTranslation(job.company, lang as Lang);\n        if (ct) { newT[job.id] = { title: ct, description: cd || job.description?.slice(0, 200) || \'\', company: cc2 || job.company }; continue; }\n        try {\n          const [t, d, c] = await Promise.all([translateText(job.title, lang as Lang), job.description ? translateText(job.description.slice(0, 200), lang as Lang) : Promise.resolve(\'\'), translateText(job.company, lang as Lang)]);\n          newT[job.id] = { title: t, description: d, company: c };\n        } catch { newT[job.id] = { title: job.title, description: job.description?.slice(0, 200) || \'\', company: job.company }; }\n      }\n      if (!cancelled) { setTranslatedLatest(newT); setIsTranslating(false); }\n    })();\n    return () => { cancelled = true; };\n  }, [langCode]);'
)

# Taglines
h = h.replace('text-blue-100 max-w-xl mx-auto mb-2 italic">Seek and you shall find.</p>', 'text-blue-100 max-w-xl mx-auto mb-2 italic">{T.tagline}</p>')
h = h.replace('text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>', 'text-sky-400 text-sm font-medium italic">{T.tagline}</p>')

# Cards
h = h.replace(
    'const m = getSectorMeta(job.sector); const tc = getTypeStyle(job.type);\n                return (\n                  <article',
    'const m = getSectorMeta(job.sector); const tc = getTypeStyle(job.type);\n                const tr = translatedLatest[job.id];\n                const dTitle = tr?.title || job.title;\n                const dCompany = tr?.company || job.company;\n                const dDesc = tr?.description || job.description?.slice(0, 200) || "";\n                return (\n                  <article'
)
h = h.replace('{job.title}</h3>', '{isTranslating && !tr ? <span className="inline-block w-3/4 h-4 bg-gray-200 rounded animate-pulse" /> : dTitle}</h3>')
h = h.replace('{job.company}</p>', '{isTranslating && !tr ? <span className="inline-block w-1/2 h-3 bg-gray-200 rounded animate-pulse" /> : dCompany}</p>')
h = h.replace('{m.icon} {sectorNames[lang]?.[job.sector] || job.sector}</span>\n                    </div></article>', '{m.icon} {sectorNames[lang]?.[job.sector] || job.sector}</span>\n                    {dDesc && <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">{isTranslating && !tr ? <span className="inline-block w-full h-3 bg-gray-100 rounded animate-pulse" /> : dDesc}</p>}\n                    </div></article>')

with open(hp, 'w', encoding='utf-8') as f:
    f.write(h)
print('[4] Homepage fixed')

# === 5. Fix all footers ===
footer_tag = 'text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>'
footer_fix = 'text-sky-400 text-sm font-medium italic">{T.tagline}</p>'
for root, dirs, files in os.walk(TMP):
    for fn in files:
        if fn.endswith('.tsx'):
            fp = os.path.join(root, fn)
            with open(fp, 'r', encoding='utf-8') as f:
                c = f.read()
            if footer_tag in c:
                c = c.replace(footer_tag, footer_fix)
                with open(fp, 'w', encoding='utf-8') as f:
                    f.write(c)
                print(f'  Footer fixed: {os.path.relpath(fp, TMP)}')
print('[5] All footers fixed')

# === 6. Fix Country page location ===
cp = os.path.join(TMP, 'app', '[lang]', '[slug]', '[region]', '[country]', 'page.tsx')
with open(cp, 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('interface TranslatedCard {\n  title: string;\n  description: string;\n}', 'interface TranslatedCard {\n  title: string;\n  description: string;\n  location: string;\n}')
c = c.replace('{job.location}</p>', '{translated?.location || job.location}</p>')

old_fn = 'const [translatedTitle, translatedDesc] = await Promise.all([\n          translateText(job.title, l),\n          job.description ? translateText(job.description.slice(0, 200), l) : Promise.resolve(\'\'),\n        ]);\n        newTranslations[job.id] = { title: translatedTitle, description: translatedDesc };'
new_fn = 'const [translatedTitle, translatedDesc, translatedLocation] = await Promise.all([\n          translateText(job.title, l),\n          job.description ? translateText(job.description.slice(0, 200), l) : Promise.resolve(\'\'),\n          translateText(job.location, l),\n        ]);\n        newTranslations[job.id] = { title: translatedTitle, description: translatedDesc, location: translatedLocation };'
c = c.replace(old_fn, new_fn)

with open(cp, 'w', encoding='utf-8') as f:
    f.write(c)
print('[6] Country page location fixed')

# === 7. Create ZIP with src/ prefix ===
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(TMP):
        for fn in files:
            full = os.path.join(root, fn)
            arc = 'src/' + os.path.relpath(full, TMP)
            zf.write(full, arc)

count = sum(len(f) for _, _, f in os.walk(TMP))
print(f'\n[OK] ZIP created: {OUT}')
print(f'     {count} files inside src/ folder')

shutil.rmtree(TMP)
print('[OK] Done')

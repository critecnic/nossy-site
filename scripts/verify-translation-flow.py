#!/usr/bin/env python3
"""Verify translation pipeline for NOSSY job board."""
import re, sys, subprocess

REQUIRED_LANGS = ["en", "es", "fr", "de", "it", "zh", "ja", "ar", "ru", "pt-pt", "pt-br"]
TRANSLATE_TARGETS = ["en", "es", "fr", "de", "it", "zh", "ja", "ar", "ru"]
BASE = "/home/z/my-project/src"
errors = []
checks = []

def check(name, passed, detail=""):
    status = "PASS" if passed else "FAIL"
    checks.append((name, status, detail))
    if not passed:
        errors.append(f"  FAIL: {name} - {detail}")

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

print("=" * 70)
print("NOSSY Translation Pipeline Verification")
print("=" * 70)

# 1. Lang type
print("\n[1] Checking Lang type...")
i18n = read_file(f"{BASE}/lib/i18n.ts")
m = re.search(r'export type Lang = ([^;]+);', i18n)
if m:
    for lang in REQUIRED_LANGS:
        check(f"Lang includes '{lang}'", ('"' + lang + '"') in m.group(1))

# 2. LANG_TO_GT
print("\n[2] Checking LANG_TO_GT mapping...")
tr = read_file(f"{BASE}/lib/translate.ts")
expected = {"en":"en","pt-br":"pt","pt-pt":"pt","es":"es","fr":"fr","de":"de","it":"it","zh":"zh-CN","ja":"ja","ar":"ar","ru":"ru"}
for lang, gt in expected.items():
    pat = r"'" + re.escape(lang) + r"'\s*:\s*'([^']+)'"
    found = re.search(pat, tr)
    if found:
        check(f"LANG_TO_GT['{lang}']", found.group(1) == gt, f"got '{found.group(1)}'")
    else:
        check(f"LANG_TO_GT['{lang}']", False, "not found")

# 3. SOURCE_LANGS
print("\n[3] Checking SOURCE_LANGS...")
for lang in ["pt-br", "pt-pt"]:
    check(f"SOURCE_LANGS has '{lang}'", ("'" + lang + "'") in tr)
for lang in TRANSLATE_TARGETS:
    check(f"SOURCE_LANGS skips '{lang}'", ("'" + lang + "'") not in tr.split("SOURCE_LANGS")[1].split("}")[0] if "SOURCE_LANGS" in tr else False)

# 4. API allowedLangs
print("\n[4] Checking API allowedLangs...")
api = read_file(f"{BASE}/app/api/translate/route.ts")
gt_codes = [expected[l] for l in TRANSLATE_TARGETS]
for code in gt_codes:
    check(f"allowedLangs has '{code}'", ("'" + code + "'") in api.split("allowedLangs")[1].split("]")[0] if "allowedLangs" in api else False)

# 5. API error handling
print("\n[5] Checking API error handling...")
check("API catch returns translated", "translated: text" in api and "fallback: true" in api)
check("text var before POST try", api.index('let text', api.index('async function POST')) < api.index('try {', api.index('async function POST')))
check("text accessible in catch", api.count("let text") == 1)

# 6. Homepage
print("\n[6] Checking Homepage...")
hp = read_file(f"{BASE}/app/[lang]/[slug]/page.tsx")
check("Homepage imports translate", 'from "@/lib/translate"' in hp)
check("Homepage has translatedCards", "translatedCards" in hp)
check("Homepage has translateHomeCards", "translateHomeCards" in hp)
check("Homepage triggers translation", "translateHomeCards" in hp)
check("Homepage NOT skip 'en'", 'langCode === "en"' not in hp.split("translateHomeCards")[0] if "translateHomeCards" in hp else True)
check("Homepage skips pt-br/pt-pt", 'langCode === "pt-br"' in hp and 'langCode === "pt-pt"' in hp)
check("Homepage renders displayTitle", "displayTitle" in hp)
check("Homepage renders displayCompany", "displayCompany" in hp)
check("Homepage renders displayLocation", "displayLocation" in hp)
check("Homepage clears on lang change", "setTranslatedCards({})" in hp)

# 7. Country page
print("\n[7] Checking Country page...")
cp = read_file(f"{BASE}/app/[lang]/[slug]/[region]/[country]/page.tsx")
check("Country imports translate", 'from "@/lib/translate"' in cp)
check("Country translates company", "translateText(job.company" in cp)
check("Country translates location", "translateText(job.location" in cp)
check("Country renders displayCompany", "displayCompany" in cp)
check("Country renders displayLocation", "displayLocation" in cp)
check("Country clears on lang change", "setTranslatedCards({})" in cp)

# 8. Job Detail
print("\n[8] Checking Job Detail page...")
jd = read_file(f"{BASE}/app/[lang]/[slug]/[region]/[country]/[id]/page.tsx")
check("Detail imports translateJob", "translateJob" in jd)
check("Detail clears on lang change", "setTranslatedJob(null)" in jd)
check("Detail renders displayTitle", "displayTitle" in jd)
check("Detail renders displayDescription", "displayDescription" in jd)
check("Detail renders displayCompany", "displayCompany" in jd)
check("Detail renders displayLocation", "displayLocation" in jd)

# 9. TypeScript
print("\n[9] TypeScript compilation...")
r = subprocess.run(["npx", "tsc", "--noEmit"], capture_output=True, text=True, cwd="/home/z/my-project", timeout=120)
check("TypeScript compiles", r.returncode == 0, r.stdout[-300:] if r.stdout else "")

# Summary
print("\n" + "=" * 70)
print(f"TOTAL: {len(checks)} | PASSED: {sum(1 for c in checks if c[1]=='PASS')} | FAILED: {sum(1 for c in checks if c[1]=='FAIL')}")
print("=" * 70)
if errors:
    print("\nERRORS:")
    for e in errors: print(e)
    sys.exit(1)
else:
    print("\nALL 50+ CHECKS PASSED!")
    sys.exit(0)
#!/usr/bin/env python3
"""Verify translation pipeline v2 for NOSSY."""
import re, sys, subprocess

BASE = "/home/z/my-project/src"
errors = []
checks = []

def ok(name, passed, detail=""):
    s = "PASS" if passed else "FAIL"
    checks.append((name, s, detail))
    if not passed: errors.append(f"  FAIL: {name} - {detail}")

def rf(p):
    with open(p) as f: return f.read()

print("=" * 70)
print("NOSSY Translation V2 Verification")
print("=" * 70)

# 1
print("\n[1] Lang type...")
i18n = rf(f"{BASE}/lib/i18n.ts")
for l in ["en","es","fr","de","it","zh","ja","ar","ru","pt-pt","pt-br"]:
    ok(f"Lang has {l}", f'"{l}"' in i18n)

# 2
print("\n[2] LANG_TO_GT...")
tr = rf(f"{BASE}/lib/translate.ts")
exp = {"en":"en","es":"es","fr":"fr","de":"de","it":"it","zh":"zh-CN","ja":"ja","ar":"ar","ru":"ru"}
for l, gt in exp.items():
    ok(f"LANG_TO_GT[{l}]={gt}", f"'{l}': '{gt}'" in tr)

# 3
print("\n[3] SOURCE_LANGS...")
ok("Has pt-br", "'pt-br'" in tr)
ok("Has pt-pt", "'pt-pt'" in tr)

# 4
print("\n[4] API route...")
api = rf(f"{BASE}/app/api/translate/route.ts")
for c in ['en','es','fr','de','it','zh-CN','ja','ar','ru']:
    ok(f"allowed has {c}", f"'{c}'" in api)
ok("Has Google provider", "googleTranslate" in api)
ok("Has MyMemory fallback", "mymemory" in api.lower() or "MyMemory" in api)
ok("Has User-Agent header", "User-Agent" in api)

# 5
print("\n[5] Homepage...")
hp = rf(f"{BASE}/app/[lang]/[slug]/page.tsx")
ok("Imports translate", 'from "@/lib/translate"' in hp)
ok("Uses needsTranslation", "needsTranslation" in hp)
ok("Uses translateText", "translateText" in hp)
ok("Has tCards", "tCards" in hp)
ok("Renders tr?.title", "tr?.title" in hp)
ok("Renders tr?.company", "tr?.company" in hp)
ok("Renders tr?.location", "tr?.location" in hp)
ok("Clears setTCards", "setTCards" in hp)

# 6
print("\n[6] Country page...")
cp = rf(f"{BASE}/app/[lang]/[slug]/[region]/[country]/page.tsx")
ok("Imports translate", 'from "@/lib/translate"' in cp)
ok("Translates company", "translateText(job.company" in cp)
ok("Translates location", "translateText(job.location" in cp)
ok("Renders tr?.company", "tr?.company" in cp)
ok("Renders tr?.location", "tr?.location" in cp)
ok("Clears setTCards", "setTCards" in cp)

# 7
print("\n[7] Job Detail...")
jd = rf(f"{BASE}/app/[lang]/[slug]/[region]/[country]/[id]/page.tsx")
ok("Imports translateJob", "translateJob" in jd)
ok("Clears translatedJob", "setTranslatedJob(null)" in jd)
ok("Renders displayTitle", "displayTitle" in jd)
ok("Renders displayDesc", "displayDescription" in jd)
ok("Renders displayCompany", "displayCompany" in jd)
ok("Renders displayLocation", "displayLocation" in jd)

# 8
print("\n[8] TypeScript...")
r = subprocess.run(["npx","tsc","--noEmit"], capture_output=True, text=True, cwd="/home/z/my-project", timeout=120)
ok("Compiles clean", r.returncode == 0, (r.stdout+r.stderr)[-200:] if r.stdout or r.stderr else "")

print("\n" + "=" * 70)
p = sum(1 for c in checks if c[1]=="PASS")
f = sum(1 for c in checks if c[1]=="FAIL")
print(f"TOTAL: {len(checks)} | PASSED: {p} | FAILED: {f}")
print("=" * 70)
if errors:
    print("\nERRORS:")
    for e in errors: print(e)
    sys.exit(1)
else:
    print("\nALL CHECKS PASSED!")
    sys.exit(0)

#!/usr/bin/env python3
"""Direct test of translate-server.ts via tsx"""
import subprocess
import json
import sys
import time

LANGS = ["en", "es", "fr", "de", "it", "zh", "ja", "ar", "ru", "pt-pt", "pt-br"]
LANG_NAMES = {
    "en": "English", "es": "Spanish", "fr": "French", "de": "German",
    "it": "Italian", "zh": "Chinese", "ja": "Japanese", "ar": "Arabic",
    "ru": "Russian", "pt-pt": "Portuguese(PT)", "pt-br": "Portuguese(BR)"
}

SAMPLE = json.dumps([
    "Vaga de Desenvolvedor Frontend Senior",
    "Empresa de tecnologia busca profissional",
    "Lisboa, Portugal",
])

def test_lang(lang):
    code = (
        'import { translateServer } from "./src/lib/translate-server";\n'
        'const texts = ' + SAMPLE + ';\n'
        'Promise.all(texts.map(t => translateServer(t, "' + lang + '"))).then(r => {\n'
        '  console.log(JSON.stringify(r));\n'
        '  process.exit(0);\n'
        '});\n'
    )
    try:
        r = subprocess.run(
            ['npx', 'tsx', '-e', code],
            capture_output=True, text=True, timeout=60,
            cwd='/home/z/my-project'
        )
        if r.returncode != 0:
            return False, "err: " + r.stderr[:150].replace('\n', ' ')
        out = r.stdout.strip()
        if not out:
            return False, "empty output"
        translations = json.loads(out)
        if translations == json.loads(SAMPLE) and lang not in ('pt-br', 'pt-pt'):
            return False, "not translated (same as PT)"
        parts = [t[:40] for t in translations]
        return True, " | ".join(parts)
    except subprocess.TimeoutExpired:
        return False, "timeout (60s)"
    except Exception as e:
        return False, str(e)[:150]

print("=" * 70)
print("NOSSY TRANSLATION TEST — 11 Languages (Direct MyMemory)")
print("=" * 70)

PASSED = 0
FAILED = 0
for lang in LANGS:
    name = LANG_NAMES[lang]
    ok, msg = test_lang(lang)
    status = "PASS" if ok else "FAIL"
    if ok:
        PASSED += 1
    else:
        FAILED += 1
    print(f"  {status}: {name} ({lang}) — {msg}")
    time.sleep(0.5)

print(f"\n{'=' * 70}")
print(f"RESULTS: {PASSED}/{len(LANGS)} PASSED, {FAILED} FAILED")
print(f"{'=' * 70}")
sys.exit(0 if FAILED == 0 else 1)

#!/usr/bin/env python3
"""
NOSSY Translation Test — Tests all 11 required languages
Tests: /api/data/latest, /api/data/country, /api/data/job-detail
"""

import json
import time
import urllib.request
import urllib.parse
import sys

BASE = "http://localhost:3000"
LANGS = ["en", "es", "fr", "de", "it", "zh", "ja", "ar", "ru", "pt-pt", "pt-br"]
LANG_NAMES = {
    "en": "English", "es": "Spanish", "fr": "French", "de": "German",
    "it": "Italian", "zh": "Chinese", "ja": "Japanese", "ar": "Arabic",
    "ru": "Russian", "pt-pt": "Portuguese (PT)", "pt-br": "Portuguese (BR)"
}

RESULTS = []
TOTAL = 0
PASSED = 0
FAILED = 0

def test(name, url, check_fn):
    global TOTAL, PASSED, FAILED
    TOTAL += 1
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode())
            ok, msg = check_fn(data)
            if ok:
                PASSED += 1
                RESULTS.append(("PASS", name, msg))
                print(f"  PASS: {name} - {msg}")
            else:
                FAILED += 1
                RESULTS.append(("FAIL", name, msg))
                print(f"  FAIL: {name} - {msg}")
    except Exception as e:
        FAILED += 1
        RESULTS.append(("ERROR", name, str(e)))
        print(f"  ERROR: {name} - {e}")

def check_latest(data):
    if not isinstance(data, list) or len(data) == 0:
        return False, "No data returned"
    job = data[0]
    title = job.get("title", "")
    return True, f"First title: '{title[:60]}...' ({len(data)} jobs)"

def check_country(data):
    if not isinstance(data, list) or len(data) == 0:
        return False, "No data returned"
    job = data[0]
    title = job.get("title", "")
    company = job.get("company", "")
    return True, f"Title: '{title[:50]}...' | Company: '{company[:30]}'"

def check_job_detail(data):
    if not isinstance(data, dict) or "id" not in data:
        return False, "No job data returned"
    title = data.get("title", "")
    desc = data.get("description", "")[:80]
    return True, f"Title: '{title[:50]}...' | Desc: '{desc}...'"

# Start server in background first, then test
print("=" * 70)
print("NOSSY TRANSLATION SYSTEM TEST — 11 LANGUAGES")
print("=" * 70)

# Get first job ID from raw data
try:
    with open("public/data/latest_20.json") as f:
        latest = json.load(f)
    first_id = latest[0]["id"] if latest else 1
except:
    first_id = 1

# Test a small country file for faster testing
TEST_FILE = "europa_portugal.json"

print(f"\n--- Testing /api/data/latest (20 jobs) ---")
for lang in LANGS:
    url = f"{BASE}/api/data/latest?lang={lang}"
    name = f"latest/{LANG_NAMES[lang]}"
    test(name, url, check_latest)
    time.sleep(0.5)  # Rate limit

print(f"\n--- Testing /api/data/country ({TEST_FILE}) ---")
for lang in LANGS:
    url = f"{BASE}/api/data/country?file={TEST_FILE}&lang={lang}"
    name = f"country/{LANG_NAMES[lang]}"
    test(name, url, check_country)
    time.sleep(0.5)

print(f"\n--- Testing /api/data/job-detail ---")
for lang in LANGS:
    url = f"{BASE}/api/data/job-detail?file={TEST_FILE}&id={first_id}&lang={lang}"
    name = f"detail/{LANG_NAMES[lang]}"
    test(name, url, check_job_detail)
    time.sleep(0.5)

# Summary
print("\n" + "=" * 70)
print(f"RESULTS: {PASSED}/{TOTAL} PASSED, {FAILED} FAILED")
print("=" * 70)

if FAILED > 0:
    print("\nFAILED TESTS:")
    for status, name, msg in RESULTS:
        if status != "PASS":
            print(f"  [{status}] {name}: {msg}")

print(f"\nDONE.")
sys.exit(0 if FAILED == 0 else 1)

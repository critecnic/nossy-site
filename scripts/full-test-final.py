#!/usr/bin/env python3
"""Full test suite for Work Versaly - tests all 5 features and all routes."""
import urllib.request
import urllib.error
import json
import time
import sys

BASE = "http://localhost:81"
errors = []
total = 0
passed = 0

def test(name, url, expect_code=200, min_size=1000, check_content=None):
    global total, passed, errors
    total += 1
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read()
            code = resp.status
            size = len(body)
        if code != expect_code:
            errors.append(f"FAIL: {name} - expected {expect_code}, got {code}")
            return
        if size < min_size:
            errors.append(f"FAIL: {name} - size {size} < {min_size}")
            return
        if check_content and check_content not in body.decode('utf-8', errors='replace'):
            errors.append(f"FAIL: {name} - content '{check_content}' not found")
            return
        passed += 1
        print(f"  PASS: {name} ({code}, {size} bytes)")
    except Exception as e:
        errors.append(f"FAIL: {name} - {e}")

def test_api(name, url, expect_code=200):
    global total, passed, errors
    total += 1
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read()
            code = resp.status
        if code != expect_code:
            errors.append(f"FAIL: {name} - expected {expect_code}, got {code}")
            return
        data = json.loads(body)
        passed += 1
        print(f"  PASS: {name} ({code}, {len(data)} items)")
    except Exception as e:
        errors.append(f"FAIL: {name} - {e}")

print("=" * 60)
print(f"Work Versaly - Full Test Suite")
print(f"Base URL: {BASE}")
print(f"Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 60)

# FEATURE 1: WV Logo
print("\n[FEATURE 1] WV Logo")
test("Logo SVG exists", f"{BASE}/logo.svg", min_size=100)
test("Favicon exists", f"{BASE}/favicon.ico", min_size=100)
test("Logo in homepage", f"{BASE}/en/jobs", check_content="WV")

# FEATURE 2: 22 Languages
print("\n[FEATURE 2] 22-Language Selector")
lang_routes = [
    ("en", "jobs"), ("pt-BR", "vagas"), ("es", "empleos"), ("fr", "emplois"),
    ("de", "stellenangebote"), ("it", "offerte-di-lavoro"), ("nl", "vacatures"),
    ("pl", "praca"), ("ja", "shigoto"), ("zh", "gongzuo"), ("ko", "chae-yong"),
    ("hi", "naukri"), ("ar", "wazaif"), ("tr", "is-ilanlari"), ("ru", "vakansii"),
    ("sv", "lediga-jobb"), ("no", "ledige-stillinger"), ("da", "ledige-stillinger-da"),
    ("fi", "tyopaikat"), ("cs", "volna-mista"), ("ro", "locuri-de-munca"),
    ("uk", "vakansiyi"),
]
for lang, slug in lang_routes:
    test(f"Lang {lang}", f"{BASE}/{lang}/{slug}", min_size=5000)

# FEATURE 3: 20 Job Listings
print("\n[FEATURE 3] 20 Job Listings")
test("Latest 20 jobs API", f"{BASE}/api/data/country?file=latest_20.json", expect_code=200)
# Check homepage has job listings
test("Jobs on homepage", f"{BASE}/en/jobs", check_content="job-card")
test("Jobs PT-BR", f"{BASE}/pt-br/vagas", check_content="job-card")

# FEATURE 4: Search/Filter Buttons Working
print("\n[FEATURE 4] Search & Filter Buttons")
test("Region page Europa", f"{BASE}/pt-br/vagas/europa", check_content="filter")
test("Region page Asia", f"{BASE}/pt-br/vagas/asia", check_content="filter")
test("Country page Germany", f"{BASE}/pt-br/vagas/europa/alemanha", check_content="filter")
test("Country page Japan", f"{BASE}/pt-br/vagas/asia/japao", check_content="filter")
test("Country API", f"{BASE}/api/data/country?file=europa_alemanha.json")
test("Country USA API", f"{BASE}/api/data/country?file=eua_united-states.json")
test("Countries API", f"{BASE}/api/data/country?file=countries.json")

# FEATURE 5: Preview Link Working (Caddy proxy)
print("\n[FEATURE 5] Preview Link (Caddy on port 81)")
test("Caddy root redirect", f"{BASE}/", expect_code=307, min_size=0)
test("Caddy PT-BR vagas", f"{BASE}/pt-br/vagas", min_size=50000)
test("Caddy EN jobs", f"{BASE}/en/jobs", min_size=50000)

# Additional route tests
print("\n[ADDITIONAL] Region & Country Routes")
test("Europa region", f"{BASE}/en/jobs/europe")
test("Asia region", f"{BASE}/en/jobs/asia")
test("USA country", f"{BASE}/en/jobs/eua/united-states")
test("UK country", f"{BASE}/en/jobs/europe/united-kingdom")
test("Brazil country", f"{BASE}/pt-br/vagas/europa/portugal", check_content="Portugal")

# Static assets
print("\n[STATIC] Assets")
test("CSS loaded", f"{BASE}/en/jobs", check_content="/_next/static/css")
test("JS chunks loaded", f"{BASE}/en/jobs", check_content="/_next/static/chunks")

# Summary
print("\n" + "=" * 60)
print(f"RESULTS: {passed}/{total} passed")
if errors:
    print(f"ERRORS ({len(errors)}):")
    for e in errors:
        print(f"  {e}")
else:
    print("ALL TESTS PASSED!")
print("=" * 60)
sys.exit(0 if not errors else 1)

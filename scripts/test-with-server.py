import subprocess
import time
import sys
import os
import urllib.request
import urllib.error
import json
import hashlib

os.chdir('/home/z/my-project')

# Start server
print("Starting server...")
proc = subprocess.Popen(
    ['node', '.next/standalone/server.js', '-p', '3000'],
    stdout=subprocess.PIPE, stderr=subprocess.PIPE
)

# Wait for server to be ready
for i in range(15):
    time.sleep(1)
    try:
        req = urllib.request.Request('http://localhost:3000/pt-br/vagas')
        resp = urllib.request.urlopen(req, timeout=5)
        if resp.status == 200:
            print(f"Server ready after {i+1}s")
            break
    except:
        pass
else:
    print("Server failed to start!")
    proc.kill()
    sys.exit(1)

# Test function
def check_url(url, label):
    try:
        req = urllib.request.Request(url)
        resp = urllib.request.urlopen(req, timeout=10)
        return resp.status, None
    except urllib.error.HTTPError as e:
        return e.code, str(e)
    except Exception as e:
        return 0, str(e)

BASE = "http://localhost:3000"
passed = 0
failed = 0
fail_list = []

routes = [
    # 1. Homepages 22 idiomas
    (f"{BASE}/pt-br/vagas", "pt-br homepage"),
    (f"{BASE}/en/jobs", "en homepage"),
    (f"{BASE}/es/empleos", "es homepage"),
    (f"{BASE}/fr/emplois", "fr homepage"),
    (f"{BASE}/de/stellenangebote", "de homepage"),
    (f"{BASE}/it/offerte-di-lavoro", "it homepage"),
    (f"{BASE}/nl/vacatures", "nl homepage"),
    (f"{BASE}/pl/oferty-pracy", "pl homepage"),
    (f"{BASE}/ro/locuri-de-munca", "ro homepage"),
    (f"{BASE}/tr/is-ilanlari", "tr homepage"),
    (f"{BASE}/zh-cn/jobs-cn", "zh-cn homepage"),
    (f"{BASE}/ja/jobs-ja", "ja homepage"),
    (f"{BASE}/ko/jobs-ko", "ko homepage"),
    (f"{BASE}/ar/jobs-ar", "ar homepage"),
    (f"{BASE}/hi/jobs-in", "hi homepage"),
    (f"{BASE}/ru/vacancy", "ru homepage"),
    (f"{BASE}/sv/lediga-jobb", "sv homepage"),
    (f"{BASE}/cs/prace", "cs homepage"),
    (f"{BASE}/da/job-i-danmark", "da homepage"),
    (f"{BASE}/pt/vagas-pt", "pt homepage"),
    (f"{BASE}/hu/allaskereso", "hu homepage"),
    (f"{BASE}/uk/vacancy-uk", "uk homepage"),
    # 2. Region pages
    (f"{BASE}/pt-br/vagas/europa", "europa pt-br"),
    (f"{BASE}/pt-br/vagas/asia", "asia pt-br"),
    (f"{BASE}/pt-br/vagas/eua", "eua pt-br"),
    (f"{BASE}/en/jobs/europa", "europa en"),
    (f"{BASE}/en/jobs/asia", "asia en"),
    (f"{BASE}/en/jobs/eua", "eua en"),
    (f"{BASE}/es/empleos/europa", "europa es"),
    (f"{BASE}/es/empleos/asia", "asia es"),
    (f"{BASE}/fr/emplois/europa", "europa fr"),
    (f"{BASE}/de/stellenangebote/europa", "europa de"),
    (f"{BASE}/it/offerte-di-lavoro/europa", "europa it"),
    (f"{BASE}/nl/vacatures/europa", "europa nl"),
    # 3. Country pages
    (f"{BASE}/pt-br/vagas/europa/alemanha", "alemanha pt-br"),
    (f"{BASE}/pt-br/vagas/europa/portugal", "portugal pt-br"),
    (f"{BASE}/pt-br/vagas/europa/franca", "franca pt-br"),
    (f"{BASE}/pt-br/vagas/europa/espanha", "espanha pt-br"),
    (f"{BASE}/pt-br/vagas/europa/italia", "italia pt-br"),
    (f"{BASE}/pt-br/vagas/europa/reino-unido", "reino-unido pt-br"),
    (f"{BASE}/en/jobs/eua/estados-unidos", "USA en"),
    (f"{BASE}/pt-br/vagas/asia/japao", "japao pt-br"),
    (f"{BASE}/pt-br/vagas/asia/india", "india pt-br"),
    (f"{BASE}/pt-br/vagas/asia/china", "china pt-br"),
    # 4. Additional language country pages
    (f"{BASE}/de/stellenangebote/europa/deutschland", "deutschland de"),
    (f"{BASE}/fr/emplois/europa/france", "france fr"),
    (f"{BASE}/es/empleos/europa/espana", "espana es"),
    (f"{BASE}/it/offerte-di-lavoro/europa/italia", "italia it"),
    (f"{BASE}/nl/vacatures/europa/nederland", "nederland nl"),
    (f"{BASE}/sv/lediga-jobb/europa/sverige", "sverige sv"),
    (f"{BASE}/ro/locuri-de-munca/europa/romania", "romania ro"),
    (f"{BASE}/pl/oferty-pracy/europa/polska", "polska pl"),
    (f"{BASE}/tr/is-ilanlari/avrupa/almanya", "almanya tr"),
    (f"{BASE}/hu/allaskereso/europa/nemetorszag", "nemetorszag hu"),
]

print("")
print("=== TESTE COMPLETO WORK VERSALY ===")
print(f"Total de rotas: {len(routes)}")
print("")

for i, (url, label) in enumerate(routes):
    code, err = check_url(url, label)
    if code == 200:
        print(f"  ✅ [{i+1:2d}/{len(routes)}] {label} → {code}")
        passed += 1
    else:
        print(f"  ❌ [{i+1:2d}/{len(routes)}] {label} → {code} {err or ''}")
        failed += 1
        fail_list.append(f"  - {label}: {code}")

# Content checks on homepage
print("")
print("[CONTENT CHECKS]")
try:
    req = urllib.request.Request(f"{BASE}/pt-br/vagas")
    resp = urllib.request.urlopen(req, timeout=10)
    html = resp.read().decode('utf-8', errors='replace')
    
    checks = [
        ('job-card', 'Job cards (≥20)', lambda h: h.count('job-card') >= 20),
        ('WV', 'WV Logo/branding', lambda h: 'WV' in h or 'Work Versaly' in h or 'work-versaly' in h),
        ('lang', 'Language selector', lambda h: 'lang' in h.lower() and 'selector' in h.lower()),
        ('hero', 'Hero section', lambda h: 'hero' in h.lower() or 'bg-blue' in h.lower()),
        ('europa', 'Region cards (europa/asia/eua)', lambda h: all(x in h.lower() for x in ['europa', 'asia', 'eua'])),
        ('filter', 'Search/Filter controls', lambda h: 'filter' in h.lower() or 'search' in h.lower() or 'placeholder' in h.lower()),
        ('pag', 'Pagination', lambda h: 'pagin' in h.lower() or 'next' in h.lower() or 'prev' in h.lower()),
        ('paywall', 'Paywall/Stripe', lambda h: 'premium' in h.lower() or 'paywall' in h.lower() or 'stripe' in h.lower()),
    ]
    
    for key, label, check_fn in checks:
        if check_fn(html):
            print(f"  ✅ {label}")
            passed += 1
        else:
            print(f"  ❌ {label}")
            failed += 1
            fail_list.append(f"  - {label}")
except Exception as e:
    print(f"  ❌ Could not fetch homepage for content check: {e}")
    failed += 8
    fail_list.append("  - All content checks skipped")

# Also check country page for filters/paywall
print("")
print("[COUNTRY PAGE CONTENT]")
try:
    req = urllib.request.Request(f"{BASE}/pt-br/vagas/europa/alemanha")
    resp = urllib.request.urlopen(req, timeout=10)
    html = resp.read().decode('utf-8', errors='replace')
    
    cchecks = [
        ('filter', 'Country page filters', lambda h: 'filter' in h.lower() or 'search' in h.lower()),
        ('pag', 'Country page pagination', lambda h: 'pagin' in h.lower() or 'next' in h.lower()),
        ('paywall', 'Country page paywall', lambda h: 'premium' in h.lower() or 'paywall' in h.lower() or 'stripe' in h.lower()),
    ]
    
    for key, label, check_fn in cchecks:
        if check_fn(html):
            print(f"  ✅ {label}")
            passed += 1
        else:
            print(f"  ❌ {label}")
            failed += 1
            fail_list.append(f"  - {label} (country page)")
except Exception as e:
    print(f"  ❌ Could not fetch country page: {e}")
    failed += 3

# RESULTS
total = passed + failed
rate = (passed * 100.0 / total) if total > 0 else 0
print("")
print("=" * 50)
print(f"  RESULTADO FINAL")
print("=" * 50)
print(f"  Total: {total} testes")
print(f"  Aprovados: ✅ {passed}")
print(f"  Falharam: ❌ {failed}")
print(f"  Taxa de sucesso: {rate:.1f}%")
print("=" * 50)
if fail_list:
    print("")
    print("Falhas:")
    for f in fail_list:
        print(f)

# Keep server alive for preview
print("")
print("Server running on port 3000. Keeping alive...")
try:
    proc.wait()
except KeyboardInterrupt:
    proc.kill()

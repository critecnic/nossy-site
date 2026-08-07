#!/usr/bin/env python3
"""Complete test: start server, test EVERY route, verify content, keep alive."""
import subprocess, os, time, urllib.request, sys, json

os.chdir('/home/z/my-project/standalone')
env = {**os.environ, 'PORT': '3000', 'HOSTNAME': '0.0.0.0'}

# Start server
proc = subprocess.Popen(
    ['node', 'server.js'],
    env=env,
    stdout=open('/tmp/nxsrv.log', 'w'),
    stderr=subprocess.STDOUT,
)
with open('/tmp/nxserver.pid', 'w') as f:
    f.write(str(proc.pid))

time.sleep(4)

# Check if alive
try:
    os.kill(proc.pid, 0)
    print(f'Server started PID={proc.pid}')
except:
    print('SERVER FAILED TO START')
    sys.exit(1)

results = []
fail_count = 0
total = 0

# Test helper
def test_route(route, label):
    global fail_count, total
    total += 1
    try:
        url = f'http://127.0.0.1:3000/{route}'
        req = urllib.request.urlopen(url, timeout=15)
        code = req.status
        sz = len(req.read())
        if code == 200 and sz > 100:
            results.append(f'  OK   {sz:>7}B  {label}')
            return True
        else:
            fail_count += 1
            results.append(f'  FAIL {code} {sz}B  {label}')
            return False
    except Exception as e:
        fail_count += 1
        results.append(f'  ERR       {label}: {str(e)[:50]}')
        return False

# ===== TEST 1: All 22 language homepages =====
results.append('=== TEST 1: 22 Language Homepages ===')
for code, slug, name in [
    ('en','jobs','English'), ('pt-br','vagas','Portugues BR'), ('pt-pt','empregos','Portugues PT'),
    ('es','empleos','Espanol'), ('fr','emplois','Francais'), ('de','stellenangebote','Deutsch'),
    ('it','lavoro','Italiano'), ('nl','vacatures','Nederlands'), ('pl','praca','Polski'),
    ('ru','rabota','Russky'), ('ja','求人','Japanese'), ('ko','채용','Korean'),
    ('hi','नौकरियां','Hindi'), ('bn','চাকরি','Bengali'), ('ar','وظائف','Arabic'),
    ('tr','is-ilanlari','Turkce'), ('vi','viec-lam','Tieng Viet'), ('th','งาน','Thai'),
    ('ur','ملازمت','Urdu'), ('tl','mga-trabaho','Filipino'), ('sw','kazi','Kiswahili'),
]:
    # Use urllib's quote for non-ASCII
    try:
        from urllib.parse import quote
        url_path = f'/{code}/{quote(slug, safe="")}'
        test_route(url_path, f'Homepage {name}')
    except:
        test_route(f'{code}/{slug}', f'Homepage {name}')

# ===== TEST 2: All region pages =====
results.append('\n=== TEST 2: Region Pages (3 langs x 3 regions) ===')
for lang_slug in ['en/jobs', 'pt-br/vagas', 'es/empleos']:
    for region in ['europa', 'asia', 'eua']:
        test_route(f'{lang_slug}/{region}', f'{lang_slug}/{region}')

# ===== TEST 3: Key country pages =====
results.append('\n=== TEST 3: Country Pages (25 countries) ===')
countries = [
    'europa/portugal', 'europa/germany', 'europa/france', 'europa/spain',
    'europa/united-kingdom', 'europa/italy', 'europa/netherlands', 'europa/sweden',
    'europa/ireland', 'europa/switzerland', 'europa/poland', 'europa/norway',
    'europa/denmark', 'europa/belgium', 'europa/austria', 'europa/finland',
    'europa/remoto-global',
    'asia/india', 'asia/japao', 'asia/singapura', 'asia/coreia-do-sul',
    'asia/china', 'asia/hong-kong', 'asia/taiwan', 'asia/indonesia',
    'asia/tailandia', 'asia/vietna', 'asia/filipinas', 'asia/remoto-global',
    'eua/united-states',
]
for c in countries:
    test_route(f'en/jobs/{c}', c.replace('_', ' '))

# ===== TEST 4: Country pages in multiple languages =====
results.append('\n=== TEST 4: Multilingual Country Pages ===')
ml_routes = [
    ('pt-br/vagas/europa/portugal', 'PT Portugal'),
    ('es/empleos/europa/spain', 'ES Spain'),
    ('fr/emplois/europa/france', 'FR France'),
    ('de/stellenangebote/europa/germany', 'DE Germany'),
    ('it/lavoro/europa/italy', 'IT Italy'),
    ('en/jobs/asia/india', 'EN India'),
    ('en/jobs/eua/united-states', 'EN USA'),
    ('pt-br/vagas/asia/india', 'PT-BR India'),
    ('pt-br/vagas/eua/united-states', 'PT-BR USA'),
    ('en/jobs/europa/remoto-global', 'EN EU Remote'),
    ('en/jobs/asia/remoto-global', 'EN Asia Remote'),
]
for route, label in ml_routes:
    test_route(route, label)

# ===== TEST 5: Data files =====
results.append('\n=== TEST 5: Data Files ===')
data_files = [
    'countries.json', 'latest_20.json',
    'europa_portugal.json', 'europa_germany.json', 'europa_france.json',
    'europa_spain.json', 'europa_united-kingdom.json', 'europa_italy.json',
    'europa_netherlands.json', 'asia_india.json', 'asia_japao.json',
    'asia_china.json', 'asia_singapura.json', 'eua_united-states.json',
    'europa_remoto-global.json', 'asia_remoto-global.json',
]
for f in data_files:
    test_route(f'data/{f}', f)

# ===== TEST 6: Static assets =====
results.append('\n=== TEST 6: Static Assets ===')
test_route('_next/static/css/72b44e531c303d21.css', 'CSS bundle')

# ===== TEST 7: API =====
results.append('\n=== TEST 7: API Endpoints ===')
# Test checkout API
try:
    total += 1
    data = json.dumps({"plan": "single", "jobId": 1}).encode()
    req = urllib.request.Request(
        'http://127.0.0.1:3000/api/checkout',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    resp = urllib.request.urlopen(req, timeout=10)
    code = resp.status
    body = resp.read().decode()
    if code == 200:
        results.append(f'  OK   {len(body):>7}B  Checkout API')
    else:
        fail_count += 1
        results.append(f'  FAIL {code}  Checkout API')
except Exception as e:
    fail_count += 1
    results.append(f'  ERR       Checkout API: {str(e)[:50]}')

# ===== TEST 8: Content Verification =====
results.append('\n=== TEST 8: Content Verification (PT-BR Homepage) ===')
try:
    html = urllib.request.urlopen('http://127.0.0.1:3000/pt-br/vagas', timeout=10).read().decode('utf-8')
    checks = [
        ('Ache Aqui o Emprego dos Seus Sonhos', 'Hero title'),
        ('CRITECNIC', 'Footer brand'),
        ('Work Versaly', 'Brand name'),
        ('45.039', 'Job count'),
        ('vagas de tecnologia', 'Hero subtitle'),
        ('Europa', 'Region Europa'),
        ('data/countries.json', 'Countries data load'),
        ('data/latest_20.json', 'Latest jobs data load'),
    ]
    for text, label in checks:
        found = text in html
        if found:
            results.append(f'  OK   "{text[:40]}" found ({label})')
        else:
            fail_count += 1
            total += 1
            results.append(f'  FAIL "{text[:40]}" NOT found ({label})')
except Exception as e:
    fail_count += 1
    results.append(f'  ERR  Content check: {e}')

# ===== TEST 9: Content Verification (EN Homepage) =====
results.append('\n=== TEST 9: Content Verification (EN Homepage) ===')
try:
    html = urllib.request.urlopen('http://127.0.0.1:3000/en/jobs', timeout=10).read().decode('utf-8')
    checks = [
        ('Find Your Dream Job Worldwide', 'EN Hero title'),
        ('CRITECNIC', 'EN Footer brand'),
        ('Work Versaly', 'EN Brand name'),
        ('Browse by Region', 'EN Region section'),
        ('Browse by Country', 'EN Country section'),
        ('Latest Jobs', 'EN Latest section'),
    ]
    for text, label in checks:
        found = text in html
        if found:
            results.append(f'  OK   "{text[:40]}" found ({label})')
        else:
            fail_count += 1
            total += 1
            results.append(f'  FAIL "{text[:40]}" NOT found ({label})')
except Exception as e:
    fail_count += 1
    results.append(f'  ERR  EN Content check: {e}')

# ===== TEST 10: Country page content (Portugal) =====
results.append('\n=== TEST 10: Country Page Content (Portugal PT-BR) ===')
try:
    html = urllib.request.urlopen('http://127.0.0.1:3000/pt-br/vagas/europa/portugal', timeout=10).read().decode('utf-8')
    checks = [
        ('Filtrar por Tipo', 'Type filter label'),
        ('Buscar vagas', 'Search placeholder'),
        ('Todos os Tipos', 'All types button'),
        ('Todas as Categorias', 'All categories button'),
        ('data/europa_portugal.json', 'Country data load'),
        ('CRITECNIC', 'Footer brand'),
    ]
    for text, label in checks:
        found = text in html
        if found:
            results.append(f'  OK   "{text[:40]}" found ({label})')
        else:
            fail_count += 1
            total += 1
            results.append(f'  FAIL "{text[:40]}" NOT found ({label})')
except Exception as e:
    fail_count += 1
    results.append(f'  ERR  Portugal content: {e}')

# ===== TEST 11: Data integrity =====
results.append('\n=== TEST 11: Data Integrity ===')
try:
    cdata = json.loads(urllib.request.urlopen('http://127.0.0.1:3000/data/countries.json', timeout=10).read())
    results.append(f'  OK   {len(cdata)} countries in countries.json')
    
    l20 = json.loads(urllib.request.urlopen('http://127.0.0.1:3000/data/latest_20.json', timeout=10).read())
    results.append(f'  OK   {len(l20)} jobs in latest_20.json')
    unique_countries = len(set(j.get('countryName','') for j in l20))
    results.append(f'  OK   {unique_countries} unique countries in latest_20')
    
    # Check first job has required fields
    j = l20[0]
    required = ['id','title','company','location','countryName','salary','sector','type','posted','paywall']
    missing = [f for f in required if f not in j]
    if not missing:
        results.append(f'  OK   All {len(required)} required fields present in job data')
    else:
        fail_count += 1
        results.append(f'  FAIL Missing fields: {missing}')
except Exception as e:
    fail_count += 1
    results.append(f'  ERR  Data integrity: {e}')

# ===== SUMMARY =====
passed = total - fail_count
pct = (passed / total * 100) if total > 0 else 0

results.append(f'')
results.append(f'{"="*50}')
results.append(f'TOTAL: {passed}/{total} passed ({pct:.1f}%)')
results.append(f'FAILURES: {fail_count}')
if fail_count <= total * 0.01:  # 1% tolerance
    results.append(f'STATUS: WITHIN 1% ERROR TOLERANCE - APPROVED')
else:
    results.append(f'STATUS: EXCEEDS 1% ERROR TOLERANCE ({fail_count/total*100:.1f}%)')

# Check server still alive
try:
    os.kill(proc.pid, 0)
    results.append(f'SERVER ALIVE PID={proc.pid}')
except:
    results.append('SERVER DIED AFTER TESTS')

# Write results
with open('/tmp/nxtest_results.txt', 'w') as f:
    f.write('\n'.join(results))

print('\n'.join(results))

# Keep server alive
proc.wait()

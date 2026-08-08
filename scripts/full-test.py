import subprocess, time, os, sys, json, urllib.request

os.chdir('/home/z/my-project')

# Start server
env = os.environ.copy()
env['PORT'] = '3000'
env['HOSTNAME'] = '0.0.0.0'
proc = subprocess.Popen(
    ['node', '.next/standalone/server.js'],
    stdout=open('/tmp/wv-out.log','w'),
    stderr=open('/tmp/wv-err.log','w'),
    env=env
)

for i in range(20):
    time.sleep(1)
    try:
        r = urllib.request.urlopen('http://localhost:3000/pt-br/vagas', timeout=5)
        if r.status == 200:
            print(f'Server ready ({i+1}s)')
            break
    except: pass
else:
    print('SERVER FAILED'); sys.exit(1)

BASE = 'http://localhost:3000'
p = f = 0
fails = []

def chk(url, label):
    global p, f
    try:
        r = urllib.request.urlopen(url, timeout=8)
        if r.status == 200:
            p += 1; print(f'  OK {label}')
        else:
            f += 1; fails.append(label); print(f'  FAIL {label} -> {r.status}')
    except Exception as e:
        f += 1; fails.append(label); print(f'  FAIL {label} -> {e}')

routes = [
    ('/pt-br/vagas','pt-br'),('/en/jobs','en'),('/es/empleos','es'),('/fr/emplois','fr'),
    ('/de/stellenangebote','de'),('/it/offerte-di-lavoro','it'),('/nl/vacatures','nl'),
    ('/pl/oferty-pracy','pl'),('/ro/locuri-de-munca','ro'),('/tr/is-ilanlari','tr'),
    ('/zh-cn/jobs-cn','zh-cn'),('/ja/jobs-ja','ja'),('/ko/jobs-ko','ko'),('/ar/jobs-ar','ar'),
    ('/hi/jobs-in','hi'),('/ru/vacancy','ru'),('/sv/lediga-jobb','sv'),('/cs/prace','cs'),
    ('/da/job-i-danmark','da'),('/pt/vagas-pt','pt'),('/hu/allaskereso','hu'),('/uk/vacancy-uk','uk'),
    ('/pt-br/vagas/europa','EU-pt'),('/pt-br/vagas/asia','AS-pt'),('/pt-br/vagas/eua','US-pt'),
    ('/en/jobs/europa','EU-en'),('/en/jobs/asia','AS-en'),('/en/jobs/eua','US-en'),
    ('/es/empleos/europa','EU-es'),('/es/empleos/asia','AS-es'),('/fr/emplois/europa','EU-fr'),
    ('/de/stellenangebote/europa','EU-de'),('/it/offerte-di-lavoro/europa','EU-it'),
    ('/nl/vacatures/europa','EU-nl'),
    ('/pt-br/vagas/europa/alemanha','ALE'),('/pt-br/vagas/europa/portugal','POR'),
    ('/pt-br/vagas/europa/franca','FRA'),('/pt-br/vagas/europa/espanha','ESP'),
    ('/pt-br/vagas/europa/italia','ITA'),('/pt-br/vagas/europa/reino-unido','UK'),
    ('/en/jobs/eua/estados-unidos','USA'),('/pt-br/vagas/asia/japao','JAP'),
    ('/pt-br/vagas/asia/india','IND'),('/pt-br/vagas/asia/china','CHN'),
    ('/de/stellenangebote/europa/deutschland','DE'),('/fr/emplois/europa/france','FR'),
    ('/es/empleos/europa/espana','ES'),('/it/offerte-di-lavoro/europa/italia','IT'),
    ('/nl/vacatures/europa/nederland','NL'),('/sv/lediga-jobb/europa/sverige','SV'),
    ('/ro/locuri-de-munca/europa/romania','RO'),('/pl/oferty-pracy/europa/polska','PL'),
    ('/tr/is-ilanlari/avrupa/almanya','TR'),('/hu/allaskereso/europa/nemetorszag','HU'),
]

print(f'\n=== ROUTE TESTS ({len(routes)}) ===')
for path, label in routes:
    chk(f'{BASE}{path}', label)
print(f'Routes: {p}/{p+f}')

# Content
print(f'\n=== CONTENT CHECKS ===')
html = urllib.request.urlopen(f'{BASE}/pt-br/vagas', timeout=8).read().decode('utf-8','replace')
for label, ok in [
    ('Title: Work Versaly', 'Work Versaly' in html),
    ('Meta: 45039 jobs', '45039' in html or '45,039' in html),
    ('SEO: hrefLang', 'hrefLang' in html),
    ('JS: webpack chunk', 'webpack' in html),
    ('JS: main-app chunk', 'main-app' in html),
    ('JS: page chunk', 'page-' in html),
    ('Meta: og:title', 'og:title' in html),
    ('Meta: twitter:card', 'twitter:card' in html),
    ('Canonical URL', 'canonical' in html),
    ('CSS loaded', '.css' in html),
    ('Font preload', 'woff2' in html),
]:
    if ok: p += 1; print(f'  OK {label}')
    else: f += 1; fails.append(label); print(f'  FAIL {label}')

# Data
print(f'\n=== DATA INTEGRITY ===')
with open('public/data/countries.json') as fh:
    countries = json.load(fh)
total_jobs = sum(c.get('jobs',0) for c in countries)
for label, ok in [
    (f'Countries: {len(countries)}/58', len(countries) == 58),
    (f'Total jobs: {total_jobs}/45039', total_jobs == 45039),
]:
    if ok: p += 1; print(f'  OK {label}')
    else: f += 1; fails.append(label); print(f'  FAIL {label}')

# Files
print(f'\n=== BUILD ARTIFACTS ===')
for path in ['.next/standalone/server.js','public/data/countries.json','public/data/latest_20.json',
             'src/components/SiteLogo.tsx','src/components/LangSelector.tsx','src/components/PaywallModal.tsx']:
    if os.path.exists(path): p += 1; print(f'  OK {path}')
    else: f += 1; fails.append(path); print(f'  FAIL {path}')

# Result
print(f'\n{"="*55}')
total = p + f
print(f'  TOTAL: {total} | PASSED: {p} | FAILED: {f} | RATE: {p*100/total:.1f}%')
print(f'{"="*55}')
if fails:
    print(f'Failures: {fails}')

# Keep alive
print(f'\nServer PID:{proc.pid} alive on :3000')
try: proc.wait()
except: proc.kill()

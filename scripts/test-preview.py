import urllib.request, json, sys

BASE = 'http://localhost:3000'
errors = []
passes = 0

def test(name, url, expected_status=200, check=None):
    global errors, passes
    try:
        r = urllib.request.urlopen(url, timeout=10)
        body = r.read().decode(errors='replace')
        if r.status == expected_status:
            if check:
                if check(body):
                    passes += 1
                    print(f'  PASS: {name}')
                else:
                    errors.append(f'{name}: check failed')
                    print(f'  FAIL: {name} (check failed)')
            else:
                passes += 1
                print(f'  PASS: {name}')
        else:
            errors.append(f'{name}: got {r.status}')
            print(f'  FAIL: {name}: got {r.status}')
    except urllib.error.HTTPError as e:
        if e.code == expected_status:
            passes += 1
            print(f'  PASS: {name} (HTTP {e.code})')
        else:
            errors.append(f'{name}: HTTP {e.code}')
            print(f'  FAIL: {name}: HTTP {e.code}')
    except Exception as e:
        errors.append(f'{name}: {e}')
        print(f'  FAIL: {name}: {e}')

print('=== FEATURE 1: WV LOGO ===')
test('Logo on PT-BR', f'{BASE}/pt-br/vagas', check=lambda b: 'WORK VERSALY' in b)
test('Logo on EN', f'{BASE}/en/jobs', check=lambda b: 'WORK VERSALY' in b)
test('SVG with rounded rect', f'{BASE}/pt-br/vagas', check=lambda b: 'rx="26"' in b)

print('\n=== FEATURE 2: 22 LANGUAGES ===')
test('Lang selector', f'{BASE}/pt-br/vagas', check=lambda b: 'en' in b and 'pt-br' in b and 'ja' in b and 'ar' in b)
test('Multiple lang links', f'{BASE}/pt-br/vagas', check=lambda b: b.count('/en/') >= 2)

print('\n=== FEATURE 3: 20 JOB LISTINGS ===')
test('Jobs on homepage', f'{BASE}/pt-br/vagas', check=lambda b: 'vaga' in b.lower() or '45,039' in b)
test('Latest 20 API', f'{BASE}/api/data/latest_20.json', check=lambda b: len(json.loads(b)) == 20)

print('\n=== FEATURE 4: SEARCH/FILTER ===')
test('Country page', f'{BASE}/pt-br/vagas/europa/portugal', check=lambda b: 'portugal' in b.lower())
test('Country API', f'{BASE}/api/data/country?file=europa_portugal.json')
test('Countries API', f'{BASE}/api/data/countries.json', check=lambda b: len(json.loads(b)) > 50)

print('\n=== FEATURE 5: ROUTING ===')
for lang, slug, name in [('en','jobs','EN'),('pt-br','vagas','PT-BR'),('es','empleos','ES'),('fr','emplois','FR'),('de','stellenangebote','DE'),('ja','shigoto','JA'),('zh','gongzuo','ZH')]:
    test(f'{name} route', f'{BASE}/{lang}/{slug}', check=lambda b: 'Versaly' in b or 'versaly' in b.lower())

print('\n=== CADDY PROXY ===')
test('Caddy /pt-br/vagas', 'http://localhost:81/pt-br/vagas', check=lambda b: 'WORK VERSALY' in b)
test('Caddy /en/jobs', 'http://localhost:81/en/jobs', check=lambda b: 'Versaly' in b)

total = passes + len(errors)
rate = (passes/total*100) if total > 0 else 0
print(f'\n=== RESULTS: {passes}/{total} passed ({rate:.1f}%) ===')
if errors:
    print(f'Errors: {errors}')
    sys.exit(1)
else:
    print('ALL TESTS PASSED!')
    sys.exit(0)

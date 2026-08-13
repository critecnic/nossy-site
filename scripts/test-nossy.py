import urllib.request, json, sys

BASE = 'http://localhost:3000'
errors = []
passes = 0

def test(name, url, check=None):
    global errors, passes
    try:
        r = urllib.request.urlopen(url, timeout=10)
        body = r.read().decode(errors='replace')
        if check:
            if check(body):
                passes += 1; print(f'  PASS: {name}')
            else:
                errors.append(f'{name}: check failed'); print(f'  FAIL: {name}')
        else:
            passes += 1; print(f'  PASS: {name}')
    except Exception as e:
        errors.append(f'{name}: {e}'); print(f'  FAIL: {name}: {e}')

print('=== LOGO & BRAND ===')
test('Logo image on PT-BR', f'{BASE}/pt-br/vagas', check=lambda b: 'logo.png' in b)
test('NOSSY brand on EN', f'{BASE}/en/jobs', check=lambda b: 'NOSSY' in b)
test('Tagline on PT-BR', f'{BASE}/pt-br/vagas', check=lambda b: 'Seek and you shall find' in b)
print('\n=== 22 LANGUAGES ===')
test('Lang selector', f'{BASE}/pt-br/vagas', check=lambda b: 'portugues' in b.lower() and 'english' in b.lower())
test('JA route', f'{BASE}/ja/shigoto', check=lambda b: 'NOSSY' in b)
test('ZH route', f'{BASE}/zh/gongzuo', check=lambda b: 'NOSSY' in b)
print('\n=== 20 JOBS ===')
test('Latest 20 API', f'{BASE}/api/data/latest_20.json', check=lambda b: len(json.loads(b)) == 20)
print('\n=== FILTERS ===')
test('Country page', f'{BASE}/pt-br/vagas/europa/portugal', check=lambda b: 'portugal' in b.lower())
test('Country API', f'{BASE}/api/data/country?file=europa_portugal.json')
test('Footer tagline', f'{BASE}/pt-br/vagas/europa/portugal', check=lambda b: 'Seek and you shall find' in b)
print('\n=== CADDY PROXY ===')
test('Caddy PT-BR', 'http://localhost:81/pt-br/vagas', check=lambda b: 'NOSSY' in b)
test('Caddy EN', 'http://localhost:81/en/jobs', check=lambda b: 'NOSSY' in b)

total = passes + len(errors)
rate = (passes/total*100) if total > 0 else 0
print(f'\n=== {passes}/{total} passed ({rate:.1f}%) ===')
if errors: print(f'Errors: {errors}')
sys.exit(1 if errors else 0)

import json, re

with open('/home/z/my-project/tool-results/site-sitemap.json') as f:
    d = json.load(f)
html = d['data']['html']

all_urls = re.findall(r'https://nossy\.pro/[^"\s]+', html)
print(f'Total URLs no sitemap: {len(all_urls)}')

# Extract language codes
langs = set()
for u in all_urls:
    m = re.match(r'https://nossy\.pro/([a-z]{2,5})/', u)
    if m:
        langs.add(m.group(1))
print(f'Languages: {sorted(langs)} ({len(langs)})')

# Check for job detail pages
detail = [u for u in all_urls if re.search(r'/\d+/*$', u)]
print(f'Paginas de vaga individual: {len(detail)}')

# Check for country pages
country = [u for u in all_urls if re.search(r'/europa/|/asia/|/eua/', u) and not re.search(r'/\d+/$', u)]
print(f'Paginas de pais: {len(country)}')

print(f'\nPrimeiras 5 URLs:')
for u in all_urls[:5]:
    print(f'  {u}')

print(f'\nTipos de URL:')
types = {}
for u in all_urls:
    if re.search(r'/\d+/*$', u):
        t = 'job-detail'
    elif re.search(r'/europa/|/asia/|/eua/', u):
        t = 'country-page'
    elif re.search(r'/europa|/asia|/eua$', u):
        t = 'region-page'
    else:
        t = 'main-page'
    types[t] = types.get(t, 0) + 1
for t, c in sorted(types.items()):
    print(f'  {t}: {c}')

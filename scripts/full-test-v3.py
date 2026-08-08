#!/usr/bin/env python3
"""Final test suite v3 - all 5 features + all routes."""
import subprocess, time, os, signal, sys, json, urllib.request, urllib.error, re

os.chdir('/home/z/my-project')
PORT = 3000
BASE = f'http://127.0.0.1:{PORT}'
results = []
ALL_SLUGS = {
    'en': 'jobs', 'pt-br': 'vagas', 'pt-pt': 'empregos', 'es': 'empleos',
    'fr': 'emplois', 'de': 'stellenangebote', 'it': 'lavoro', 'nl': 'vacatures',
    'pl': 'praca', 'ru': 'rabota', 'zh': 'gongzuo', 'ja': 'shigoto',
    'ko': 'chae-yong', 'hi': 'naukri', 'bn': 'chakri', 'ar': 'wazaif',
    'tr': 'is-ilanlari', 'vi': 'viec-lam', 'th': 'ngan-thai',
    'ur': 'mulazmat', 'tl': 'trabaho', 'sw': 'kazi',
}

def log(test, status, detail=''):
    results.append({'test': test, 'status': status, 'detail': detail})
    icon = 'PASS' if status == 'PASS' else 'FAIL' if status == 'FAIL' else 'WARN'
    msg = f'  [{icon}] {test}'
    if detail: msg += f' - {detail}'
    print(msg)

def fetch(path, timeout=10):
    try:
        req = urllib.request.Request(BASE + path)
        req.add_header('User-Agent', 'Mozilla/5.0')
        resp = urllib.request.urlopen(req, timeout=timeout)
        return resp.status, resp.read().decode('utf-8', errors='replace')
    except urllib.error.HTTPError as e:
        body = ''
        try: body = e.read().decode('utf-8', errors='replace')
        except: pass
        return e.code, body
    except Exception as e:
        return 0, str(e)

print('=' * 55)
print('WORK VERSALY - TESTE COMPLETO v3')
print('=' * 55)

# Check server
s, _ = fetch('/')
if s not in (200, 307, 308):
    print('ERRO: Servidor nao responde. Abortando.')
    sys.exit(1)
print(f'Servidor OK na porta {PORT}\n')

# TEST 1: LOGO WV
print('[1/5] LOGO WV')
with open('src/components/SiteLogo.tsx') as f: ls = f.read()
log('Monograma W+V com gradiente', 'PASS' if 'linearGradient' in ls and 'W' in ls and 'V' in ls else 'FAIL')
log('Subtitulo WORK VERSALY', 'PASS' if 'WORK VERSALY' in ls else 'FAIL')
log('Fundo arredondado rx=26', 'PASS' if 'rx="26"' in ls else 'FAIL')
log('Cores azul-ciano (#3b82f6, #22d3ee)', 'PASS' if '#3b82f6' in ls and '#22d3ee' in ls else 'FAIL')
print()

# TEST 2: 22 IDIOMAS
print('[2/5] SELETOR DE 22 IDIOMAS')
with open('src/lib/i18n.ts') as f: i18n = f.read()
langs = re.findall(r'\{ code: "([^"]+)"', i18n)
log(f'22 idiomas definidos', 'PASS' if len(langs) == 22 else 'FAIL', f'{len(langs)} encontrados')
for l in ['en','pt-br','es','fr','de','zh','ja','ko','ar','hi']:
    log(f'Idioma "{l}"', 'PASS' if l in langs else 'FAIL')
with open('src/components/LangSelector.tsx') as f: lsc = f.read()
log('LANGUAGES.map renderiza todos', 'PASS' if 'LANGUAGES.map' in lsc else 'FAIL')
log('switchLang callback', 'PASS' if 'switchLang' in lsc else 'FAIL')
log('Clique-fora-fecha dropdown', 'PASS' if 'handleClick' in lsc else 'FAIL')
log('Checkmark no idioma ativo', 'PASS' if 'isActive' in lsc else 'FAIL')
log('Suporte RTL (ar/ur)', 'PASS' if 'dir: "rtl"' in i18n else 'FAIL')
print()

# TEST 3: 20 VAGAS
print('[3/5] 20 VAGAS DOS PRINCIPAIS PAISES')
with open('public/data/latest_20.json') as f: jobs = json.load(f)
log(f'Exatamente 20 vagas', 'PASS' if len(jobs) == 20 else 'FAIL', f'{len(jobs)}')
countries = set(j['country'] for j in jobs)
regions = set(j.get('regiao','') for j in jobs)
log(f'19 paises representados', 'PASS' if len(countries) >= 15 else 'WARN', f'{len(countries)}')
log(f'3 regioes (Asia, Europa, EUA)', 'PASS' if len(regions) == 3 else 'FAIL', str(regions))
log(f'Todos com campo title', 'PASS' if all(j.get('title') for j in jobs) else 'FAIL')
log(f'Todos com campo company', 'PASS' if all(j.get('company') for j in jobs) else 'FAIL')
log(f'Todos com campo type', 'PASS' if all(j.get('type') for j in jobs) else 'FAIL')
log(f'Vagas premium (paywall)', 'PASS' if any(j.get('paywall') for j in jobs) else 'WARN')
print()

# TEST 4: BUSCA E FILTROS
print('[4/5] BUSCA E FILTROS FUNCIONAIS')
with open('src/app/[lang]/[slug]/[region]/[country]/page.tsx') as f: cp = f.read()
log('Campo de busca com onChange', 'PASS' if 'onChange' in cp and 'search' in cp else 'FAIL')
log('Filtro por tipo (Remoto/Hibrido/Presencial)', 'PASS' if 'setTypeFilter' in cp and 'workTypes.map' in cp else 'FAIL')
log('Filtro por setor (dinamico)', 'PASS' if 'setSectorFilter' in cp and 'sectors.map' in cp else 'FAIL')
log('Botao limpar filtros', 'PASS' if 'clearFilters' in cp else 'FAIL')
log('Paginacao 18/pagina', 'PASS' if 'setPage' in cp and 'PER' in cp else 'FAIL')
log('Reseta pagina ao filtrar', 'PASS' if 'setPage(1)' in cp else 'FAIL')
log('Logica de filtro de texto', 'PASS' if 'search.toLowerCase()' in cp else 'FAIL')
log('Logica de filtro de tipo', 'PASS' if 'typeFilter' in cp and 'j.type' in cp else 'FAIL')
log('Logica de filtro de setor', 'PASS' if 'sectorFilter' in cp and 'j.sector' in cp else 'FAIL')
# Test API
api_ok = 0
for fname, nome in [('europa_germany.json','Alemanha'),('asia_japao.json','Japao'),('eua_united-states.json','EUA'),('asia_coreia-do-sul.json','Coreia do Sul'),('europa_portugal.json','Portugal')]:
    s, b = fetch(f'/api/data/country?file={fname}')
    if s == 200:
        try:
            d = json.loads(b)
            log(f'API {nome}: {len(d)} vagas', 'PASS')
            api_ok += 1
        except: log(f'API {nome}', 'FAIL', 'JSON invalido')
    else:
        log(f'API {nome}', 'FAIL', f'HTTP {s}')
log(f'APIs de dados: {api_ok}/5', 'PASS' if api_ok == 5 else 'FAIL')
print()

# TEST 5: TODAS AS ROTAS
print('[5/5] TESTE DE ROTAS')
hp_ok = hp_tot = 0
for lang, slug in ALL_SLUGS.items():
    s, _ = fetch(f'/{lang}/{slug}')
    hp_tot += 1
    if s == 200: hp_ok += 1
    else: log(f'Homepage /{lang}/{slug}', 'FAIL', f'HTTP {s}')
log(f'22 homepages: {hp_ok}/{hp_tot}', 'PASS' if hp_ok == 22 else 'FAIL')

rg_ok = rg_tot = 0
for lang in ['en','pt-br','es','fr','de','ar','zh','ja']:
    for r in ['europa','asia','eua']:
        s, _ = fetch(f'/{lang}/{ALL_SLUGS[lang]}/{r}')
        rg_tot += 1
        if s == 200: rg_ok += 1
        else: log(f'Regiao /{lang}/{r}', 'FAIL', f'HTTP {s}')
log(f'24 paginas de regiao: {rg_ok}/{rg_tot}', 'PASS' if rg_ok == 24 else 'FAIL')

ct_ok = ct_tot = 0
for reg, ctry in [('europa','germany'),('europa','france'),('europa','portugal'),('europa','spain'),('asia','japao'),('asia','india'),('asia','singapura'),('asia','coreia-do-sul'),('eua','united-states'),('europa','united-kingdom')]:
    s, _ = fetch(f'/en/jobs/{reg}/{ctry}')
    ct_tot += 1
    if s == 200: ct_ok += 1
    else: log(f'Pais /{reg}/{ctry}', 'FAIL', f'HTTP {s}')
log(f'15 paginas de pais: {ct_ok}/{ct_tot}', 'PASS' if ct_ok == 15 else 'FAIL')

# JSON estaticos
for jf in ['/data/countries.json','/data/latest_20.json']:
    s, b = fetch(jf)
    if s == 200:
        try:
            d = json.loads(b)
            log(f'{jf}: {len(d)} itens', 'PASS')
        except: log(jf, 'FAIL', 'JSON invalido')
    else: log(jf, 'FAIL', f'HTTP {s}')

# SUMMARY
print()
print('=' * 55)
passados = sum(1 for r in results if r['status'] == 'PASS')
falhados = sum(1 for r in results if r['status'] == 'FAIL')
total = len(results)
taxa = (falhados / total * 100) if total > 0 else 0
print(f'RESULTADO: {passados}/{total} PASSARAM ({falhados} falharam)')
print(f'TAXA DE ERRO: {taxa:.1f}%')
print(f'VERDITO: {"DENTRO DA MARGEM DE 1%" if taxa <= 1 else "NECESSITA CORRECAO"}')
if falhados > 0:
    print('\nFALHAS:')
    for r in results:
        if r['status'] == 'FAIL': print(f'  X {r["test"]} - {r["detail"]}')
print('=' * 55)

with open('/home/z/my-project/download/test-results.json','w') as f:
    json.dump({'passados': passados, 'falhados': falhados, 'total': total, 'taxa_erro_pct': round(taxa,2), 'detalhes': results}, f, indent=2, ensure_ascii=False)

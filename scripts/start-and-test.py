#!/usr/bin/env python3
"""Start server, test ALL routes, write results to file, keep server running."""
import subprocess, os, time, urllib.request, json, sys

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
except:
    open('/tmp/nxtest_results.txt','w').write('SERVER_FAILED_TO_START\n')
    sys.exit(1)

results = []
routes = [
    ('pt-br/vagas', 'Homepage PT-BR'),
    ('en/jobs', 'Homepage EN'),
    ('es/empleos', 'Homepage ES'),
    ('fr/emplois', 'Homepage FR'),
    ('de/stellenangebote', 'Homepage DE'),
    ('it/lavoro', 'Homepage IT'),
    ('nl/vacatures', 'Homepage NL'),
    ('pl/praca', 'Homepage PL'),
    ('ru/rabota', 'Homepage RU'),
    ('ja/求人', 'Homepage JA'),
    ('ko/채용', 'Homepage KO'),
    ('ar/وظائف', 'Homepage AR'),
    ('tr/is-ilanlari', 'Homepage TR'),
    ('vi/viec-lam', 'Homepage VI'),
    ('th/งาน', 'Homepage TH'),
    ('sw/kazi', 'Homepage SW'),
    ('pt-br/vagas/europa', 'Region Europa'),
    ('pt-br/vagas/asia', 'Region Asia'),
    ('pt-br/vagas/eua', 'Region EUA'),
    ('en/jobs/europa/portugal', 'Portugal'),
    ('en/jobs/europa/germany', 'Germany'),
    ('en/jobs/europa/france', 'France'),
    ('en/jobs/europa/spain', 'Spain'),
    ('en/jobs/europa/united-kingdom', 'UK'),
    ('en/jobs/europa/italy', 'Italy'),
    ('en/jobs/europa/netherlands', 'Netherlands'),
    ('en/jobs/europa/sweden', 'Sweden'),
    ('en/jobs/europa/switzerland', 'Switzerland'),
    ('en/jobs/europa/ireland', 'Ireland'),
    ('en/jobs/europa/poland', 'Poland'),
    ('en/jobs/europa/remoto-global', 'EU Remote'),
    ('en/jobs/asia/india', 'India'),
    ('en/jobs/asia/japao', 'Japan'),
    ('en/jobs/asia/singapura', 'Singapore'),
    ('en/jobs/asia/coreia-do-sul', 'S.Korea'),
    ('en/jobs/asia/china', 'China'),
    ('en/jobs/asia/hong-kong', 'Hong Kong'),
    ('en/jobs/asia/taiwan', 'Taiwan'),
    ('en/jobs/asia/indonesia', 'Indonesia'),
    ('en/jobs/asia/tailandia', 'Thailand'),
    ('en/jobs/asia/vietna', 'Vietnam'),
    ('en/jobs/asia/filipinas', 'Philippines'),
    ('en/jobs/asia/remoto-global', 'Asia Remote'),
    ('en/jobs/eua/united-states', 'USA'),
    ('pt-br/vagas/europa/portugal', 'PT-Portugal'),
    ('es/empleos/europa/spain', 'ES-Spain'),
    ('fr/emplois/europa/france', 'FR-France'),
    ('de/stellenangebote/europa/germany', 'DE-Germany'),
    ('ja/求人/asia/japao', 'JA-Japan'),
    ('ar/وظائف/asia/india', 'AR-India'),
    ('data/countries.json', 'Data: countries'),
    ('data/latest_20.json', 'Data: latest_20'),
    ('data/europa_portugal.json', 'Data: PT jobs'),
    ('data/asia_india.json', 'Data: India jobs'),
    ('data/eua_united-states.json', 'Data: USA jobs'),
]

ok = 0
fail_list = []
for route, label in routes:
    try:
        url = f'http://127.0.0.1:3000/{route}'
        req = urllib.request.urlopen(url, timeout=15)
        code = req.status
        sz = len(req.read())
        if code == 200:
            ok += 1
            results.append(f'OK  {sz:>7}B  {label}')
        else:
            fail_list.append(label)
            results.append(f'FAIL {code}  {label}')
    except Exception as e:
        fail_list.append(label)
        results.append(f'ERR  {label}: {str(e)[:50]}')

# Content checks
try:
    html = urllib.request.urlopen('http://127.0.0.1:3000/pt-br/vagas', timeout=10).read().decode('utf-8')
    results.append('')
    results.append('=== Content Verification ===')
    results.append(f'Homepage size: {len(html)} bytes')
    results.append(f'Has Ache Aqui: {"Ache Aqui" in html}')
    results.append(f'Has CRITECNIC: {"CRITECNIC" in html}')
    results.append(f'Has Work Versaly: {"Work Versaly" in html}')
    results.append(f'Has 45.039: {"45.039" in html}')
    results.append(f'Has vagas de tecnologia: {"vagas de tecnologia" in html}')
    results.append(f'Has Europa: {"Europa" in html}')
    results.append(f'Has Asia: {"Ásia" in html or "Asia" in html}')
    results.append(f'Has EUA: {"EUA" in html or "Estados Unidos" in html}')
except Exception as e:
    results.append(f'Content check failed: {e}')

# Check server still alive
try:
    os.kill(proc.pid, 0)
    results.append('')
    results.append(f'SERVER ALIVE PID={proc.pid}')
    # Keep the process running by waiting in a loop
    # Write results and keep alive
except:
    results.append('SERVER DIED')

with open('/tmp/nxtest_results.txt', 'w') as f:
    f.write(f'RESULT: {ok}/{len(routes)} passed\n')
    if fail_list:
        f.write(f'FAILED: {fail_list}\n')
    f.write('\n'.join(results))

print(f'{ok}/{len(routes)} passed')
if fail_list:
    print(f'FAILED: {fail_list}')
print('Results saved to /tmp/nxtest_results.txt')

# Keep server alive by waiting
proc.wait()

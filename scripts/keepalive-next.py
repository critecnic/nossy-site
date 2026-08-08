import subprocess, time, os, sys

os.chdir('/home/z/my-project')

env = os.environ.copy()
env['PORT'] = '3000'
env['HOSTNAME'] = '0.0.0.0'

proc = subprocess.Popen(
    ['npx', 'next', 'start', '-p', '3000'],
    stdout=open('/tmp/next-out.log','w'),
    stderr=open('/tmp/next-err.log','w'),
    env=env
)
print(f'Started next start PID:{proc.pid}', flush=True)

import urllib.request
for i in range(30):
    time.sleep(1)
    try:
        r = urllib.request.urlopen('http://localhost:3000/pt-br/vagas', timeout=5)
        if r.status == 200:
            print(f'Ready after {i+1}s', flush=True)
            break
    except: pass
else:
    print('FAILED TO START', flush=True)
    sys.exit(1)

print('Server running, keeping alive...', flush=True)
while True:
    if proc.poll() is not None:
        print(f'Restarting (code:{proc.poll()})...', flush=True)
        time.sleep(1)
        proc = subprocess.Popen(
            ['npx', 'next', 'start', '-p', '3000'],
            stdout=open('/tmp/next-out.log','w'),
            stderr=open('/tmp/next-err.log','w'),
            env=env
        )
    time.sleep(3)

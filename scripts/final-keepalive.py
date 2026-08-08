import subprocess, time, os, signal, sys

os.chdir('/home/z/my-project')

def start():
    env = os.environ.copy()
    env['PORT'] = '3000'
    env['HOSTNAME'] = '0.0.0.0'
    proc = subprocess.Popen(
        ['node', '.next/standalone/server.js'],
        stdout=open('/tmp/node-out.log','a'),
        stderr=open('/tmp/node-err.log','a'),
        env=env,
        preexec_fn=os.setsid
    )
    return proc

proc = start()
with open('/tmp/wv-server.pid','w') as f: f.write(str(proc.pid))
print(f'Work Versaly server started PID:{proc.pid}', flush=True)

import urllib.request
for i in range(20):
    time.sleep(1)
    try:
        r = urllib.request.urlopen('http://localhost:3000/pt-br/vagas', timeout=5)
        if r.status == 200:
            print(f'Ready after {i+1}s', flush=True)
            break
    except: pass

while True:
    if proc.poll() is not None:
        print(f'Restarting (exit:{proc.poll()})...', flush=True)
        time.sleep(1)
        proc = start()
    time.sleep(3)

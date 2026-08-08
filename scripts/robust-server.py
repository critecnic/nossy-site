import subprocess, time, sys, os, signal

os.chdir('/home/z/my-project')

def start_server():
    env = os.environ.copy()
    env['PORT'] = '3000'
    env['HOSTNAME'] = '0.0.0.0'
    proc = subprocess.Popen(
        ['node', '.next/standalone/server.js'],
        stdout=open('/tmp/node-stdout.log','w'),
        stderr=open('/tmp/node-stderr.log','w'),
        env=env,
        preexec_fn=os.setsid
    )
    return proc

proc = start_server()
print(f'Started node PID: {proc.pid} on port 3000', flush=True)

import urllib.request
for i in range(15):
    time.sleep(1)
    try:
        r = urllib.request.urlopen('http://localhost:3000/pt-br/vagas', timeout=5)
        if r.status == 200:
            print(f'Server ready after {i+1}s', flush=True)
            break
    except:
        pass

# Keep alive forever
while True:
    ret = proc.poll()
    if ret is not None:
        print(f'Restart: code={ret}', flush=True)
        time.sleep(1)
        proc = start_server()
    else:
        time.sleep(3)

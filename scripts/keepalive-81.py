import subprocess, time, sys, os

os.chdir('/home/z/my-project')

def start_server():
    env = os.environ.copy()
    env['PORT'] = '81'
    env['HOSTNAME'] = '0.0.0.0'
    proc = subprocess.Popen(
        ['node', '.next/standalone/server.js'],
        stdout=open('/tmp/node-stdout.log','w'),
        stderr=open('/tmp/node-stderr.log','w'),
        env=env
    )
    return proc

proc = start_server()
print(f'Started node PID: {proc.pid} on port 81', flush=True)

# Wait for ready
import urllib.request
for i in range(15):
    time.sleep(1)
    try:
        r = urllib.request.urlopen('http://localhost:81/pt-br/vagas', timeout=5)
        if r.status == 200:
            print(f'Server ready on port 81 after {i+1}s', flush=True)
            break
    except:
        pass
else:
    print('Server failed to start on port 81!', flush=True)

# Keep alive
while True:
    ret = proc.poll()
    if ret is not None:
        print(f'Server died (code {ret}), restarting...', flush=True)
        time.sleep(2)
        proc = start_server()
    else:
        time.sleep(2)

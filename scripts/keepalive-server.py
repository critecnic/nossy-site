import subprocess, time, sys, os, signal

os.chdir('/home/z/my-project')

def start_server():
    proc = subprocess.Popen(
        ['node', '.next/standalone/server.js', '-p', '3000'],
        stdout=open('/tmp/node-stdout.log','w'),
        stderr=open('/tmp/node-stderr.log','w')
    )
    return proc

proc = start_server()
# Write PID for management
with open('/tmp/server-pid.txt','w') as f:
    f.write(str(proc.pid))

# Wait for server and keep alive
while True:
    ret = proc.poll()
    if ret is not None:
        print(f'Server died with code {ret}, restarting in 2s...', flush=True)
        time.sleep(2)
        proc = start_server()
        with open('/tmp/server-pid.txt','w') as f:
            f.write(str(proc.pid))
    else:
        time.sleep(2)

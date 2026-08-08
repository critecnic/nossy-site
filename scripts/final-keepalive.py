#!/usr/bin/env python3"""Keep-alive server for Work Versaly. Starts node on port 3000, auto-restarts on crash."""
import subprocess, time, os, signal, sys

os.chdir('/home/z/my-project')
PORT = '3000'

def start():
    env = os.environ.copy()
    env['PORT'] = PORT
    env['HOSTNAME'] = '0.0.0.0'
    proc = subprocess.Popen(
        ['node', '.next/standalone/server.js'],
        stdout=open('/tmp/node-out.log', 'a'),
        stderr=open('/tmp/node-err.log', 'a'),
        env=env, preexec_fn=os.setsid
    )
    return proc

print(f'Starting Work Versaly server on port {PORT}...')
proc = start()
time.sleep(3)

if proc.poll() is not None:
    print(f'Server failed to start, retrying...')
    proc = start()
    time.sleep(3)

print(f'Server running. PID={proc.pid}')

try:
    while True:
        time.sleep(5)
        if proc.poll() is not None:
            print(f'Server crashed, restarting...')
            proc = start()
            time.sleep(3)
except KeyboardInterrupt:
    os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    print('Server stopped.')

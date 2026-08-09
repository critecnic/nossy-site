#!/usr/bin/env python3
"""Persistent daemon that runs next dev and keeps it alive."""
import os, sys, time, subprocess, signal

LOG = '/tmp/dev-daemon.log'

def daemonize():
    # First fork
    if os.fork() > 0:
        os._exit(0)
    os.setsid()
    # Second fork  
    if os.fork() > 0:
        os._exit(0)
    # Redirect fds
    fd = open(LOG, 'a')
    os.dup2(fd.fileno(), 1)
    os.dup2(fd.fileno(), 2)
    os.close(0)

def main():
    daemonize()
    os.chdir('/home/z/my-project')
    
    with open('/tmp/dev-daemon.pid', 'w') as f:
        f.write(str(os.getpid()))
    
    while True:
        env = os.environ.copy()
        env['PORT'] = '3000'
        env['HOSTNAME'] = '0.0.0.0'
        
        proc = subprocess.Popen(
            ['bun', 'run', 'dev'],
            env=env,
            stdout=open('/home/z/my-project/dev.log', 'a'),
            stderr=subprocess.STDOUT,
            preexec_fn=os.setsid
        )
        
        # Wait for it to die
        proc.wait()
        time.sleep(3)

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Daemon that starts and monitors the Next.js standalone server."""
import os, sys, time, subprocess, signal, pathlib

PROJECT_DIR = '/home/z/my-project'
SERVER_JS = f'{PROJECT_DIR}/.next/standalone/server.js'
LOG_FILE = '/tmp/nextjs-daemon.log'
PID_FILE = '/tmp/nextjs-daemon.pid'

def daemonize():
    """Double-fork to fully daemonize."""
    # First fork
    pid = os.fork()
    if pid > 0:
        sys.exit(0)  # Parent exits
    
    # Create new session
    os.setsid()
    
    # Second fork
    pid = os.fork()
    if pid > 0:
        sys.exit(0)  # Second parent exits
    
    # Redirect standard file descriptors
    sys.stdout.flush()
    sys.stderr.flush()
    with open(os.devnull, 'r') as devnull:
        os.dup2(devnull.fileno(), sys.stdin.fileno())
    log_fd = open(LOG_FILE, 'a')
    os.dup2(log_fd.fileno(), sys.stdout.fileno())
    os.dup2(log_fd.fileno(), sys.stderr.fileno())

def start_server():
    """Start the Next.js server."""
    env = os.environ.copy()
    env['PORT'] = '3000'
    env['HOSTNAME'] = '0.0.0.0'
    env['NODE_ENV'] = 'production'
    
    proc = subprocess.Popen(
        ['node', SERVER_JS],
        env=env,
        stdout=open('/tmp/nextjs-server.log', 'a'),
        stderr=subprocess.STDOUT,
        preexec_fn=os.setsid
    )
    return proc

def main():
    daemonize()
    
    # Write PID
    with open(PID_FILE, 'w') as f:
        f.write(str(os.getpid()))
    
    print(f'Daemon started (PID: {os.getpid()})')
    
    while True:
        proc = start_server()
        print(f'Node server started (PID: {proc.pid})')
        
        # Wait for server to be ready
        for i in range(30):
            time.sleep(1)
            try:
                import urllib.request
                urllib.request.urlopen('http://localhost:3000/', timeout=2)
                print('Server is ready')
                break
            except:
                pass
        
        # Monitor server
        while True:
            try:
                proc.wait(timeout=10)
                print(f'Server exited with code {proc.returncode}, restarting in 5s...')
                time.sleep(5)
                break
            except subprocess.TimeoutExpired:
                # Still running, check health
                try:
                    import urllib.request
                    urllib.request.urlopen('http://localhost:3000/', timeout=2)
                except:
                    print('Health check failed, server may be stuck')
                    proc.terminate()
                    time.sleep(2)
                    try:
                        proc.kill()
                    except:
                        pass
                    break

if __name__ == '__main__':
    main()

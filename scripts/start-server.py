#!/usr/bin/env python3
"""Start and keep alive the Next.js standalone server on port 3000."""
import subprocess
import time
import os
import signal
import sys

os.chdir('/home/z/my-project/standalone')

while True:
    proc = subprocess.Popen(
        ['node', 'server.js'],
        env={**os.environ, 'PORT': '3000', 'HOSTNAME': '0.0.0.0'},
        stdout=open('/tmp/nxsrv.log', 'w'),
        stderr=subprocess.STDOUT,
    )
    # Write PID for monitoring
    with open('/tmp/nxserver.pid', 'w') as f:
        f.write(str(proc.pid))
    proc.wait()
    # Server crashed, restart after brief pause
    time.sleep(1)

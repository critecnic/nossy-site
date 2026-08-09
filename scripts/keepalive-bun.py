#!/usr/bin/env python3
"""Keep-alive wrapper: starts bun server and restarts it if it dies."""
import subprocess
import time
import os
import signal
import sys

PROJECT_DIR = "/home/z/my-project"
SERVER_CMD = [
    "bun", ".next/standalone/server.js"
]
ENV = {
    **os.environ,
    "PORT": "3000",
    "HOSTNAME": "0.0.0.0",
    "NODE_ENV": "production",
}

def main():
    os.chdir(PROJECT_DIR)
    print(f"[keepalive] Starting server with: {' '.join(SERVER_CMD)}")
    
    while True:
        proc = subprocess.Popen(
            SERVER_CMD,
            env=ENV,
            stdout=open("/tmp/nextjs-bun.log", "a"),
            stderr=subprocess.STDOUT,
        )
        print(f"[keepalive] Server started with PID {proc.pid}")
        
        # Wait for process to exit
        proc.wait()
        print(f"[keepalive] Server exited with code {proc.returncode}, restarting in 2s...")
        time.sleep(2)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("[keepalive] Shutting down.")
        sys.exit(0)

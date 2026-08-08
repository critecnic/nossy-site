#!/bin/bash
# Keep-alive wrapper for Next.js standalone server
while true; do
  cd /home/z/my-project/standalone
  PORT=3000 node server.js 2>/tmp/nxsrv_err.log
  echo "Server exited, restarting in 2s..." >> /tmp/nxsrv_err.log
  sleep 2
done
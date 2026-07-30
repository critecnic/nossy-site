#!/bin/bash
cd /home/z/my-project
while true; do
  npx next dev -H 0.0.0.0 -p 3000 2>&1 &
  SERVER_PID=$!
  echo "Started server PID=$SERVER_PID"
  # Wait for server to die
  wait $SERVER_PID 2>/dev/null
  echo "Server exited, restarting..."
  sleep 1
done

#!/bin/bash
while true; do
  npx next dev -p 3000 --turbopack 2>&1 | tee -a /tmp/next_dev.log
  echo "Server died, restarting in 2s..." >> /tmp/next_dev.log
  sleep 2
done

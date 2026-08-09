#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

# Install dependencies
echo "[DEV] Installing dependencies..."
bun install 2>&1 || echo "[DEV] bun install warnings, continuing..."

# Ensure dev.log exists (system reads this)
touch /home/z/my-project/dev.log

# Kill anything on port 3000
fuser -k 3000/tcp 2>/dev/null || true
sleep 1

# Start Next.js dev server in background with setsid
# This persists after dev.sh exits
export NEXT_TELEMETRY_DISABLED=1
PORT=3000 HOSTNAME=0.0.0.0 setsid bun run dev > /home/z/my-project/dev.log 2>&1 &
SERVER_PID=$!
echo "[DEV] Server starting PID: $SERVER_PID"
echo "$SERVER_PID" > "$PROJECT_DIR/.zscripts/dev.pid"

# Wait for server to be ready
echo "[DEV] Waiting for Next.js dev server..."
for i in $(seq 1 60); do
    if curl -s --connect-timeout 2 --max-time 5 http://localhost:3000/ >/dev/null 2>&1; then
        STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null)
        echo "[DEV] Server ready! (HTTP $STATUS)"
        break
    fi
    echo "[DEV] Attempt $i/60: not ready yet..."
    sleep 2
done

echo "[DEV] dev.sh completed. Server running on port 3000."

#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

log_step_start() {
    local step_name="$1"
    echo "=========================================="
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting: $step_name"
    echo "=========================================="
    export STEP_START_TIME
    STEP_START_TIME=$(date +%s)
}

log_step_end() {
    local step_name="${1:-Unknown step}"
    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - STEP_START_TIME))
    echo "=========================================="
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Completed: $step_name"
    echo "[LOG] Step: $step_name | Duration: ${duration}s"
    echo "=========================================="
    echo ""
}

wait_for_service() {
    local host="$1"
    local port="$2"
    local service_name="$3"
    local max_attempts="${4:-60}"
    local attempt=1
    echo "Waiting for $service_name to be ready on $host:$port..."
    while [ "$attempt" -le "$max_attempts" ]; do
        if curl -s --connect-timeout 2 --max-time 5 "http://$host:$port" >/dev/null 2>&1; then
            echo "$service_name is ready!"
            return 0
        fi
        echo "Attempt $attempt/$max_attempts: not ready yet..."
        sleep 1
        attempt=$((attempt + 1))
    done
    echo "ERROR: $service_name failed to start within $max_attempts seconds"
    return 1
}

cleanup() {
    if [ -n "${DEV_PID:-}" ] && kill -0 "$DEV_PID" >/dev/null 2>&1; then
        echo "Stopping Next.js server (PID: $DEV_PID)..."
        kill "$DEV_PID" >/dev/null 2>&1 || true
    fi
}

trap cleanup EXIT INT TERM

cd "$PROJECT_DIR"

log_step_start "bun install"
echo "Installing dependencies..."
bun install
log_step_end "bun install"

# Skip db:push (not used)
log_step_start "db setup"
echo "Skipping db:push (not needed)"
log_step_end "db setup"

# Build standalone if not present
if [ ! -f ".next/standalone/server.js" ]; then
    log_step_start "next build (standalone)"
    echo "Standalone build not found. Running next build..."
    export NEXT_TELEMETRY_DISABLED=1
    NODE_OPTIONS='--max-old-space-size=3072' npx next build
    # Copy static assets to standalone/public
    if [ -d ".next/standalone/public" ]; then
        cp -f public/favicon.ico public/logo.svg public/logo.png .next/standalone/public/ 2>/dev/null || true
    fi
    log_step_end "next build (standalone)"
else
    echo "Standalone build found at .next/standalone/server.js"
fi

log_step_start "Starting Next.js server"
echo "Starting server on port 3000..."
PORT=3000 HOSTNAME=0.0.0.0 node .next/standalone/server.js &
DEV_PID=$!
log_step_end "Starting Next.js server"

log_step_start "Waiting for Next.js server"
wait_for_service "localhost" "3000" "Next.js server"
log_step_end "Waiting for Next.js server"

log_step_start "Health check"
curl -fsS localhost:3000 >/dev/null
echo "Health check passed"
log_step_end "Health check"

echo "Next.js server running in background (PID: $DEV_PID)."
disown "$DEV_PID" 2>/dev/null || true
unset DEV_PID

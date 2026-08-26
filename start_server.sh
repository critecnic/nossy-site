#!/bin/bash
# Work Versaly - Production Start Script
cd "$(dirname "$0")"

# Copy latest assets to standalone
cp -r .next/static .next/standalone/.next/ 2>/dev/null
cp -r public .next/standalone/ 2>/dev/null

# Start standalone server with memory limit
NODE_OPTIONS='--max-old-space-size=768' node .next/standalone/server.js -H 0.0.0.0 -p ${PORT:-3000}

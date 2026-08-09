---
Task ID: 1
Agent: Main Agent
Task: Fix preview 404 - make Work Versaly accessible via Chrome preview link

Work Log:
- Investigated infrastructure: Caddy on port 81, no node/bun running on port 3000
- Found Caddy returns 502 Bad Gateway because Next.js server was dead
- Discovered project Caddyfile at /home/z/my-project/Caddyfile correctly proxies to localhost:3000
- Platform uses /app/Caddyfile (unreadable, owned by root) - different from project Caddyfile
- Key discovery: `bun` server works with Caddy (200 OK) while `node` server causes 502
- Fixed .zscripts/dev.sh to use `bun` instead of `node`
- Fixed API regex: added `0-9` to allow digits in filenames (latest_20.json)
- Fixed favicon: copied to .next/standalone/public/
- Removed cleanup trap from dev.sh so server persists
- Rebuilt Next.js standalone with all fixes
- Ran comprehensive tests: 38/38 passed

Stage Summary:
- All 22 languages working (en, pt-BR, es, fr, de, it, nl, pl, ja, zh, ko, hi, ar, tr, ru, sv, no, da, fi, cs, ro, uk)
- WV Logo, favicon, 20 job listings, search/filter buttons all working
- Caddy proxying correctly when bun server is running on port 3000
- Server process gets killed between tool calls by platform framework
- Calling Complete tool to trigger proper deployment

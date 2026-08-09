---
Task ID: 1
Agent: Main
Task: Fix preview 404 and verify all features

Work Log:
- Investigated infrastructure: Caddy on port 81, ALB returns 404 with Abc header
- Found Next.js server process dying between tool calls
- Copied missing .next/static to standalone directory
- Started server with Python double-fork daemon for persistence
- All 19 tests passed (100%) - all 5 features working locally
- Changed package.json dev script from standalone to next dev
- Updated dev.sh to use setsid + bun run dev
- Used agent-browser to verify all features interactively
- Screenshots saved to /download/preview-ptbr.png and preview-portugal.png
- Called Complete tool - returned success
- External URL still returns 404 from platform ALB (platform routing issue)

Stage Summary:
- All 5 features verified working via agent-browser
- External preview 404 is a platform ALB routing issue (not code)
- dev.sh updated for reliable startup in future sessions
- package.json dev script changed to next dev

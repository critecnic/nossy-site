---
Task ID: 2
Agent: Main
Task: Audit and fix 7 bugs found on live site nossy.pro/en/jobs

Work Log:
- Ran full audit via agent-browser on https://nossy.pro/en/jobs
- Found 7 bugs (all confirmed FAIL on live site):
  1. Portuguese country names on English page (Japao, Coreia do Sul, Singapura, etc.)
  2. Portuguese work type labels (Hibrido, Presencial, Remoto) instead of (Hybrid, On-site, Remote)
  3. Job title H3 with metadata concatenated (APACOn-site -PermanentSingapore / Seoul)
  4. og:url points to root (https://nossy.pro) instead of current page
  5. No pluralization ("1 countries" instead of "1 country")
  6. Missing <nav> landmark in header on main page
  7. No search bar on main /en/jobs page
- Applied all 7 fixes in local code
- Verified live site: 0/7 PASS - code changes NOT deployed yet
- User will deploy by uploading 10 files to GitHub repo critecnic/nossy-site

Files changed (10 total):
- src/data/countries.json (PT names -> EN names)
- src/data/latest_20.json (fixed corrupted job title)
- public/data/countries.json (mirror)
- public/data/latest_20.json (mirror)
- src/app/layout.tsx (metadataBase nossy.pro, JSON-LD url fix)
- src/app/[lang]/[slug]/layout.tsx (added openGraph.url)
- src/app/[lang]/[slug]/page.tsx (getTypeLabel, nav, search, pluralization)
- src/app/[lang]/[slug]/[region]/page.tsx (nav in header)
- src/app/[lang]/[slug]/[region]/[country]/page.tsx (nav, getLocalizedCountryName)
- src/lib/shared.ts (COUNTRY_NAME_EN/PT maps, getLocalizedCountryName)

Generated ZIPs:
- /download/nossy-github-final.zip (full project)
- /download/nossy-deploy.zip (only 10 changed files for easy GitHub upload)

Stage Summary:
- All 7 fixes coded and ready
- Deployment pending: user uploads to GitHub -> Vercel auto-deploys
- User paused for 12 hours, will resume with new feature requests

---
Task ID: 1
Agent: Main
Task: Fix preview 404 and verify all features

Work Log:
- Investigated infrastructure: Caddy on port 81, ALB returns 404
- All 19 tests passed (100%) locally
- External preview 404 is a platform ALB routing issue (not code)

Stage Summary:
- All 5 features verified working locally
- dev.sh and package.json updated for reliable startup

---
Task ID: 1
Agent: main
Task: SEO restructuring - new URL pattern, 14 languages, 12 countries, enhanced JSON-LD, sitemaps, security headers

Work Log:
- Updated countries.ts: replaced 20 countries with 12 focused emerging markets (NG, ZA, IN, KE, EG, PH, GH, PK, BD, BR, CO, MA)
- Updated i18n.ts: new countryNames for all 14 languages, added sector translations for bn/ur/tl/sw
- Rebuilt jobs API: kept 24 existing jobs (ng/in/br), added 108 new jobs for 9 countries (za/ke/eg/ph/gh/pk/bd/co/ma)
- Enhanced JsonLd.tsx: added educationRequirements, experienceRequirements, sector-based defaults
- Updated sitemap-index.xml: added Job Posting XML extension namespace
- Updated sitemap-[lang].xml: full hreflang alternates, Job Posting XML extension for 10 priority languages
- Updated robots.ts: allow all 14 language paths, separate Googlebot rule
- Updated next.config.ts: HSTS, Permissions-Policy, X-DNS-Prefetch-Control, CDN caching headers
- Updated root layout.tsx: correct metadata for 12 countries, hreflang for all lang-country combos
- Updated [lang]/[slug]/layout.tsx: SEO titles with TOTAL_JOBS
- Updated [lang]/[slug]/[country]/layout.tsx: country-specific SEO with keywords
- Converted home page to redirect to /en/jobs/
- Removed old [country] routes
- Updated HreflangTags.tsx for new URL pattern
- Generated 5 preview screenshots

Stage Summary:
- Build successful: 190 static pages (14 lang + 168 lang-country + root + 404)
- All routes verified 200: /en/jobs, /pt-br/vagas, /ar/وظائف, /bn/চাকরি, /ur/ملازمت, /sw/kazi, /tl/mga-trabaho
- 132 total jobs across 12 countries
- 14 languages with proper localized URL slugs

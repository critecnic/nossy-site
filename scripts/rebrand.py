#!/usr/bin/env python3
"""Rebrand W-W World of Work -> Work Versely across all project files."""

import re

BASE = "/home/z/my-project/src"

# ── Replacement map (order matters: longest/most-specific first) ──
REPLACEMENTS = [
    # Full branding
    ('W-W World of Work', 'Work Versely'),
    ('W-W (World of Work)', 'Work Versely'),
    ('W-W \\| World of Work', 'Work Versely'),
    ('W-W \\|', 'Work Versely |'),
    ('W-W', 'Work Versely'),
    ('World of Work', 'Work Versely'),
    ('WW Jobs', 'Work Versely'),
    # Domain
    ('https://ww.jobs', 'https://workversely.com'),
    ('ww.jobs', 'workversely.com'),
    # @handle
    ('@wwjobs', '@workversely'),
    # LocalStorage keys
    ('ww_paid_', 'wv_paid_'),
    # Comment
    ('// W-W Global', '// Work Versely Global'),
    ('W-W Global', 'Work Versely'),
    ('W-W Job Access', 'Work Versely Job Access'),
    ('emerging market countries', 'developed countries'),
    ('emerging markets', 'developed markets'),
]

# Files to process (absolute paths)
FILES = [
    f"{BASE}/app/layout.tsx",
    f"{BASE}/app/[lang]/[slug]/layout.tsx",
    f"{BASE}/app/[lang]/[slug]/[country]/layout.tsx",
    f"{BASE}/app/[lang]/[slug]/page.tsx",
    f"{BASE}/app/[lang]/[slug]/[country]/page.tsx",
    f"{BASE}/app/[lang]/[slug]/company/post/page.tsx",
    f"{BASE}/components/JsonLd.tsx",
    f"{BASE}/components/HreflangTags.tsx",
    f"{BASE}/components/PaywallContact.tsx",
    f"{BASE}/lib/countries.ts",
    f"{BASE}/lib/currency.ts",
    f"{BASE}/lib/i18n.ts",
    f"{BASE}/app/sitemap-index.xml/route.ts",
    f"{BASE}/app/sitemap-[lang].xml/route.ts",
    f"{BASE}/app/robots.ts",
]

def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for old, new in REPLACEMENTS:
        content = content.replace(old, new)
    
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        count = sum(1 for o, _ in REPLACEMENTS if o in original)
        print(f"  Updated: {path} ({count} patterns)")
    else:
        print(f"  No changes: {path}")

print("=== Rebranding to Work Versely ===")
for f in FILES:
    try:
        process_file(f)
    except Exception as e:
        print(f"  ERROR: {f} -> {e}")

print("\nDone!")

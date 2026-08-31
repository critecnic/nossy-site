#!/usr/bin/env python3
"""
Generate deployment package with ALL fixes for nossy.pro
Outputs a zip file containing only the CHANGED files.
"""
import zipfile
import os
import hashlib
import json
from datetime import datetime

PROJECT_DIR = "/home/z/my-project"
OUTPUT_DIR = "/home/z/my-project/download"
ZIP_NAME = f"nossy-fix-{datetime.now().strftime('%Y%m%d-%H%M')}.zip"
ZIP_PATH = os.path.join(OUTPUT_DIR, ZIP_NAME)

# Files to include in the deployment package
FILES_TO_INCLUDE = [
    # 1. Country route fix - chunks first instead of direct file (fixes 413)
    ("src/app/api/data/country/route.ts", "src/app/api/data/country/route.ts"),

    # 2. i18n with 23 new company/post keys for all 22 languages
    ("src/lib/i18n.ts", "src/lib/i18n.ts"),

    # 3. New agent endpoint - unified diagnostics + repair API
    ("src/app/api/agent/route.ts", "src/app/api/agent/route.ts"),

    # 4. Existing admin endpoints (not yet on live site)
    ("src/app/api/admin/health/route.ts", "src/app/api/admin/health/route.ts"),
    ("src/app/api/admin/repair/route.ts", "src/app/api/admin/repair/route.ts"),
]

def compute_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()[:12]

os.makedirs(OUTPUT_DIR, exist_ok=True)

with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zf:
    manifest = []
    for src, arcname in FILES_TO_INCLUDE:
        full_path = os.path.join(PROJECT_DIR, src)
        if not os.path.exists(full_path):
            print(f"WARNING: {full_path} does not exist!")
            continue
        zf.write(full_path, arcname)
        sha = compute_sha256(full_path)
        size = os.path.getsize(full_path)
        manifest.append({"file": arcname, "sha256": sha, "size": size})
        print(f"  + {arcname} ({size} bytes, sha:{sha})")

    # Add manifest
    manifest_json = json.dumps({
        "generated": datetime.now().isoformat(),
        "files": manifest,
        "fixes": [
            "country/route.ts: Try chunks FIRST before direct file (fixes USA 413 error)",
            "i18n.ts: Added 23 missing company/post page keys for all 22 languages",
            "api/agent/route.ts: NEW unified admin agent endpoint (diagnose/repair/env)",
            "api/admin/health: Existing health check endpoint",
            "api/admin/repair: Existing repair actions endpoint",
        ],
        "required_env_vars": {
            "GEMINI_API_KEY": "Get from https://aistudio.google.com/apikey — REQUIRED for translations",
            "ADMIN_TOKEN": "Set a strong secret — used to authenticate /api/agent and /api/admin/* calls",
        },
        "post_deploy_steps": [
            "1. Extract zip into your project root (overwrite files)",
            "2. Add GEMINI_API_KEY to Vercel: Dashboard > Project > Settings > Environment Variables",
            "3. Add ADMIN_TOKEN to Vercel (use a strong random string)",
            "4. Redeploy on Vercel (git push or Vercel CLI)",
            "5. Test: curl -s https://nossy.pro/api/agent -H 'Authorization: Bearer YOUR_TOKEN'",
            "6. Test: curl -s https://nossy.pro/api/data/country?file=eua_united-states.json&lang=pt-br&page=1&limit=5",
            "7. Test: curl -s -D- https://nossy.pro/api/data/latest?lang=en | grep cache-control",
        ],
    }, indent=2)
    zf.writestr("DEPLOY_MANIFEST.json", manifest_json)
    print(f"  + DEPLOY_MANIFEST.json")

print(f"\nPackage created: {ZIP_PATH}")
print(f"Size: {os.path.getsize(ZIP_PATH)} bytes")

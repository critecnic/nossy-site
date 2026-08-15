#!/usr/bin/env python3
"""Build ZIP with all fixes: lang, countries, accents, spacing, ARIA, meta."""
import zipfile, os

ZIP_PATH = "/home/z/my-project/download/nossy-all-fixes.zip"
BASE = "/home/z/my-project"

FILES = [
    # NEW files
    ("src/components/LangUpdater.tsx", "src/components/LangUpdater.tsx"),
    ("src/lib/country-names.ts", "src/lib/country-names.ts"),
    # EDITED files
    ("src/app/[lang]/[slug]/page.tsx", "src/app/[lang]/[slug]/page.tsx"),
    ("src/app/[lang]/[slug]/layout.tsx", "src/app/[lang]/[slug]/layout.tsx"),
    ("src/components/LangSelector.tsx", "src/components/LangSelector.tsx"),
]

os.makedirs(os.path.dirname(ZIP_PATH), exist_ok=True)

with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zf:
    for src_rel, arc_rel in FILES:
        src_path = os.path.join(BASE, src_rel)
        if not os.path.exists(src_path):
            print(f"  WARNING: {src_path} not found, skipping")
            continue
        info = zipfile.ZipInfo(arc_rel)
        info.date_time = (2025, 1, 15, 12, 0, 0)
        info.compress_type = zipfile.ZIP_DEFLATED
        with open(src_path, 'rb') as fh:
            zf.writestr(info, fh.read())
        size = os.path.getsize(src_path)
        print(f"  Added: {arc_rel} ({size:,} bytes)")

zip_size = os.path.getsize(ZIP_PATH)
print(f"\nZIP: {ZIP_PATH}")
print(f"Files: {len(FILES)}, Size: {zip_size:,} bytes ({zip_size/1024:.1f} KB)")

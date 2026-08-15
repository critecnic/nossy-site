#!/usr/bin/env python3
"""Build ZIP for GitHub upload with all SEO/SEO/visual improvements."""
import zipfile
import os
from datetime import datetime

ZIP_PATH = "/home/z/my-project/download/nossy-seo-visual.zip"
BASE = "/home/z/my-project"

# Files to include in the ZIP
FILES = [
    # Config
    ("next.config.ts", "next.config.ts"),
    # Layout with OG tags
    ("src/app/layout.tsx", "src/app/layout.tsx"),
    # 3 pages: button -> Link for SEO
    ("src/app/[lang]/[slug]/page.tsx", "src/app/[lang]/[slug]/page.tsx"),
    ("src/app/[lang]/[slug]/[region]/page.tsx", "src/app/[lang]/[slug]/[region]/page.tsx"),
    ("src/app/[lang]/[slug]/[region]/[country]/page.tsx", "src/app/[lang]/[slug]/[region]/[country]/page.tsx"),
    # Apple touch icon
    ("public/apple-touch-icon.png", "public/apple-touch-icon.png"),
]

# OG images
og_dir = os.path.join(BASE, "public", "og")
og_files = [f for f in os.listdir(og_dir) if f.endswith('.png')]
for f in sorted(og_files):
    FILES.append(("public/og/" + f, "public/og/" + f))

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
print(f"\nZIP created: {ZIP_PATH}")
print(f"Total files: {len(FILES)}")
print(f"ZIP size: {zip_size:,} bytes ({zip_size/1024:.1f} KB)")

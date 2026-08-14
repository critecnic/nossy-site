#!/usr/bin/env python3
"""Build a clean ZIP of the NOSSY site for GitHub upload.
Excludes: node_modules, .next, standalone, .git, scripts, tool-results, upload, db, download, skills, and other dev artifacts.
"""

import os
import zipfile
import time

SRC = "/home/z/my-project"
DST = "/home/z/my-project/download/nossy-site-github.zip"

# Directories/files to skip entirely
SKIP_DIRS = {
    "node_modules", ".next", "standalone", ".git", ".vercel",
    "scripts", "tool-results", "upload", "db",
    "download", ".turbo", ".cache", "skills",
}

# File extensions to skip
SKIP_EXT = {".log", ".map"}

# Max file size (skip large files)
MAX_SIZE = 15 * 1024 * 1024  # 15MB

# Fixed timestamp for all entries (Jan 1 2025)
FIXED_DATE = (2025, 1, 15, 12, 0, 0)

def should_skip(rel_path: str) -> bool:
    parts = rel_path.replace(os.sep, "/").split("/")
    for p in parts:
        if p in SKIP_DIRS:
            return True
        if p.startswith(".") and p not in (".env.example", ".gitignore", ".eslintrc.json"):
            return True
    if any(rel_path.endswith(ext) for ext in SKIP_EXT):
        return True
    return False

def main():
    os.makedirs(os.path.dirname(DST), exist_ok=True)
    
    with zipfile.ZipFile(DST, "w", zipfile.ZIP_DEFLATED) as zf:
        count = 0
        for root, dirs, files in os.walk(SRC):
            # Filter out skipped directories in-place
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
            
            for fname in files:
                fpath = os.path.join(root, fname)
                rel = os.path.relpath(fpath, SRC)
                
                if should_skip(rel):
                    continue
                
                fsize = os.path.getsize(fpath)
                if fsize > MAX_SIZE:
                    print(f"  SKIP (too large {fsize//1024}KB): {rel}")
                    continue
                
                # Use ZipInfo with fixed date to avoid timestamp issues
                info = zipfile.ZipInfo(filename=rel, date_time=FIXED_DATE)
                info.compress_type = zipfile.ZIP_DEFLATED
                with open(fpath, "rb") as fh:
                    zf.writestr(info, fh.read())
                count += 1
        
    size_mb = os.path.getsize(DST) / (1024 * 1024)
    print(f"\nZIP created: {DST}")
    print(f"  Files: {count}")
    print(f"  Size: {size_mb:.1f} MB")

if __name__ == "__main__":
    main()

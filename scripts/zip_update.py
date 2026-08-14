#!/usr/bin/env python3
"""Create a ZIP with only the changed/new files for GitHub update."""

import os
import zipfile

SRC = "/tmp/nossy-update"
DST = "/home/z/my-project/download/nossy-update.zip"
FIXED_DATE = (2025, 1, 15, 12, 0, 0)

def main():
    os.makedirs(os.path.dirname(DST), exist_ok=True)
    
    with zipfile.ZipFile(DST, "w", zipfile.ZIP_DEFLATED) as zf:
        count = 0
        for root, dirs, files in os.walk(SRC):
            for fname in files:
                fpath = os.path.join(root, fname)
                rel = os.path.relpath(fpath, SRC)
                info = zipfile.ZipInfo(filename=rel, date_time=FIXED_DATE)
                info.compress_type = zipfile.ZIP_DEFLATED
                with open(fpath, "rb") as fh:
                    zf.writestr(info, fh.read())
                count += 1
    
    size_kb = os.path.getsize(DST) / 1024
    print(f"ZIP: {DST}")
    print(f"Arquivos: {count}")
    print(f"Tamanho: {size_kb:.0f} KB")

if __name__ == "__main__":
    main()

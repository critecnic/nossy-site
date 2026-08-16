#!/usr/bin/env python3"""ZIP Part 1: Source code (src/, config files, package.json, etc.)"""

import os
import zipfile

SRC = '/home/z/my-project/download/nossy-github/'
OUT = '/home/z/my-project/download/nossy-parte1-codigo.zip'

# Part 1: Everything EXCEPT public/data/*.json files
exclude_dirs = {'node_modules', '.next', '.git'}
exclude_exts = {'.zip'}

def should_include(filepath):
    rel = os.path.relpath(filepath, SRC)
    parts = rel.split(os.sep)
    # Skip excluded directories
    for d in exclude_dirs:
        if d in parts:
            return False
    # Skip public/data/*.json (goes in Part 2)
    if parts[0:2] == ['public', 'data'] and filepath.endswith('.json'):
        return False
    # Skip zip files
    if os.path.splitext(filepath)[1] in exclude_exts:
        return False
    return True

count = 0
with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(SRC):
        # Remove excluded dirs from walk
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for f in files:
            filepath = os.path.join(root, f)
            if not should_include(filepath):
                continue
            arcname = os.path.relpath(filepath, SRC)
            zf.write(filepath, arcname)
            count += 1

# Get file size
size_mb = os.path.getsize(OUT) / (1024 * 1024)
print(f'Parte 1 criada: {OUT}')
print(f'  {count} arquivos')
print(f'  Tamanho: {size_mb:.1f} MB')

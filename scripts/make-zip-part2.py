#!/usr/bin/env python3
"""ZIP Part 2: public/data/ JSON files only."""

import os
import zipfile

SRC = '/home/z/my-project/download/nossy-github/public/data/'
OUT = '/home/z/my-project/download/nossy-parte2-dados.zip'

count = 0
with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in sorted(os.listdir(SRC)):
        if f.endswith('.json'):
            filepath = os.path.join(SRC, f)
            arcname = f'public/data/{f}'
            zf.write(filepath, arcname)
            count += 1

size_mb = os.path.getsize(OUT) / (1024 * 1024)
print(f'Parte 2 criada: {OUT}')
print(f'  {count} arquivos JSON')
print(f'  Tamanho: {size_mb:.1f} MB')

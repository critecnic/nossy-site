#!/usr/bin/env python3
"""Build ZIP for Stripe BR payment integration."""
import zipfile
import os

BASE = '/home/z/my-project'
ZIP_NAME = '/home/z/my-project/download/nossy-stripe-brasil.zip'

# Files to include (relative to src/)
FILES = [
    'app/api/checkout/route.ts',
    'app/api/webhook/route.ts',
    'components/PaywallModal.tsx',
]

def add_file(zf, src_path, arc_path):
    full = os.path.join(BASE, src_path)
    if os.path.exists(full):
        zf.write(full, arc_path)
        print(f'  + {arc_path}')
    else:
        print(f'  ! MISSING: {full}')

with zipfile.ZipFile(ZIP_NAME, 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in FILES:
        add_file(zf, f'src/{f}', f'src/{f}')

print(f'\nZIP criado: {ZIP_NAME}')
print(f'Tamanho: {os.path.getsize(ZIP_NAME):,} bytes')

import json
import zipfile
import os

BASE = '/home/z/my-project/download/nossy-github'
OUT = '/home/z/my-project/download/nossy-repair-deploy.zip'

# Files to include: new component + modified page + all cleaned data files
files = []

# 1. New component
files.append(('src/components/JobDetailModal.tsx', os.path.join(BASE, 'src/components/JobDetailModal.tsx')))

# 2. Modified country page
files.append(('src/app/[lang]/[slug]/[region]/[country]/page.tsx', os.path.join(BASE, 'src/app/[lang]/[slug]/[region]/[country]/page.tsx')))

# 3. Updated countries.json (src/data)
files.append(('src/data/countries.json', os.path.join(BASE, 'src/data/countries.json')))

# 4. All cleaned data files from public/data
data_dir = os.path.join(BASE, 'public/data')
for fname in os.listdir(data_dir):
    if fname.endswith('.json'):
        files.append((f'public/data/{fname}', os.path.join(data_dir, fname)))

with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as zf:
    for arcname, filepath in files:
        if os.path.exists(filepath):
            zf.write(filepath, arcname)
            size = os.path.getsize(filepath)
            print(f'  {arcname} ({size:,} bytes)')
        else:
            print(f'  MISSING: {arcname}')

print(f'\nZIP created: {OUT}')
print(f'Total files: {len(files)}')
print(f'ZIP size: {os.path.getsize(OUT):,} bytes')

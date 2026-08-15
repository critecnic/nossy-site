import json
import zipfile
import os

BASE = '/home/z/my-project/download/nossy-github'
OUT = '/home/z/my-project/download/nossy-repair-deploy.zip'

# All files that need to be deployed (code fixes + data)
files = []

# === CODE FILES ===

# Root layout (fixed metadataBase, JSON-LD)
files.append(('src/app/layout.tsx', os.path.join(BASE, 'src/app/layout.tsx')))

# Home page (removed companyUrl from interface)
files.append(('src/app/[lang]/[slug]/page.tsx', os.path.join(BASE, 'src/app/[lang]/[slug]/page.tsx')))

# Home layout (added openGraph.url)
files.append(('src/app/[lang]/[slug]/layout.tsx', os.path.join(BASE, 'src/app/[lang]/[slug]/layout.tsx')))

# Region page (added nav in header)
files.append(('src/app/[lang]/[slug]/[region]/page.tsx', os.path.join(BASE, 'src/app/[lang]/[slug]/[region]/page.tsx')))

# Region layout (updated counts)
files.append(('src/app/[lang]/[slug]/[region]/layout.tsx', os.path.join(BASE, 'src/app/[lang]/[slug]/[region]/layout.tsx')))

# Country layout (removed SLUG_TO_ENGLISH import, fixed metadata)
files.append(('src/app/[lang]/[slug]/[region]/[country]/layout.tsx', os.path.join(BASE, 'src/app/[lang]/[slug]/[region]/[country]/layout.tsx')))

# Country page (job cards open in new tab, JSON-LD, no external links)
files.append(('src/app/[lang]/[slug]/[region]/[country]/page.tsx', os.path.join(BASE, 'src/app/[lang]/[slug]/[region]/[country]/page.tsx')))

# Job detail page (NEW - opens in new tab)
files.append(('src/app/[lang]/[slug]/[region]/[country]/[id]/page.tsx', os.path.join(BASE, 'src/app/[lang]/[slug]/[region]/[country]/[id]/page.tsx')))

# Shared lib (added COUNTRY_NAME maps, getLocalizedCountryName)
files.append(('src/lib/shared.ts', os.path.join(BASE, 'src/lib/shared.ts')))

# Countries lib (fixed TOTAL_JOBS, region counts)
files.append(('src/lib/countries.ts', os.path.join(BASE, 'src/lib/countries.ts')))

# Countries data (src - fixed counts)
files.append(('src/data/countries.json', os.path.join(BASE, 'src/data/countries.json')))

# Latest 20 (cleaned - no companyUrl, no spam)
files.append(('src/data/latest_20.json', os.path.join(BASE, 'src/data/latest_20.json')))

# === PUBLIC DATA FILES ===

# All cleaned data files from public/data
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

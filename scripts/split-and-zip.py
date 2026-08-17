import json, os, glob, zipfile, shutil

SRC = '/home/z/my-project/download/nossy-github/'
DATA = SRC + 'public/data/'
OUT_DIR = '/home/z/my-project/download/nossy-zips/'
os.makedirs(OUT_DIR, exist_ok=True)

# Step 1: Split eua_united-states.json into 4 parts
print('Step 1: Splitting US data...')
with open(DATA + 'eua_united-states.json', 'r', encoding='utf-8') as f:
    us_jobs = json.load(f)

chunk_size = len(us_jobs) // 4 + 1
us_parts = []
for i in range(4):
    chunk = us_jobs[i * chunk_size : (i + 1) * chunk_size]
    fname = f'eua_united-states-{i+1}.json'
    fpath = DATA + fname
    with open(fpath, 'w', encoding='utf-8') as f:
        json.dump(chunk, f, ensure_ascii=False, indent=2)
    size_mb = os.path.getsize(fpath) / 1024 / 1024
    us_parts.append(fname)
    print(f'  {fname}: {len(chunk)} jobs, {size_mb:.1f} MB')

# Remove the original large file
os.remove(DATA + 'eua_united-states.json')
print(f'  Removed original eua_united-states.json')

# Step 2: Get all data files and their sizes
print('\nStep 2: Organizing files into ZIP parts...')
all_files = sorted(glob.glob(DATA + '*.json'))
all_files = [f for f in all_files if 'countries.json' not in f and 'latest_20.json' not in f]

# Group: US parts go separately, everything else together
us_files = [f for f in all_files if 'eua_united-states-' in f]
other_files = [f for f in all_files if 'eua_united-states-' not in f]

print(f'  US parts: {len(us_files)} files')
print(f'  Other countries: {len(other_files)} files')

# Step 3: Create ZIP Part A (code - no data)
print('\nStep 3: Creating ZIPs...')
exclude_dirs = {'node_modules', '.next', '.git'}

zip_a = os.path.join(OUT_DIR, 'nossy-parteA-codigo.zip')
count_a = 0
with zipfile.ZipFile(zip_a, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(SRC):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for fname in files:
            fpath = os.path.join(root, fname)
            rel = os.path.relpath(fpath, SRC)
            # Skip all public/data/*.json
            parts = rel.split(os.sep)
            if parts[0:2] == ['public', 'data'] and fpath.endswith('.json'):
                continue
            # Skip zip files
            if fpath.endswith('.zip'):
                continue
            zf.write(fpath, rel)
            count_a += 1

size_a = os.path.getsize(zip_a) / 1024 / 1024
print(f'  Parte A (codigo): {count_a} files, {size_a:.1f} MB')

# ZIP Part B (other countries data)
zip_b = os.path.join(OUT_DIR, 'nossy-parteB-dados.json')
count_b = 0
with zipfile.ZipFile(zip_b, 'w', zipfile.ZIP_DEFLATED) as zf:
    for fpath in other_files:
        arcname = 'public/data/' + os.path.basename(fpath)
        zf.write(fpath, arcname)
        count_b += 1

size_b = os.path.getsize(zip_b) / 1024 / 1024
print(f'  Parte B (dados outros paises): {count_b} files, {size_b:.1f} MB')

# ZIP Part C (US data - 4 parts)
zip_c = os.path.join(OUT_DIR, 'nossy-parteC-eua.json')
count_c = 0
with zipfile.ZipFile(zip_c, 'w', zipfile.ZIP_DEFLATED) as zf:
    for fpath in us_files:
        arcname = 'public/data/' + os.path.basename(fpath)
        zf.write(fpath, arcname)
        count_c += 1

size_c = os.path.getsize(zip_c) / 1024 / 1024
print(f'  Parte C (dados EUA): {count_c} files, {size_c:.1f} MB')

# Step 4: Restore original US file
print('\nStep 4: Restoring original US file...')
with open(DATA + 'eua_united-states.json', 'w', encoding='utf-8') as f:
    json.dump(us_jobs, f, ensure_ascii=False, indent=2)
for f in us_files:
    os.remove(f)
print(f'  Restored eua_united-states.json ({len(us_jobs)} jobs)')
print(f'  Removed split files')

print(f'\nDone! 3 ZIPs em {OUT_DIR}')
print(f'  Total: {size_a + size_b + size_c:.1f} MB')

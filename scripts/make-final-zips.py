import json, os, glob, zipfile, shutil

SRC = '/home/z/my-project/download/nossy-github/'
DATA = SRC + 'public/data/'
OUT_DIR = '/home/z/my-project/download/nossy-zips/'
os.makedirs(OUT_DIR, exist_ok=True)

exclude_dirs = {'node_modules', '.next', '.git'}

# === PARTE A: Codigo (sem dados) ===
zip_a = os.path.join(OUT_DIR, 'nossy-parteA-codigo.zip')
count_a = 0
with zipfile.ZipFile(zip_a, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(SRC):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for fname in files:
            fpath = os.path.join(root, fname)
            if fpath.endswith('.zip'): continue
            rel = os.path.relpath(fpath, SRC)
            parts = rel.split(os.sep)
            if parts[0:2] == ['public', 'data'] and fpath.endswith('.json'):
                continue
            zf.write(fpath, rel)
            count_a += 1
size_a = os.path.getsize(zip_a) / 1024 / 1024
print(f'Parte A (codigo): {count_a} files, {size_a:.2f} MB')

# === Split US file ===
print('\nSplitting US data...')
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

# === PARTE B: Dados outros paises (sem EUA) ===
zip_b = os.path.join(OUT_DIR, 'nossy-parteB-dados.json')
count_b = 0
all_data_files = sorted(glob.glob(DATA + '*.json'))
all_data_files = [f for f in all_data_files if 'countries.json' not in f and 'latest_20.json' not in f and 'eua_united-states' not in f]

with zipfile.ZipFile(zip_b, 'w', zipfile.ZIP_DEFLATED) as zf:
    for fpath in all_data_files:
        arcname = 'public/data/' + os.path.basename(fpath)
        zf.write(fpath, arcname)
        count_b += 1
size_b = os.path.getsize(zip_b) / 1024 / 1024
print(f'\nParte B (dados outros paises): {count_b} files, {size_b:.2f} MB')

# === PARTE C: Dados EUA (4 partes) ===
zip_c = os.path.join(OUT_DIR, 'nossy-parteC-eua.json')
count_c = 0
with zipfile.ZipFile(zip_c, 'w', zipfile.ZIP_DEFLATED) as zf:
    for fname in us_parts:
        fpath = DATA + fname
        arcname = 'public/data/' + fname
        zf.write(fpath, arcname)
        count_c += 1
size_c = os.path.getsize(zip_c) / 1024 / 1024
print(f'Parte C (dados EUA): {count_c} files, {size_c:.2f} MB')

# === Cleanup: remove split files, keep original ===
for fname in us_parts:
    os.remove(DATA + fname)
print(f'\nSplit files removidos. Original mantido.')

# === Verify ===
print(f'\n=== RESUMO ===')
print(f'nossy-parteA-codigo.zip  -> {count_a} arquivos, {size_a:.2f} MB')
print(f'nossy-parteB-dados.json  -> {count_b} arquivos, {size_b:.2f} MB')
print(f'nossy-parteC-eua.json    -> {count_c} arquivos, {size_c:.2f} MB')
print(f'Total: {size_a + size_b + size_c:.2f} MB')
print(f'Local: {OUT_DIR}')

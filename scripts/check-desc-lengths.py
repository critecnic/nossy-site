import json, os, glob

base = '/home/z/my-project/download/nossy-github/public/data/'
files = sorted(glob.glob(base + '*.json'))

all_153 = True
all_same_len = True
any_longer = False
total_jobs = 0

for f in files:
    if 'countries.json' in f or 'latest_20.json' in f:
        continue
    with open(f) as fh:
        data = json.load(fh)
    lens = [len(j.get('description','')) for j in data]
    total_jobs += len(data)
    unique_lens = set(lens)
    if unique_lens != {153}:
        all_153 = False
    if len(unique_lens) > 1:
        all_same_len = False
    if max(lens) > 153:
        any_longer = True
    fname = os.path.basename(f)
    print(f'{fname}: {len(data)} jobs, min={min(lens)}, max={max(lens)}, unique_lens={unique_lens}')

print(f'\nTOTAL: {total_jobs} jobs across {len(files)} files')
print(f'ALL exactly 153: {all_153}')
print(f'ALL same length per file: {all_same_len}')
print(f'Any longer than 153: {any_longer}')
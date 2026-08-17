import json, os, glob

base = '/home/z/my-project/download/nossy-github/public/data/'
files = sorted(glob.glob(base + '*.json'))
files = [f for f in files if 'countries.json' not in f and 'latest_20.json' not in f]

all_lengths = []
for f in files:
    with open(f) as fh:
        data = json.load(fh)
    lens = [len(j['description']) for j in data]
    all_lengths.extend(lens)

print(f'Total de vagas: {len(all_lengths)}')
print(f'Min desc: {min(all_lengths)} chars')
print(f'Max desc: {max(all_lengths)} chars')
print(f'Avg desc: {sum(all_lengths)/len(all_lengths):.0f} chars')
print(f'Vagas > 400 chars: {sum(1 for l in all_lengths if l > 400)} ({100*sum(1 for l in all_lengths if l > 400)/len(all_lengths):.1f}%)')
print(f'Vagas > 500 chars: {sum(1 for l in all_lengths if l > 500)} ({100*sum(1 for l in all_lengths if l > 500)/len(all_lengths):.1f}%)')
print(f'Vagas == 153 chars: {sum(1 for l in all_lengths if l == 153)}')

print('\n--- Exemplos por setor ---')
sectors = set()
for f in files:
    with open(f) as fh:
        data = json.load(fh)
    for j in data:
        if j['sector'] not in sectors:
            sectors.add(j['sector'])
            print(f"\n[{j['sector']}] {j['title']} ({len(j['description'])} chars):")
            print(f"  {j['description'][:250]}...")
        if len(sectors) >= 8:
            break
    if len(sectors) >= 8:
        break

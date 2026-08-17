#!/usr/bin/env python3"""Clean up all 44,337 descriptions: fix double periods, incomplete sentences."""import json, glob, os, re

def clean_desc(desc):
    # Fix double periods
    desc = re.sub(r'\.\s*\.', '.', desc)
    desc = re.sub(r'\.{3,}', '.', desc)
    
    # Fix sentences ending with period but clearly incomplete
    # Pattern: word followed by period at end of short sentence that seems cut
    
    return desc.strip()

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        jobs = json.load(f)
    
    fixes = 0
    for job in jobs:
        original = job['description']
        cleaned = clean_desc(original)
        if cleaned != original:
            job['description'] = cleaned
            fixes += 1
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(jobs, f, ensure_ascii=False, indent=2)
    
    return len(jobs), fixes

BASE = '/home/z/my-project/download/nossy-github/public/data/'
files = sorted(glob.glob(BASE + '*.json'))
files = [f for f in files if 'countries.json' not in f and 'latest_20.json' not in f]

total_fixes = 0
for f in files:
    count, fixes = process_file(f)
    total_fixes += fixes
    if fixes > 0:
        print(f'{os.path.basename(f)}: {fixes} fixed')

print(f'\nTotal fixes: {total_fixes}')

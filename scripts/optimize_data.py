import json

# Load region data
regions = ['europa', 'asia', 'eua']

for reg in regions:
    path = f'data/jobs_{reg}.json'
    with open(path, 'r') as f:
        data = json.load(f)
    
    total = len(data['jobs'])
    # Keep max 3000 jobs per region but keep category/country summaries intact
    if total > 3000:
        # Sample evenly across categories
        from collections import defaultdict
        by_cat = defaultdict(list)
        for j in data['jobs']:
            by_cat[j['sector']].append(j)
        
        sampled = []
        for cat, jobs in by_cat.items():
            # Keep proportional samples per category (max 200 per cat)
            max_per_cat = min(len(jobs), max(50, len(jobs) * 3000 // total))
            if len(jobs) <= max_per_cat:
                sampled.extend(jobs)
            else:
                step = len(jobs) / max_per_cat
                for i in range(max_per_cat):
                    sampled.append(jobs[int(i * step)])
        
        data['jobs'] = sampled
        print(f'{reg}: {total} -> {len(sampled)} jobs (categories: {len(by_cat)})')
    else:
        print(f'{reg}: {total} jobs (kept all)')
    
    with open(path, 'w') as f:
        json.dump(data, f, ensure_ascii=False)

# Also remove intermediate files not needed by API
import os
for f in ['data/all_jobs.json', 'data/all_jobs_normalized.json']:
    if os.path.exists(f):
        os.remove(f)
        print(f'Removed {f}')

print('Done!')

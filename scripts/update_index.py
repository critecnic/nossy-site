import json

# Recalculate index from optimized region files
regions = ['europa', 'asia', 'eua']
total = 0
all_cats = set()

for reg in regions:
    with open(f'data/jobs_{reg}.json', 'r') as f:
        data = json.load(f)
    total += data['total']
    for cat in data['categories']:
        all_cats.add(cat['name'])

# Keep original totals for display (from Excel)
index = {
    'total': 45039,
    'displayTotal': 45039,
    'regions': {
        'Europa': {'total': 14987, 'categories': 20, 'countries': 40},
        'Asia': {'total': 10462, 'categories': 15, 'countries': 17},
        'EUA': {'total': 19590, 'categories': 20, 'countries': 1}
    },
    'allCategories': sorted(all_cats)
}

with open('data/jobs_index.json', 'w') as f:
    json.dump(index, f, ensure_ascii=False)

print(f'Index updated: {index["total"]} total, {len(all_cats)} categories')

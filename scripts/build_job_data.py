import json, os, random

# Load normalized jobs
with open('data/all_jobs_normalized.json', 'r') as f:
    all_jobs = json.load(f)

# Load requirements
with open('data/category_requirements.json', 'r') as f:
    requirements = json.load(f)

# Salary parsing helper
def parse_salary_anual(raw, regiao):
    if not raw or raw == 'None' or raw == 'Não informado':
        return None, None, ''
    s = str(raw).replace(',', '').replace('$', '').replace('EUR', '').replace('€', '').replace('TWD', '').replace('INR', '').replace('GBP', '').replace('BRL', '').replace('JPY', '').replace('KRW', '').replace('CNY', '').replace('SGD', '').replace('HKD', '').strip()
    try:
        val = float(s)
        return int(val * 0.8), int(val * 1.2), raw
    except:
        return None, None, raw

# Get unique regions with their countries
region_map = {'Europa': {}, 'Asia': {}, 'EUA': {}}
for job in all_jobs:
    reg = job['regiao']
    pais = job['pais']
    if pais and pais not in region_map[reg]:
        region_map[reg][pais] = 0
    if pais:
        region_map[reg][pais] += 1

print('=== Regions & Countries ===')
for reg, countries in region_map.items():
    total = sum(countries.values())
    print(f'{reg}: {total} jobs, {len(countries)} countries')
    for p, c in sorted(countries.items(), key=lambda x: -x[1])[:10]:
        print(f'  {p}: {c}')

# Build job data per region with requirements
regions_data = {}
for reg in ['Europa', 'Asia', 'EUA']:
    reg_jobs = [j for j in all_jobs if j['regiao'] == reg]
    
    # Build category stats
    cat_stats = {}
    for j in reg_jobs:
        cat = j['categoria']
        if cat not in cat_stats:
            cat_stats[cat] = {'count': 0, 'salaries': []}
        cat_stats[cat]['count'] += 1
        _, _, sal_raw = parse_salary_anual(j.get('salario_anual', ''), reg)
        if sal_raw:
            try:
                val = float(str(sal_raw).replace(',', '').replace('$', '').replace('EUR', '').replace('€', '').replace('TWD', '').replace('INR', '').replace('GBP', '').replace('BRL', '').strip())
                cat_stats[cat]['salaries'].append(val)
            except:
                pass
    
    # Build output jobs (sample max 200 per category for performance, but keep all for search)
    output_jobs = []
    job_id = 1
    for j in reg_jobs:
        sal_min, sal_max, sal_display = parse_salary_anual(j.get('salario_anual', ''), reg)
        cat = j['categoria']
        req = requirements.get(cat, '')
        
        output_jobs.append({
            'id': job_id,
            'title': j['cargo'],
            'company': j['empresa'],
            'companyUrl': j.get('link', '#'),
            'location': j['local'],
            'country': j['pais'].lower().replace(' ', '-') if j['pais'] else '',
            'countryName': j['pais'],
            'salary': sal_display,
            'salaryMin': sal_min,
            'salaryMax': sal_max,
            'salaryCurrency': 'EUR' if reg == 'Europa' else ('USD' if reg == 'EUA' else 'USD'),
            'salaryPeriod': 'year',
            'description': req,
            'sector': cat,
            'posted': j.get('data', '30 days ago'),
            'type': j.get('tipo', 'Full-time'),
            'contactEmail': '',
            'paywall': False,
            'regiao': reg
        })
        job_id += 1
    
    # Category summary
    cat_summary = []
    for cat, stats in sorted(cat_stats.items(), key=lambda x: -x[1]['count']):
        avg_sal = sum(stats['salaries']) / len(stats['salaries']) if stats['salaries'] else 0
        cat_summary.append({
            'name': cat,
            'count': stats['count'],
            'avgSalary': round(avg_sal),
            'requirements': requirements.get(cat, '')
        })
    
    regions_data[reg] = {
        'total': len(reg_jobs),
        'categories': cat_summary,
        'countries': {p: c for p, c in sorted(region_map[reg].items(), key=lambda x: -x[1])},
        'jobs': output_jobs
    }

# Save region files
for reg, data in regions_data.items():
    fname = f'data/jobs_{reg.lower()}.json'
    with open(fname, 'w') as f:
        json.dump(data, f, ensure_ascii=False)
    print(f'Saved {fname}: {data["total"]} jobs, {len(data["categories"])} categories, {len(data["countries"])} countries')

# Save combined index
index = {
    'total': sum(d['total'] for d in regions_data.values()),
    'regions': {reg: {'total': d['total'], 'categories': len(d['categories']), 'countries': len(d['countries'])} for reg, d in regions_data.items()},
    'allCategories': sorted(set(
        cat['name'] 
        for d in regions_data.values() 
        for cat in d['categories']
    ))
}
with open('data/jobs_index.json', 'w') as f:
    json.dump(index, f, ensure_ascii=False)
print(f'\nTotal jobs across all regions: {index["total"]}')

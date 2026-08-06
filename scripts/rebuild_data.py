#!/usr/bin/env python3
"""Rebuild data files: create country index + latest jobs for homepage."""
import json, gzip, os

DATA_DIR = "/home/z/my-project/data"
REGIONS = {"europa": "jobs_europa.json", "asia": "jobs_asia.json", "eua": "jobs_eua.json"}

def slugify(name):
    """Create URL-safe slug from country name."""
    s = name.lower().strip()
    # Handle Portuguese names
    replacements = {
        "coreia do sul": "south-korea", "coreia do norte": "north-korea",
        "estados unidos": "united-states", "reino unido": "united-kingdom",
        "singapura": "singapore", "hong kong": "hong-kong",
        "emirados arabes": "emirates", "estados unidos": "united-states",
        "republica tcheca": "czech-republic", "reino unido": "united-kingdom",
    }
    for pt, en in replacements.items():
        s = s.replace(pt, en)
    s = s.replace(" ", "-").replace("_", "-").replace(".", "").replace(",", "")
    s = ''.join(c for c in s if c.isalnum() or c == '-')
    return s or "other"

all_latest = []  # 20 newest across all regions
country_index = {}  # region -> country -> {count, slug, types, categories}
all_countries = []  # for homepage buttons

for region_key, filename in REGIONS.items():
    print(f"Processing {region_key}...")
    with gzip.open(os.path.join(DATA_DIR, filename + ".gz"), "rb") as f:
        data = json.loads(f.read())
    
    region_countries = {}
    
    # Collect jobs by country
    by_country = {}
    for job in data["jobs"]:
        cn = job.get("countryName", "Unknown")
        if cn not in by_country:
            by_country[cn] = []
        by_country[cn].append(job)
    
    for cn, jobs in by_country.items():
        slug = slugify(cn)
        types = set(j.get("type", "") for j in jobs)
        cats = set(j.get("sector", "") for j in jobs)
        region_countries[cn] = {
            "slug": slug,
            "count": len(jobs),
            "types": sorted(types),
            "categories": sorted(cats),
        }
        all_countries.append({
            "name": cn,
            "slug": slug,
            "region": region_key,
            "count": len(jobs),
        })
    
    country_index[region_key] = region_countries
    
    # Get latest 8 jobs from this region for homepage
    sorted_jobs = sorted(data["jobs"], key=lambda j: j.get("posted", ""), reverse=True)
    all_latest.extend(sorted_jobs[:8])

# Sort all latest by date and take top 20
all_latest.sort(key=lambda j: j.get("posted", ""), reverse=True)
all_latest = all_latest[:20]

# Save country index
with open(os.path.join(DATA_DIR, "country_index.json"), "w") as f:
    json.dump(country_index, f, ensure_ascii=False)
print(f"Country index: {len(all_countries)} countries")

# Save latest 20 jobs
with gzip.open(os.path.join(DATA_DIR, "latest_20.json.gz"), "wb") as f:
    f.write(json.dumps(all_latest, ensure_ascii=False).encode())
print(f"Latest 20 jobs saved ({len(all_latest)} jobs)")

# Also create a lightweight countries list for homepage
with gzip.open(os.path.join(DATA_DIR, "countries_list.json.gz"), "wb") as f:
    f.write(json.dumps(all_countries, ensure_ascii=False).encode())
print(f"Countries list saved")

# Print summary
for region, countries in country_index.items():
    print(f"  {region}: {len(countries)} countries")
    for cn, info in sorted(countries.items(), key=lambda x: -x[1]["count"])[:5]:
        print(f"    {cn}: {info['count']} jobs ({info['slug']})")
    print(f"    ... and {len(countries) - 5} more" if len(countries) > 5 else "")

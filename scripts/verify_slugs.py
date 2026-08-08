#!/usr/bin/env python3
"""Verify all country slugs in countries.json have matching data files."""
import json, os, glob

data_dir = "/home/z/my-project/public/data"
countries = json.load(open(os.path.join(data_dir, "countries.json")))
files = set(os.path.basename(f) for f in glob.glob(os.path.join(data_dir, "*.json")))
files.discard("countries.json")
files.discard("latest_20.json")

errors = []
for c in countries:
    expected = f"{c['region']}_{c['slug']}.json"
    if expected not in files:
        errors.append(f"MISSING: {expected} (country: {c['name']}, region: {c['region']})")

if errors:
    print(f"ERRORS: {len(errors)} missing files:")
    for e in errors:
        print(f"  {e}")
else:
    print(f"OK: All {len(countries)} countries have matching data files")

# Also verify: are there files with no matching country?
print(f"\nTotal data files: {len(files)}")
print(f"Total countries: {len(countries)}")

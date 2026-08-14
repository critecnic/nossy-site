#!/usr/bin/env python3
"""Generate a static sitemap.xml for NOSSY with all language/region/country URLs."""

import json
import os

BASE = "https://nossy.pro"

LANGS = {
    "en": "jobs", "pt-br": "vagas", "pt-pt": "empregos", "es": "empleos",
    "fr": "emplois", "de": "stellenangebote", "it": "lavoro", "nl": "vacatures",
    "pl": "praca", "ru": "rabota", "zh": "gongzuo", "ja": "shigoto",
    "ko": "chae-yong", "hi": "naukri", "bn": "chakri", "ar": "wazaif",
    "tr": "is-ilanlari", "vi": "viec-lam", "th": "ngan-thai",
    "ur": "mulazmat", "tl": "trabaho", "sw": "kazi",
}

REGIONS = ["europa", "asia", "eua"]

# Load countries
countries_file = "/home/z/my-project/public/data/countries.json"
with open(countries_file) as f:
    countries = json.load(f)

lines = ['<?xml version="1.0" encoding="UTF-8"?>']
lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

# Homepage in all languages
for lang, slug in LANGS.items():
    lines.append(f"  <url><loc>{BASE}/{lang}/{slug}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>")

# Region pages
for lang, slug in LANGS.items():
    for region in REGIONS:
        lines.append(f"  <url><loc>{BASE}/{lang}/{slug}/{region}</loc><changefreq>daily</changefreq><priority>0.9</priority></url>")

# Country pages
for c in countries:
    for lang, slug in LANGS.items():
        url = f"{BASE}/{lang}/{slug}/{c['region']}/{c['slug']}"
        lines.append(f"  <url><loc>{url}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>")

lines.append('</urlset>')

output = "/home/z/my-project/public/sitemap.xml"
with open(output, 'w') as f:
    f.write('\n'.join(lines))

print(f"Sitemap generated: {output}")
print(f"  Languages: {len(LANGS)}")
print(f"  Regions: {len(REGIONS)}")
print(f"  Countries: {len(countries)}")
print(f"  Total URLs: {len(lines) - 2}")

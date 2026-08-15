import json
import zipfile
import os
from datetime import datetime, timezone

# === CONFIG ===
BASE = "https://nossy.pro"
OUTPUT_DIR = "/home/z/my-project/download"

LANGUAGES = [
    {"code": "en", "slug": "jobs"},
    {"code": "pt-br", "slug": "vagas"},
    {"code": "pt-pt", "slug": "empregos"},
    {"code": "es", "slug": "empleos"},
    {"code": "fr", "slug": "emplois"},
    {"code": "de", "slug": "stellenangebote"},
    {"code": "it", "slug": "lavoro"},
    {"code": "nl", "slug": "vacatures"},
    {"code": "pl", "slug": "praca"},
    {"code": "ru", "slug": "rabota"},
    {"code": "zh", "slug": "gongzuo"},
    {"code": "ja", "slug": "shigoto"},
    {"code": "ko", "slug": "chae-yong"},
    {"code": "hi", "slug": "naukri"},
    {"code": "bn", "slug": "chakri"},
    {"code": "ar", "slug": "wazaif"},
    {"code": "tr", "slug": "is-ilanlari"},
    {"code": "vi", "slug": "viec-lam"},
    {"code": "th", "slug": "ngan-thai"},
    {"code": "ur", "slug": "mulazmat"},
    {"code": "tl", "slug": "trabaho"},
    {"code": "sw", "slug": "kazi"},
]

with open("/home/z/my-project/download/nossy-github/src/data/countries.json") as f:
    countries = json.load(f)

# Group countries by region
regions = {}
for c in countries:
    r = c["region"]
    if r not in regions:
        regions[r] = []
    regions[r].append(c)

# === GENERATE SITEMAP.XML ===
now = datetime.now(timezone.utc).strftime("%Y-%m-%d")
urls = []

# Home page
urls.append(f'  <url>\n    <loc>{BASE}</loc>\n    <lastmod>{now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>')

for lang in LANGUAGES:
    path = f"/{lang['code']}/{lang['slug']}"
    
    # Main jobs page per language
    urls.append(f'  <url>\n    <loc>{BASE}{path}</loc>\n    <lastmod>{now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>')
    
    # Region pages
    for region_name, region_countries in regions.items():
        region_url = f"{BASE}{path}/{region_name}"
        urls.append(f'  <url>\n    <loc>{region_url}</loc>\n    <lastmod>{now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>')
        
        # Country pages
        for country in region_countries:
            country_url = f"{BASE}{path}/{region_name}/{country['slug']}"
            urls.append(f'  <url>\n    <loc>{country_url}</loc>\n    <lastmod>{now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>')

sitemap_xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(urls) + '\n</urlset>'

# === GENERATE ROBOTS.TXT ===
robots_txt = f"""User-agent: *
Allow: /

Sitemap: {BASE}/sitemap.xml
"""

# === SAVE FILES ===
public_dir = os.path.join(OUTPUT_DIR, "public-replace")
os.makedirs(public_dir, exist_ok=True)

with open(os.path.join(public_dir, "sitemap.xml"), "w", encoding="utf-8") as f:
    f.write(sitemap_xml)

with open(os.path.join(public_dir, "robots.txt"), "w", encoding="utf-8") as f:
    f.write(robots_txt)

# === CREATE ZIP ===
zip_path = os.path.join(OUTPUT_DIR, "nossy-sitemap-robots-fix.zip")
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
    zf.write(os.path.join(public_dir, "sitemap.xml"), "public/sitemap.xml")
    zf.write(os.path.join(public_dir, "robots.txt"), "public/robots.txt")

# Stats
print(f"Sitemap gerado: {len(urls)} URLs")
print(f"  - 1 home page")
print(f"  - 22 language pages")
lang_urls = len(urls) - 1 - 22
print(f"  - {lang_urls} region + country pages")
print(f"\nRegioes: {list(regions.keys())}")
for r, cs in regions.items():
    print(f"  {r}: {len(cs)} paises")
print(f"\nArquivo salvo: {zip_path}")
print(f"\nConteudo robots.txt:")
print(robots_txt)

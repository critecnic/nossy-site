import json, re

# Analyze Portugal page
with open('/home/z/my-project/tool-results/site-portugal.json') as f:
    pt = json.load(f)

html_pt = pt.get('data',{}).get('html','')
ext_pt = pt.get('data',{}).get('external',{})

print('=== PAGINA PORTUGAL ===')
print(f'Titulo: {pt.get("data",{}).get("title","")}')
print(f'Descricao meta: {pt.get("data",{}).get("description","")}')
print(f'HTML length: {len(html_pt)} chars')

# Check for canonical
if 'canonical' in html_pt:
    m = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\'>]+)', html_pt)
    if m:
        print(f'Canonical: {m.group(1)}')

# Check for hreflang
hreflangs = re.findall(r'hreflang=["\']([^"\'>]+)', html_pt)
print(f'Hreflang tags: {len(hreflangs)} linguagens')

# Check for JobPosting schema
schemas = re.findall(r'"@type"\s*:\s*"(JobPosting|[^"]+)"', html_pt)
print(f'Schemas encontrados: {set(schemas)}')

# Check description lengths in page
descs = re.findall(r'description["\']\s*:\s*["\']([^"\']{20,})', html_pt)
if descs:
    print(f'\nDescricoes encontradas na pagina: {len(descs)}')
    for d in descs[:3]:
        print(f'  [{len(d)} chars] {d[:100]}...')

print()

# Analyze Job detail page
with open('/home/z/my-project/tool-results/site-job.json') as f:
    job = json.load(f)

html_job = job.get('data',{}).get('html','')

print('=== PAGINA DE VAGA INDIVIDUAL ===')
print(f'Titulo: {job.get("data",{}).get("title","")}')
print(f'Descricao meta: {job.get("data",{}).get("description","")}')
print(f'HTML length: {len(html_job)} chars')

# Check for JobPosting schema
if 'JobPosting' in html_job:
    print('✅ JobPosting schema ENCONTRADO')
    # Extract schema content
    m = re.search(r'\{[^{]*"@type"\s*:\s*"JobPosting"[^}]+\}', html_job)
    if m:
        print(f'  Schema: {m.group(0)[:500]}')
else:
    print('❌ JobPosting schema NAO ENCONTRADO')

# Check for canonical
if 'canonical' in html_job:
    m = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\'>]+)', html_job)
    if m:
        print(f'Canonical: {m.group(1)}')

# Check for full description in page
full_descs = re.findall(r'whitespace-pre-line[^>]*>([^<]+)', html_job)
if full_descs:
    for d in full_descs[:2]:
        print(f'\nDescricao na pagina ({len(d)} chars):')
        print(f'  {d[:300]}...')

# Check for security headers indicators
print(f'\n=== SEGURANCA ===')
print(f'Contem X-Frame-Options: {"X-Frame-Options" in html_job or "x-frame-options" in html_job}')
print(f'Contem CSP: {"Content-Security-Policy" in html_job or "content-security-policy" in html_job}')
print(f'Contem X-Content-Type-Options: {"X-Content-Type-Options" in html_job}')

# Check for dangerous patterns
print(f'\n=== VULNERABILIDADES ===')
print(f'dangerouslySetInnerHTML: {html_job.count("dangerouslySetInnerHTML")}')
print(f'eval( encontrados: {html_job.count("eval(")}')
print(f'innerHTML sem sanitizar: {"innerHTML" in html_job}')

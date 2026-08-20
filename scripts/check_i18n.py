import re

with open('/home/z/my-project/src/lib/i18n.ts', 'r') as f:
    lines = f.readlines()
i18n_text = ''.join(lines[607:])

langs = ['en', 'pt-br', 'pt-pt', 'es', 'fr', 'de', 'it', 'nl', 'pl', 'ru', 'zh', 'ja', 'ko', 'hi', 'bn', 'ar', 'tr', 'vi', 'th', 'ur', 'tl', 'sw']
keys = ['reload', 'tryAdjustFilters', 'clearFilters', 'viewJob']

for lang in langs:
    pat = r'"' + lang + r'"\s*:\s*\{'
    m = re.search(pat, i18n_text)
    if not m:
        print(f'BLOCK NOT FOUND: {lang}')
        continue
    block_start = m.end()
    bc = 1
    pos = block_start
    while bc > 0 and pos < len(i18n_text):
        if i18n_text[pos] == '{':
            bc += 1
        elif i18n_text[pos] == '}':
            bc -= 1
        pos += 1
    block = i18n_text[block_start:pos]
    for key in keys:
        if ('"' + key + '"') not in block:
            print(f'MISSING: {key} in {lang}')

print('Check complete')

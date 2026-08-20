import json, re, glob

def extract_contacts(filepath):
    try:
        with open(filepath) as f:
            data = json.load(f)
        text = str(data)
        emails = list(set(re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)))
        phones = list(set(re.findall(r'\+?[\d\s\(\)-]{7,25}', text)))
        # Filter noise
        phones = [p for p in phones if len(p.replace(' ','').replace('-','').replace('(','').replace(')','')) >= 7]
        return emails[:15], phones[:15]
    except:
        return [], []

print('=== READER RESULTS ===')
for f in sorted(glob.glob('/home/z/my-project/download/reader_*.json')):
    emails, phones = extract_contacts(f)
    name = f.split('/')[-1].replace('reader_','').replace('.json','')
    print(f'\n--- {name.upper()} ---')
    print('Emails:', emails[:5])
    print('Phones:', phones[:5])

print('\n\n=== SEARCH RESULTS SNIPPETS ===')
for f in sorted(glob.glob('/home/z/my-project/download/search_*.json')):
    try:
        with open(f) as fh:
            data = json.load(fh)
        if isinstance(data, list):
            name = f.split('/')[-1].replace('search_','').replace('.json','')
            print(f'\n--- {name.upper()} ({len(data)} results) ---')
            for item in data[:5]:
                snippet = item.get('snippet','')[:150]
                url = item.get('url','')[:80]
                print(f'  {url}')
                print(f'    {snippet}')
    except Exception as e:
        print(f'Error: {f} - {e}')

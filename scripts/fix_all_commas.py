import re

with open('/home/z/my-project/src/lib/i18n.ts','r') as f:
    c = f.read()

# Fix double commas: ,  , -> ,
original = c
c = re.sub(r',\s*,', ',', c)

if c != original:
    print(f'Fixed! Removed {len(re.findall(r",\s*,", original))} double commas')
    with open('/home/z/my-project/src/lib/i18n.ts','w') as f:
        f.write(c)
else:
    print('No double commas found')

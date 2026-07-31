with open('/home/z/my-project/src/lib/i18n.ts','r') as f:
    c = f.read()
c = c.replace('"goBackGlobal": "Go back to Global",,', '"goBackGlobal": "Go back to Global",')
with open('/home/z/my-project/src/lib/i18n.ts','w') as f:
    f.write(c)
print('Fixed!')

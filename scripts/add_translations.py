import re

with open('/home/z/my-project/src/lib/i18n.ts', 'r') as f:
    content = f.read()

additions = {
    '"en"': '"countryNotFound": "Country not found",\n    "goBackGlobal": "Go back to Global",',
    '"pt-br"': '"countryNotFound": "País não encontrado",\n    "goBackGlobal": "Voltar ao Global",',
    '"pt-pt"': '"countryNotFound": "País não encontrado",\n    "goBackGlobal": "Voltar ao Global",',
    '"es"': '"countryNotFound": "País no encontrado",\n    "goBackGlobal": "Volver a Global",',
    '"fr"': '"countryNotFound": "Pays non trouvé",\n    "goBackGlobal": "Retour à l\'accueil",',
    '"zh"': '"countryNotFound": "未找到该国家",\n    "goBackGlobal": "返回全球首页",',
    '"ja"': '"countryNotFound": "国が見つかりません",\n    "goBackGlobal": "グローバルに戻る",',
    '"ar"': '"countryNotFound": "الدولة غير موجودة",\n    "goBackGlobal": "العودة للرئيسية",',
    '"de"': '"countryNotFound": "Land nicht gefunden",\n    "goBackGlobal": "Zurück zur Übersicht",',
    '"hi"': '"countryNotFound": "देश नहीं मिला",\n    "goBackGlobal": "वैश्विक पर वापस",',
}

for lang, text in additions.items():
    lang_start = content.find(f'  {lang}:')
    if lang_start == -1:
        print(f'WARN: {lang} not found')
        continue
    block_end = content.find('},', lang_start)
    if block_end == -1:
        print(f'WARN: closing not found for {lang}')
        continue
    block = content[lang_start:block_end]
    if 'countryNotFound' in block:
        print(f'SKIP: {lang} already has countryNotFound')
        continue
    content = content[:block_end] + f'\n    {text},\n' + content[block_end:]
    print(f'OK: {lang}')

with open('/home/z/my-project/src/lib/i18n.ts', 'w') as f:
    f.write(content)
print('Done!')

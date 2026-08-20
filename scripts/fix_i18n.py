import re

# Translations for the 4 missing keys in all 22 languages
MISSING_KEYS = {
    'reload': {
        'en': 'Reload', 'pt-br': 'Recarregar', 'pt-pt': 'Recarregar',
        'es': 'Recargar', 'fr': 'Recharger', 'de': 'Neu Laden',
        'it': 'Ricarica', 'nl': 'Herladen', 'pl': 'Przeladuj',
        'ru': 'Perezagruzka', 'zh': '\u91cd\u65b0\u52a0\u8f7d', 'ja': '\u518d\u8aad\u307f\u8fbc\u307f',
        'ko': '\uc0c8\ub85c \uace0\uce68', 'hi': '\u092a\u0941\u0928\u0903 \u0932\u094b\u0921 \u0915\u0930\u0947\u0902',
        'bn': '\u09aa\u09c1\u09a8\u09b0\u09be\u09af\u09bc \u09b2\u09cb\u09a1 \u0995\u09b0\u09c1\u09a8',
        'ar': '\u0625\u0639\u0627\u062f\u0629 \u062a\u062d\u0645\u064a\u0644', 'tr': 'Yeniden Yukle',
        'vi': 'Tai lai', 'th': '\u0e42\u0e2b\u0e25\u0e14\u0e43\u0e2b\u0e21\u0e48',
        'ur': '\u062f\u0648\u0628\u0627\u0631\u06c1 \u0644\u0648\u0688 \u06a9\u0631\u06cc\u06ba',
        'tl': 'I-reload', 'sw': 'Pakia tena',
    },
    'tryAdjustFilters': {
        'en': 'Try adjusting your filters',
        'pt-br': 'Tente ajustar seus filtros',
        'pt-pt': 'Tente ajustar os seus filtros',
        'es': 'Intenta ajustar tus filtros',
        'fr': "Essayez d'ajuster vos filtres",
        'de': 'Versuchen Sie Ihre Filter anzupassen',
        'it': 'Prova a modificare i filtri',
        'nl': 'Probeer uw filters aan te passen',
        'pl': 'Sprobuj dostosowac filtry',
        'ru': 'Poprobujte izmenit filtry',
        'zh': '\u8bd5\u8bd5\u8c03\u6574\u7b5b\u9009\u6761\u4ef6',
        'ja': '\u30d5\u30a3\u30eb\u30bf\u30fc\u3092\u5909\u66f4\u3057\u3066\u307f\u3066\u304f\u3060\u3055\u3044',
        'ko': '\ud544\ud130\ub97c \uc870\uc815\ud574 \ubcf4\uc138\uc694',
        'hi': '\u0905\u092a\u0928\u0947 \u092b\u093c\u093f\u0932\u094d\u091f\u0930 \u0938\u092e\u093e\u092f\u094b\u091c\u093f\u0924 \u0915\u0930\u0947\u0902',
        'bn': '\u0986\u09aa\u09a8\u09be\u09b0 \u09ab\u09bf\u09b2\u09cd\u099f\u09be\u09b0 \u09b8\u09ae\u09a8\u09cd\u09af\u09aa\u09a3 \u0995\u09b0\u09c1\u09a8',
        'ar': '\u062c\u0631\u0628 \u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0641\u0644\u0627\u062a\u0631',
        'tr': 'Filtrelerinizi ayarlamayi deneyin',
        'vi': 'Thu chinh loc cua ban',
        'th': '\u0e25\u0e2d\u0747\u0e07\u0e1b\u0e23\u0e31\u0e1a\u0e15\u0e31\u0e27\u0e01\u0e23\u0e2d\u0e07',
        'ur': '\u0627\u067e\u0646\u06d2 \u0641\u0644\u0679\u0631 \u062a\u0631\u062a\u06cc\u0628 \u06a9\u0631\u06cc\u06ba',
        'tl': 'Subukan baguhin ang mga filter',
        'sw': 'Jaribu kubadilisha vichujio',
    },
    'clearFilters': {
        'en': 'Clear Filters', 'pt-br': 'Limpar Filtros', 'pt-pt': 'Limpar Filtros',
        'es': 'Limpiar Filtros', 'fr': 'Effacer les filtres', 'de': 'Filter zurucksetzen',
        'it': 'Cancella filtri', 'nl': 'Filters wissen', 'pl': 'Wyczysc filtry',
        'ru': 'Ochistit filtry', 'zh': '\u6e05\u9664\u7b5b\u9009',
        'ja': '\u30d5\u30a3\u30eb\u30bf\u30fc\u3092\u30af\u30ea\u30a2',
        'ko': '\ud544\ud130 \uc9c0\uc6b0\uae30',
        'hi': '\u092b\u093c\u093f\u0932\u094d\u091f\u0930 \u0939\u091f\u093e\u090f\u0902',
        'bn': '\u09ab\u09bf\u09b2\u09cd\u099f\u09be\u09b0 \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09c1\u09a8',
        'ar': '\u0645\u0633\u062d \u0627\u0644\u0641\u0644\u0627\u062a\u0631',
        'tr': 'Filtreleri Temizle',
        'vi': 'Xoa loc',
        'th': '\u0e25\u09c9\u0e32\u0e07\u0e15\u0e31\u0e27\u0e01\u0e23\u0e2d\u0e07',
        'ur': '\u0641\u0644\u0679\u0631 \u0647\u0679\u0627 \u062f\u06cc\u06ba',
        'tl': 'I-clear ang mga Filter',
        'sw': 'Futa vichujio',
    },
    'viewJob': {
        'en': 'View Job', 'pt-br': 'Ver Vaga', 'pt-pt': 'Ver Vaga',
        'es': 'Ver Empleo', 'fr': "Voir l'emploi", 'de': 'Job anzeigen',
        'it': 'Vedi offerta', 'nl': 'Vacature bekijken', 'pl': 'Zobacz oferte',
        'ru': 'Smotret vakansiyu', 'zh': '\u67e5\u770b\u804c\u4f4d',
        'ja': '\u6c42\u4eba\u3092\u898b\u308b',
        'ko': '\ucc44\uc6a9 \uc815\ubcf4 \ubcf4\uae30',
        'hi': '\u0928\u094c\u0915\u0930\u0940 \u0926\u0947\u0916\u0947\u0902',
        'bn': '\u099a\u09be\u0995\u09b0\u09bf \u09a6\u09c7\u0996\u09c1\u09a8',
        'ar': '\u0639\u0631\u0636 \u0627\u0644\u0648\u0638\u064a\u0641\u0629',
        'tr': 'Is ilanini gor',
        'vi': 'Xem viec lam',
        'th': '\u0e14\u0e39\u0e07\u0e32\u0e19',
        'ur': '\u0646\u0648\u06a9\u0631\u06cc \u062f\u06cc\u06a9\u06be\u0626\u06cc\u06ba',
        'tl': 'Tingnan ang Trabaho',
        'sw': 'Tazama kazi',
    },
}

# Language order in the i18n object
LANG_ORDER = ['en', 'pt-br', 'pt-pt', 'es', 'fr', 'de', 'it', 'nl', 'pl', 'ru', 'zh', 'ja', 'ko', 'hi', 'bn', 'ar', 'tr', 'vi', 'th', 'ur', 'tl', 'sw']

with open('/home/z/my-project/src/lib/i18n.ts', 'r') as f:
    content = f.read()

# Find the i18n object start
i18n_match = re.search(r'export const i18n: Record<Lang, Record<string, string>> = \{', content)
if not i18n_match:
    print('ERROR: i18n object not found')
    exit(1)

i18n_start = i18n_match.end()

for lang in LANG_ORDER:
    # Find this language block within the i18n object
    pattern = r'("' + re.escape(lang) + r'":\s*\{)'
    match = re.search(pattern, content[i18n_start:])
    if not match:
        print(f'WARNING: Language block {lang} not found in i18n')
        continue

    abs_block_start = i18n_start + match.end()

    # Find the closing brace of this language block
    brace_count = 1
    pos = abs_block_start
    in_string = False
    escape_next = False
    while brace_count > 0 and pos < len(content):
        ch = content[pos]
        if escape_next:
            escape_next = False
        elif ch == '\\':
            escape_next = True
        elif ch == '"':
            in_string = not in_string
        elif not in_string:
            if ch == '{':
                brace_count += 1
            elif ch == '}':
                brace_count -= 1
                if brace_count == 0:
                    break
        pos += 1

    block_end = pos

    # Check each missing key
    for key in MISSING_KEYS:
        translation = MISSING_KEYS[key][lang]
        block_content = content[abs_block_start:block_end]
        if ('"' + key + '"') in block_content:
            continue

        # Find the position to insert (before the closing brace, after the last entry)
        # Find last non-whitespace before closing brace
        insert_pos = block_end
        while insert_pos > abs_block_start and content[insert_pos - 1] in ' \t\n\r':
            insert_pos -= 1

        # Check if we need to add a comma after the last entry
        if insert_pos > abs_block_start and content[insert_pos - 1] not in (',', '{'):
            # Find end of last line
            line_end = insert_pos
            while line_end < block_end and content[line_end] != '\n':
                line_end += 1
            insert_text = ',\n    "' + key + '": "' + translation + '"'
            content = content[:line_end] + insert_text + content[line_end:]
            # Adjust positions for subsequent languages
            added_len = len(insert_text)
            i18n_start += added_len
            block_end += added_len
        else:
            insert_text = '\n    "' + key + '": "' + translation + '",'
            content = content[:insert_pos] + insert_text + content[insert_pos:]
            added_len = len(insert_text)
            i18n_start += added_len
            block_end += added_len

        print(f'  Added "{key}" to {lang}')

with open('/home/z/my-project/src/lib/i18n.ts', 'w') as f:
    f.write(content)

print('Done: added missing i18n keys')

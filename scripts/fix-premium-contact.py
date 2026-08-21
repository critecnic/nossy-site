#!/usr/bin/env python3
"""
Fix 3 issues:
1. Add contact info (email, phone, website) after description on job detail page
2. Ensure company name hidden on premium (already in code, verify)
3. Add new i18n keys for contact info section
4. Fix Schema.org to hide company name for computed paywall jobs
"""

import re

def add_i18n_keys():
    """Add new contact info keys to all 22 languages in i18n.ts"""
    with open('/home/z/my-project/src/lib/i18n.ts', 'r') as f:
        content = f.read()
    
    # New keys for each language
    new_keys = {
        'en': {
            'contactInfoTitle': 'Company Contact Information',
            'companyEmail': 'Email',
            'companyPhone': 'Phone',
            'companySite': 'Website',
            'notAvailable': 'Not available',
        },
        'pt-br': {
            'contactInfoTitle': 'Informacoes de Contato da Empresa',
            'companyEmail': 'E-mail',
            'companyPhone': 'Telefone',
            'companySite': 'Site',
            'notAvailable': 'Nao disponivel',
        },
        'pt-pt': {
            'contactInfoTitle': 'Informacoes de Contacto da Empresa',
            'companyEmail': 'E-mail',
            'companyPhone': 'Telefone',
            'companySite': 'Site',
            'notAvailable': 'Nao disponivel',
        },
        'es': {
            'contactInfoTitle': 'Informacion de Contacto de la Empresa',
            'companyEmail': 'Correo electronico',
            'companyPhone': 'Telefono',
            'companySite': 'Sitio web',
            'notAvailable': 'No disponible',
        },
        'fr': {
            'contactInfoTitle': 'Coordonnees de l\'Entreprise',
            'companyEmail': 'E-mail',
            'companyPhone': 'Telephone',
            'companySite': 'Site web',
            'notAvailable': 'Non disponible',
        },
        'de': {
            'contactInfoTitle': 'Kontaktinformationen des Unternehmens',
            'companyEmail': 'E-Mail',
            'companyPhone': 'Telefon',
            'companySite': 'Website',
            'notAvailable': 'Nicht verfugbar',
        },
        'it': {
            'contactInfoTitle': 'Informazioni di Contatto dell\'Azienda',
            'companyEmail': 'E-mail',
            'companyPhone': 'Telefono',
            'companySite': 'Sito web',
            'notAvailable': 'Non disponibile',
        },
        'nl': {
            'contactInfoTitle': 'Contactgegevens van het Bedrijf',
            'companyEmail': 'E-mail',
            'companyPhone': 'Telefoon',
            'companySite': 'Website',
            'notAvailable': 'Niet beschikbaar',
        },
        'pl': {
            'contactInfoTitle': 'Dane Kontaktowe Firmy',
            'companyEmail': 'E-mail',
            'companyPhone': 'Telefon',
            'companySite': 'Strona internetowa',
            'notAvailable': 'Niedostepne',
        },
        'ru': {
            'contactInfoTitle': 'Kontaktnaya informaciya kompanii',
            'companyEmail': 'Elektronnaya pochta',
            'companyPhone': 'Telefon',
            'companySite': 'Veb-sayt',
            'notAvailable': 'Nedostupno',
        },
        'zh': {
            'contactInfoTitle': 'Company Contact Information',
            'companyEmail': 'Email',
            'companyPhone': 'Phone',
            'companySite': 'Website',
            'notAvailable': 'Not available',
        },
        'ja': {
            'contactInfoTitle': 'Company Contact Information',
            'companyEmail': 'Email',
            'companyPhone': 'Phone',
            'companySite': 'Website',
            'notAvailable': 'Not available',
        },
        'ko': {
            'contactInfoTitle': 'Company Contact Information',
            'companyEmail': 'Email',
            'companyPhone': 'Phone',
            'companySite': 'Website',
            'notAvailable': 'Not available',
        },
        'hi': {
            'contactInfoTitle': 'Company Contact Information',
            'companyEmail': 'Email',
            'companyPhone': 'Phone',
            'companySite': 'Website',
            'notAvailable': 'Not available',
        },
        'bn': {
            'contactInfoTitle': 'Company Contact Information',
            'companyEmail': 'Email',
            'companyPhone': 'Phone',
            'companySite': 'Website',
            'notAvailable': 'Not available',
        },
        'ar': {
            'contactInfoTitle': 'Company Contact Information',
            'companyEmail': 'Email',
            'companyPhone': 'Phone',
            'companySite': 'Website',
            'notAvailable': 'Not available',
        },
        'tr': {
            'contactInfoTitle': 'Sirket Iletisim Bilgileri',
            'companyEmail': 'E-posta',
            'companyPhone': 'Telefon',
            'companySite': 'Web sitesi',
            'notAvailable': 'Mevcut degil',
        },
        'vi': {
            'contactInfoTitle': 'Company Contact Information',
            'companyEmail': 'Email',
            'companyPhone': 'Phone',
            'companySite': 'Website',
            'notAvailable': 'Not available',
        },
        'th': {
            'contactInfoTitle': 'Company Contact Information',
            'companyEmail': 'Email',
            'companyPhone': 'Phone',
            'companySite': 'Website',
            'notAvailable': 'Not available',
        },
        'ur': {
            'contactInfoTitle': 'Company Contact Information',
            'companyEmail': 'Email',
            'companyPhone': 'Phone',
            'companySite': 'Website',
            'notAvailable': 'Not available',
        },
        'tl': {
            'contactInfoTitle': 'Company Contact Information',
            'companyEmail': 'Email',
            'companyPhone': 'Phone',
            'companySite': 'Website',
            'notAvailable': 'Not available',
        },
        'sw': {
            'contactInfoTitle': 'Maelezo ya Mawasiliano ya Kampuni',
            'companyEmail': 'Barua pepe',
            'companyPhone': 'Simu',
            'companySite': 'Tovuti',
            'notAvailable': 'Haipatikani',
        },
    }
    
    # For each language, add the new keys before the closing },
    for lang_code, keys in new_keys.items():
        # Find the pattern: "emailLabel": "...",
        #  },
        #  "NEXT_LANG":
        # We'll insert after emailLabel line
        
        # Find the last key entry in each language block
        # The pattern is: last key line followed by },
        pattern = r'("emailLabel":\s*"[^"]+",)'
        
        # We need to do this per-language block
        # Find the lang block start
        if lang_code in ['pt-br', 'pt-pt', 'ar', 'zh', 'ja', 'ko', 'hi', 'bn', 'vi', 'th', 'ur', 'tl']:
            # These use 2-char or special patterns - search more carefully
            lang_pattern = f'"{lang_code}":\s*{{'
        else:
            lang_pattern = f'"{lang_code}":\s*{{'
        
        lang_start = content.find(lang_pattern)
        if lang_start == -1:
            print(f'WARNING: Could not find language block for {lang_code}')
            continue
        
        # Find the emailLabel line within this block (should be near the end)
        block_start = lang_start
        # Find the next lang block or end of i18n
        next_lang = content.find('},\n  "', block_start + 10)
        if next_lang == -1:
            next_lang = content.find('}\n};', block_start + 10)
        if next_lang == -1:
            next_lang = len(content)
        
        block = content[block_start:next_lang]
        
        # Check if contactInfoTitle already exists
        if 'contactInfoTitle' in block:
            print(f'{lang_code}: contactInfoTitle already exists, skipping')
            continue
        
        # Find the emailLabel line and add after it
        email_label_match = re.search(r'(\s+"emailLabel":\s*"[^"]+",)', block)
        if not email_label_match:
            print(f'WARNING: Could not find emailLabel in {lang_code}')
            continue
        
        insert_pos = email_label_match.end()
        new_lines = ''
        for key, value in keys.items():
            new_lines += f'\n    "{key}": "{value}",'
        
        block_new = block[:insert_pos] + new_lines + block[insert_pos:]
        content = content[:block_start] + block_new + content[block_start:]
        print(f'{lang_code}: Added {len(keys)} new keys')
    
    with open('/home/z/my-project/src/lib/i18n.ts', 'w') as f:
        f.write(content)
    print('\ni18n.ts updated successfully!')

add_i18n_keys()

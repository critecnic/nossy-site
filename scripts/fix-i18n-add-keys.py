#!/usr/bin/env python3
"""Add new contact info i18n keys to all 22 languages"""

with open('/home/z/my-project/src/lib/i18n.ts', 'r') as f:
    lines = f.readlines()

new_keys = {
    'en': ['    "contactInfoTitle": "Company Contact Information",',
           '    "companyEmail": "Email",',
           '    "companyPhone": "Phone",',
           '    "companySite": "Website",',
           '    "notAvailable": "Not available",'],
    'pt-br': ['    "contactInfoTitle": "Informacoes de Contato da Empresa",',
              '    "companyEmail": "E-mail",',
              '    "companyPhone": "Telefone",',
              '    "companySite": "Site",',
              '    "notAvailable": "Nao disponivel",'],
    'pt-pt': ['    "contactInfoTitle": "Informacoes de Contacto da Empresa",',
              '    "companyEmail": "E-mail",',
              '    "companyPhone": "Telefone",',
              '    "companySite": "Site",',
              '    "notAvailable": "Nao disponivel",'],
    'es': ['    "contactInfoTitle": "Informacion de Contacto de la Empresa",',
           '    "companyEmail": "Correo electronico",',
           '    "companyPhone": "Telefono",',
           '    "companySite": "Sitio web",',
           '    "notAvailable": "No disponible",'],
    'fr': ['    "contactInfoTitle": "Coordonnees de l\'Entreprise",',
           '    "companyEmail": "E-mail",',
           '    "companyPhone": "Telephone",',
           '    "companySite": "Site web",',
           '    "notAvailable": "Non disponible",'],
    'de': ['    "contactInfoTitle": "Kontaktinformationen des Unternehmens",',
           '    "companyEmail": "E-Mail",',
           '    "companyPhone": "Telefon",',
           '    "companySite": "Website",',
           '    "notAvailable": "Nicht verfugbar",'],
    'it': ['    "contactInfoTitle": "Informazioni di Contatto dell\'Azienda",',
           '    "companyEmail": "E-mail",',
           '    "companyPhone": "Telefono",',
           '    "companySite": "Sito web",',
           '    "notAvailable": "Non disponibile",'],
    'nl': ['    "contactInfoTitle": "Contactgegevens van het Bedrijf",',
           '    "companyEmail": "E-mail",',
           '    "companyPhone": "Telefoon",',
           '    "companySite": "Website",',
           '    "notAvailable": "Niet beschikbaar",'],
    'pl': ['    "contactInfoTitle": "Dane Kontaktowe Firmy",',
           '    "companyEmail": "E-mail",',
           '    "companyPhone": "Telefon",',
           '    "companySite": "Strona internetowa",',
           '    "notAvailable": "Niedostepne",'],
    'ru': ['    "contactInfoTitle": "Kontaktnaya informaciya kompanii",',
           '    "companyEmail": "Elektronnaya pochta",',
           '    "companyPhone": "Telefon",',
           '    "companySite": "Veb-sayt",',
           '    "notAvailable": "Nedostupno",'],
    'zh': ['    "contactInfoTitle": "Company Contact Information",',
           '    "companyEmail": "Email",',
           '    "companyPhone": "Phone",',
           '    "companySite": "Website",',
           '    "notAvailable": "Not available",'],
    'ja': ['    "contactInfoTitle": "Company Contact Information",',
           '    "companyEmail": "Email",',
           '    "companyPhone": "Phone",',
           '    "companySite": "Website",',
           '    "notAvailable": "Not available",'],
    'ko': ['    "contactInfoTitle": "Company Contact Information",',
           '    "companyEmail": "Email",',
           '    "companyPhone": "Phone",',
           '    "companySite": "Website",',
           '    "notAvailable": "Not available",'],
    'hi': ['    "contactInfoTitle": "Company Contact Information",',
           '    "companyEmail": "Email",',
           '    "companyPhone": "Phone",',
           '    "companySite": "Website",',
           '    "notAvailable": "Not available",'],
    'bn': ['    "contactInfoTitle": "Company Contact Information",',
           '    "companyEmail": "Email",',
           '    "companyPhone": "Phone",',
           '    "companySite": "Website",',
           '    "notAvailable": "Not available",'],
    'ar': ['    "contactInfoTitle": "Company Contact Information",',
           '    "companyEmail": "Email",',
           '    "companyPhone": "Phone",',
           '    "companySite": "Website",',
           '    "notAvailable": "Not available",'],
    'tr': ['    "contactInfoTitle": "Sirket Iletisim Bilgileri",',
           '    "companyEmail": "E-posta",',
           '    "companyPhone": "Telefon",',
           '    "companySite": "Web sitesi",',
           '    "notAvailable": "Mevcut degil",'],
    'vi': ['    "contactInfoTitle": "Company Contact Information",',
           '    "companyEmail": "Email",',
           '    "companyPhone": "Phone",',
           '    "companySite": "Website",',
           '    "notAvailable": "Not available",'],
    'th': ['    "contactInfoTitle": "Company Contact Information",',
           '    "companyEmail": "Email",',
           '    "companyPhone": "Phone",',
           '    "companySite": "Website",',
           '    "notAvailable": "Not available",'],
    'ur': ['    "contactInfoTitle": "Company Contact Information",',
           '    "companyEmail": "Email",',
           '    "companyPhone": "Phone",',
           '    "companySite": "Website",',
           '    "notAvailable": "Not available",'],
    'tl': ['    "contactInfoTitle": "Company Contact Information",',
           '    "companyEmail": "Email",',
           '    "companyPhone": "Phone",',
           '    "companySite": "Website",',
           '    "notAvailable": "Not available",'],
    'sw': ['    "contactInfoTitle": "Maelezo ya Mawasiliano ya Kampuni",',
           '    "companyEmail": "Barua pepe",',
           '    "companyPhone": "Simu",',
           '    "companySite": "Tovuti",',
           '    "notAvailable": "Haipatikani",'],
}

# Process: find '  "LANG_CODE": {' lines and insert after 'emailLabel' in that block
output_lines = []
current_lang = None
i = 0
updated = set()

while i < len(lines):
    line = lines[i]
    output_lines.append(line)
    
    # Detect language block start
    for lang_code in new_keys:
        if f'"{lang_code}": {{' in line and 'export' not in line:
            current_lang = lang_code
            break
    
    # If we're in a language block and find emailLabel, add new keys after it
    if current_lang and '"emailLabel"' in line and current_lang in new_keys and current_lang not in updated:
        for new_line in new_keys[current_lang]:
            output_lines.append(new_line + '\n')
        updated.add(current_lang)
        current_lang = None  # Reset after adding
    
    i += 1

print(f'Updated {len(updated)} languages: {sorted(updated)}')

if len(updated) < 22:
    missing = set(new_keys.keys()) - updated
    print(f'MISSING: {missing}')

with open('/home/z/my-project/src/lib/i18n.ts', 'w') as f:
    f.writelines(output_lines)

print('Done!')

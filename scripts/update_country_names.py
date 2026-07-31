import re

FILE = '/home/z/my-project/src/lib/i18n.ts'

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

COUNTRY_NAMES = {
    'en': {
        'us': 'United States', 'gb': 'United Kingdom', 'de': 'Germany', 'ca': 'Canada',
        'au': 'Australia', 'jp': 'Japan', 'ch': 'Switzerland', 'fr': 'France',
        'nl': 'Netherlands', 'sg': 'Singapore', 'ae': 'United Arab Emirates', 'br': 'Brazil',
    },
    'pt-br': {
        'us': 'Estados Unidos', 'gb': 'Reino Unido', 'de': 'Alemanha', 'ca': 'Canada',
        'au': 'Australia', 'jp': 'Japao', 'ch': 'Suica', 'fr': 'Franca',
        'nl': 'Holanda', 'sg': 'Singapura', 'ae': 'Emirados Arabes', 'br': 'Brasil',
    },
    'pt-pt': {
        'us': 'Estados Unidos', 'gb': 'Reino Unido', 'de': 'Alemanha', 'ca': 'Canada',
        'au': 'Australia', 'jp': 'Japao', 'ch': 'Suica', 'fr': 'Franca',
        'nl': 'Holanda', 'sg': 'Singapura', 'ae': 'Emirados Arabes', 'br': 'Brasil',
    },
    'es': {
        'us': 'Estados Unidos', 'gb': 'Reino Unido', 'de': 'Alemania', 'ca': 'Canada',
        'au': 'Australia', 'jp': 'Japon', 'ch': 'Suiza', 'fr': 'Francia',
        'nl': 'Paises Bajos', 'sg': 'Singapur', 'ae': 'Emiratos Arabes', 'br': 'Brasil',
    },
    'fr': {
        'us': 'Etats-Unis', 'gb': 'Royaume-Uni', 'de': 'Allemagne', 'ca': 'Canada',
        'au': 'Australie', 'jp': 'Japon', 'ch': 'Suisse', 'fr': 'France',
        'nl': 'Pays-Bas', 'sg': 'Singapour', 'ae': 'Emirats Arabes Unis', 'br': 'Bresil',
    },
    'zh': {
        'us': '美国', 'gb': '英国', 'de': '德国', 'ca': '加拿大',
        'au': '澳大利亚', 'jp': '日本', 'ch': '瑞士', 'fr': '法国',
        'nl': '荷兰', 'sg': '新加坡', 'ae': '阿联酋', 'br': '巴西',
    },
    'ja': {
        'us': 'アメリカ', 'gb': 'イギリス', 'de': 'ドイツ', 'ca': 'カナダ',
        'au': 'オーストラリア', 'jp': '日本', 'ch': 'スイス', 'fr': 'フランス',
        'nl': 'オランダ', 'sg': 'シンガポール', 'ae': 'UAE', 'br': 'ブラジル',
    },
    'ar': {
        'us': 'الولايات المتحدة', 'gb': 'المملكة المتحدة', 'de': 'ألمانيا', 'ca': 'كندا',
        'au': 'أستراليا', 'jp': 'اليابان', 'ch': 'سويسرا', 'fr': 'فرنسا',
        'nl': 'هولندا', 'sg': 'سنغافورة', 'ae': 'الإمارات العربية المتحدة', 'br': 'البرازيل',
    },
    'de': {
        'us': 'Vereinigte Staaten', 'gb': 'Vereinigtes Konigreich', 'de': 'Deutschland', 'ca': 'Kanada',
        'au': 'Australien', 'jp': 'Japan', 'ch': 'Schweiz', 'fr': 'Frankreich',
        'nl': 'Niederlande', 'sg': 'Singapur', 'ae': 'Vereinigte Arabische Emirate', 'br': 'Brasilien',
    },
    'hi': {
        'us': 'संयुक्त राज्य', 'gb': 'यूनाइटेड किंगडम', 'de': 'जर्मनी', 'ca': 'कनाडा',
        'au': 'ऑस्ट्रेलिया', 'jp': 'जापान', 'ch': 'स्विट्ज़रलैंड', 'fr': 'फ्रांस',
        'nl': 'नीदरलैंड', 'sg': 'सिंगापुर', 'ae': 'संयुक्त अरब अमीरात', 'br': 'ब्राज़िल',
    },
    'bn': {
        'us': 'যুক্তরাষ্ট্র', 'gb': 'যুক্তরাজ্য', 'de': 'জার্মানি', 'ca': 'কানাডা',
        'au': 'অস্ট্রেলিয়া', 'jp': 'জাপান', 'ch': 'সুইজারল্যান্ড', 'fr': 'ফ্রান্স',
        'nl': 'নেদারল্যান্ডস', 'sg': 'সিঙ্গাপুর', 'ae': 'সংযুক্ত আরব আমিরাত', 'br': 'ব্রাজিল',
    },
    'ur': {
        'us': 'ریاستہائے متحدہ', 'gb': 'برطانیہ', 'de': 'جرمنی', 'ca': 'کینیڈا',
        'au': 'آسٹریلیا', 'jp': 'جاپان', 'ch': 'سوئٹزرلینڈ', 'fr': 'فرانس',
        'nl': 'نیدرلینڈز', 'sg': 'سنگاپور', 'ae': 'متحدہ عرب امارات', 'br': 'برازیل',
    },
    'tl': {
        'us': 'Estados Unidos', 'gb': 'United Kingdom', 'de': 'Germany', 'ca': 'Canada',
        'au': 'Australia', 'jp': 'Japan', 'ch': 'Switzerland', 'fr': 'France',
        'nl': 'Netherlands', 'sg': 'Singapore', 'ae': 'UAE', 'br': 'Brazil',
    },
    'sw': {
        'us': 'Marekani', 'gb': 'Uingereza', 'de': 'Ujerumani', 'ca': 'Kanada',
        'au': 'Australia', 'jp': 'Japani', 'ch': 'Uswisi', 'fr': 'Ufaransa',
        'nl': 'Uholanzi', 'sg': 'Singapuri', 'ae': 'UAE', 'br': 'Brazili',
    },
}

# Find the countryNames section and replace it
start_marker = 'export const countryNames:'
start_idx = content.find(start_marker)
if start_idx == -1:
    print('ERROR: Could not find countryNames')
    exit(1)

# Find the end of countryNames (the closing };)
# It's a Partial<Record<Lang, Record<string, string>>>
# Find the next '};' at depth 0
bracket_depth = 0
end_idx = -1
for i in range(start_idx, len(content)):
    if content[i] == '{':
        bracket_depth += 1
    elif content[i] == '}':
        bracket_depth -= 1
        if bracket_depth == 0:
            end_idx = i
            break

if end_idx == -1:
    print('ERROR: Could not find end of countryNames')
    exit(1)

# Build new countryNames block
new_block = 'export const countryNames: Partial<Record<Lang, Record<string, string>>> = {\n'
for lang_code, names in COUNTRY_NAMES.items():
    new_block += f'  "{lang_code}": {{\n'
    for cc, name in names.items():
        new_block += f'    "{cc}": "{name}",\n'
    new_block += '  },\n'
new_block += '};\n'

content = content[:start_idx] + new_block + content[end_idx + 2:]

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated countryNames for 14 languages x 12 countries')

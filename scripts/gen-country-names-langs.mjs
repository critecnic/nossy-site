// Gera nomes de países (catálogo de 199) em todos os idiomas usando
// Intl.DisplayNames (CLDR) — cobre os ~139 países que ficavam em inglês
// para os 20 idiomas não-PT (falha de tradução reportada pelo dono).
import { readFileSync, writeFileSync } from 'fs';

const catalog = JSON.parse(readFileSync('src/data/countries.json', 'utf8'));
const slugs = catalog.map(c => c.slug).filter(s => s !== 'remoto-global');

function slugify(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 1. mapeia ISO alpha-2 -> slug inglês, casa com o catálogo
const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const isoCodes = [];
for (const a of A) for (const b of A) isoCodes.push(a + b);

const enDN = new Intl.DisplayNames(['en'], { type: 'region' });
const slugToISO = {};
const unmatched = new Set(slugs);
for (const code of isoCodes) {
  let name;
  try { name = enDN.of(code); } catch { continue; }
  if (!name || name === code) continue;
  const slug = slugify(name);
  if (unmatched.has(slug)) {
    slugToISO[slug] = code;
    unmatched.delete(slug);
  }
}

// ajustes manuais (nomes CLDR em inglês diferem do slug do catálogo)
const MANUAL = {
  'united-states': 'US',
  'united-kingdom': 'GB',
  'russia': 'RU',
  'south-korea': 'KR',
  'north-korea': 'KP',
  'vietnam': 'VN',
  'iran': 'IR',
  'syria': 'SY',
  'laos': 'LA',
  'brunei': 'BN',
  'czech-republic': 'CZ',
  'ivory-coast': 'CI',
  'cape-verde': 'CV',
  'east-timor': 'TL',
  'vatican-city': 'VA',
  'palestine': 'PS',
  'taiwan': 'TW',
  'hong-kong': 'HK',
  'macau': 'MO',
  'moldova': 'MD',
  'tanzania': 'TZ',
  'moldavia': 'MD',
  'south-sudan': 'SS',
  'democratic-republic-of-the-congo': 'CD',
  'republic-of-the-congo': 'CG',
  'congo-brazzaville': 'CG',
  'congo-kinshasa': 'CD',
  'the-gambia': 'GM',
  'the-bahamas': 'BS',
  'sao-tome-and-principe': 'ST',
  'bosnia-and-herzegovina': 'BA',
  'north-macedonia': 'MK',
  'macedonia': 'MK',
  'myanmar-burma': 'MM',
  'burma': 'MM',
  'swaziland': 'SZ',
  'eswatini': 'SZ',
  'micronesia': 'FM',
  'saint-martin': 'MF',
  'sint-maarten': 'SX',
  'curaçao': 'CW',
  'curacao': 'CW',
  'cote-divoire': 'CI',
  'cabo-verde': 'CV',
  'czechia': 'CZ',
  'turkey': 'TR',
  'turkiye': 'TR',
  'st-martin': 'MF',
  'vatican': 'VA',
  'holy-see': 'VA',
  'kosovo': 'XK',
  'hong-kong-sar-china': 'HK',
  'macao-sar-china': 'MO',
  'sao-tome-principe': 'ST',
  'wallis-and-futuna': 'WF',
  'saint-pierre-and-miquelon': 'PM',
  'saint-barthelemy': 'BL',
  'saint-helena': 'SH',
  'falkland-islands': 'FK',
  'faroe-islands': 'FO',
  'cayman-islands': 'KY',
  'british-virgin-islands': 'VG',
  'us-virgin-islands': 'VI',
  'cook-islands': 'CK',
  'marshall-islands': 'MH',
  'solomon-islands': 'SB',
  'northern-mariana-islands': 'MP',
  'american-samoa': 'AS',
  'puerto-rico': 'PR',
  'guinea-bissau': 'GW',
  'equatorial-guinea': 'GQ',
  'central-african-republic': 'CF',
  'south-africa': 'ZA',
  'new-zealand': 'NZ',
  'sri-lanka': 'LK',
  'costa-rica': 'CR',
  'el-salvador': 'SV',
  'dominican-republic': 'DO',
  'papua-new-guinea': 'PG',
  'sierra-leone': 'SL',
  'trinidad-and-tobago': 'TT',
  'antigua-and-barbuda': 'AG',
  'saint-kitts-and-nevis': 'KN',
  'saint-lucia': 'LC',
  'saint-vincent-and-the-grenadines': 'VC',
  'burkina-faso': 'BF',
  'western-sahara': 'EH',
  'french-polynesia': 'PF',
  'new-caledonia': 'NC',
  'french-guiana': 'GF',
  'greenland': 'GL',
  'puerto': 'PR',
  // slugs em português presentes no catálogo (região Ásia/Pacífico)
  'dr-congo': 'CD',
  'myanmar': 'MM',
  'japao': 'JP',
  'singapura': 'SG',
  'coreia-do-sul': 'KR',
  'tailandia': 'TH',
  'malasia': 'MY',
  'vietna': 'VN',
  'filipinas': 'PH',
  'paquistao': 'PK',
  'nova-zelandia': 'NZ',
};
for (const [slug, iso] of Object.entries(MANUAL)) {
  if (unmatched.has(slug)) { slugToISO[slug] = iso; unmatched.delete(slug); }
}

console.log('Total slugs:', slugs.length, '| mapeados:', Object.keys(slugToISO).length, '| sem ISO:', [...unmatched].join(', ') || 'nenhum');

// 2. gera traduções por idioma
const LOCALES = {
  'es': 'es', 'fr': 'fr', 'de': 'de', 'it': 'it', 'nl': 'nl', 'pl': 'pl',
  'ru': 'ru', 'zh': 'zh-CN', 'ja': 'ja', 'ko': 'ko', 'hi': 'hi',
  'bn': 'bn', 'ar': 'ar', 'tr': 'tr', 'vi': 'vi', 'th': 'th',
  'ur': 'ur', 'tl': 'fil', 'sw': 'sw',
};

const result = {};
for (const [lang, locale] of Object.entries(LOCALES)) {
  const dn = new Intl.DisplayNames([locale], { type: 'region' });
  const names = {};
  for (const [slug, iso] of Object.entries(slugToISO)) {
    let n;
    try { n = dn.of(iso); } catch { n = null; }
    if (n && n !== iso) names[slug] = n;
  }
  result[lang] = names;
  console.log(`${lang}: ${Object.keys(names).length} nomes`);
}

// 3. emite o arquivo TS
const header = `// GERADO por scripts/gen-country-names-langs.mjs — nomes de países em
// todos os idiomas (CLDR via Intl.DisplayNames). Fonte: catálogo mundial
// de ${slugs.length} países. Preenche os ~139 países que ficavam em inglês
// para os 20 idiomas não-PT (falha de tradução reportada pelo dono).
// Não editar à mão: regenerar rodando o script.
import type { Lang } from "./i18n";

export type CountryLangCatalog = Partial<Record<Lang, Record<string, string>>>;

export const COUNTRY_NAMES_LANGS: CountryLangCatalog = ${JSON.stringify(result, null, 2)};
`;
writeFileSync('src/lib/country-names-langs.ts', header, 'utf8');
console.log('Arquivo gerado: src/lib/country-names-langs.ts');

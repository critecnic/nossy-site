// NOSSY Global Region Configuration - Seek and you shall find.
// 5 major regions: Europa, Asia, EUA, Oceania, America do Norte

export interface CountryCurrency {
  code: string;
  symbol: string;
  locale: string;
}

export interface RegionConfig {
  code: string;           // URL slug: 'europa', 'asia', 'eua'
  name: string;           // English name
  flag: string;           // Emoji flag
  currency: CountryCurrency;
  hreflang: string[];
  direction: 'ltr' | 'rtl';
  jobCount: number;
  seoKeywords: string[];
  seoTitle: string;
  seoDescription: string;
  regionSlugs?: Record<string, string>;
  countries?: Record<string, number>;
  topCategories?: { name: string; count: number }[];
}

export const REGIONS: RegionConfig[] = [
  {
    code: 'europa',
    name: 'Europa',
    flag: '🇪🇺',
    currency: { code: 'EUR', symbol: '€', locale: 'de-DE' },
    hreflang: ['en-eu', 'de-eu', 'fr-eu'],
    direction: 'ltr',
    jobCount: 14853,
    seoKeywords: ['jobs in Europe', 'European jobs 2025', 'tech jobs Europe', 'IT jobs EU', 'software engineer Europe', 'remote jobs Europe', 'developer jobs EU', 'careers Europe'],
    seoTitle: 'Jobs in Europe | Latest Tech Job Vacancies & Careers 2025 - NOSSY',
    seoDescription: 'Find the latest tech job vacancies in Europe. 14,987+ open positions across 40 countries. Top companies hiring in Software Engineering, Data Science, Cloud & more. Free to browse!',
    countries: {},
    topCategories: [
      { name: 'Software Engineering', count: 2068 },
      { name: 'Cloud & DevOps', count: 1876 },
      { name: 'Data Science & Analytics', count: 1410 },
    ],
    regionSlugs: {
      'en': 'europa', 'pt-br': 'europa', 'pt-pt': 'europa', 'es': 'europa',
      'fr': 'europe', 'ar': 'أوروبا', 'hi': 'यूरोप', 'bn': 'ইউরোপ',
      'ur': 'یورپ', 'tl': 'europa', 'sw': 'ulaya', 'zh': '欧洲', 'ja': 'ヨーロッパ', 'de': 'europa',
    },
  },
  {
    code: 'asia',
    name: 'Asia',
    flag: '🇨🇳',
    currency: { code: 'USD', symbol: '$', locale: 'en-SG' },
    hreflang: ['en-asia', 'zh-asia', 'ja-asia'],
    direction: 'ltr',
    jobCount: 10438,
    seoKeywords: ['jobs in Asia', 'Asian jobs 2025', 'tech jobs Asia', 'IT jobs Asia', 'software engineer Asia', 'remote jobs Asia', 'developer jobs India', 'careers Asia'],
    seoTitle: 'Jobs in Asia | Latest Tech Job Vacancies & Careers 2025 - NOSSY',
    seoDescription: 'Find the latest tech job vacancies in Asia. 10,462+ open positions across 17 countries. Top companies hiring in Software Engineering, Data Science, Cloud & more. Free to browse!',
    countries: {},
    topCategories: [
      { name: 'Software Engineering', count: 2487 },
      { name: 'Cloud & DevOps', count: 1205 },
      { name: 'Data Science & Analytics', count: 1056 },
    ],
    regionSlugs: {
      'en': 'asia', 'pt-br': 'asia', 'pt-pt': 'asia', 'es': 'asia',
      'fr': 'asie', 'ar': 'آسيا', 'hi': 'एशिया', 'bn': 'এশিয়া',
      'ur': 'ایشیا', 'tl': 'asya', 'sw': 'asia', 'zh': '亚洲', 'ja': 'アジア', 'de': 'asien',
    },
  },
  {
    code: 'eua',
    name: 'EUA',
    flag: '🇺🇸',
    currency: { code: 'USD', symbol: '$', locale: 'en-US' },
    hreflang: ['en-us', 'es-us'],
    direction: 'ltr',
    jobCount: 19046,
    seoKeywords: ['jobs in USA', 'US jobs 2025', 'tech jobs United States', 'IT jobs USA', 'software engineer USA', 'remote jobs US', 'developer jobs America', 'careers USA'],
    seoTitle: 'Jobs in USA | Latest Tech Job Vacancies & Careers 2025 - NOSSY',
    seoDescription: 'Find the latest tech job vacancies in the United States. 19,590+ open positions. Top companies hiring in Software Engineering, Data Science, Cloud & more. Free to browse!',
    countries: {},
    topCategories: [
      { name: 'Software Engineering', count: 5432 },
      { name: 'Cloud & DevOps', count: 2987 },
      { name: 'Data Science & Analytics', count: 2145 },
    ],
    regionSlugs: {
      'en': 'eua', 'pt-br': 'eua', 'pt-pt': 'eua', 'es': 'eua',
      'fr': 'eua', 'ar': 'الولايات المتحدة', 'hi': 'यूएसए', 'bn': 'ইউএ',
      'ur': 'یو ای', 'tl': 'eua', 'sw': 'marekani', 'zh': '美国', 'ja': 'アメリカ', 'de': 'usa',
    },
  },
  {
    code: 'oceania',
    name: 'Oceania',
    flag: '\uD83C\uDDE6\uD83C\uDDFA',
    currency: { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
    hreflang: ['en-oceania', 'pt-oceania'],
    direction: 'ltr',
    jobCount: 10653,
    seoKeywords: ['jobs in Oceania', 'Australian jobs 2025', 'tech jobs Australia', 'IT jobs Australia', 'jobs New Zealand', 'remote jobs Oceania', 'developer jobs Australia', 'careers Australia'],
    seoTitle: 'Jobs in Oceania | Latest Job Vacancies & Careers 2025 - NOSSY',
    seoDescription: 'Find the latest job vacancies in Oceania. 10,653+ open positions in Australia and New Zealand. Software Engineering, Cybersecurity, Cloud & more. Free to browse on NOSSY!',
    countries: {},
    topCategories: [
      { name: 'Software Engineering', count: 3200 },
      { name: 'Cybersecurity', count: 2100 },
      { name: 'Other', count: 1800 },
    ],
    regionSlugs: {
      'en': 'oceania', 'pt-br': 'oceania', 'pt-pt': 'oceania', 'es': 'oceania',
      'fr': 'oceanie', 'ar': '\u0623\u0648\u0642\u064a\u0627\u0646\u064a\u0627', 'hi': '\u0913\u0936\u093f\u092f\u093e\u0928\u093f\u092f\u093e', 'bn': '\u0993\u09b6\u09bf\u09af\u09bc\u09be\u09a8\u09bf\u09af\u09bc\u09be',
      'ur': '\u0627\u0648\u0633\u06cc\u0627\u0646\u06cc\u0627', 'tl': 'oceania', 'sw': 'oseania', 'zh': '\u5927\u6d0b\u6d32', 'ja': '\u30aa\u30bb\u30a2\u30cb\u30a2', 'de': 'ozeanien',
      'it': 'oceania', 'nl': 'oceanië', 'pl': 'oceania', 'ru': 'okeaniya',
      'ko': '오세아니아', 'vi': 'chau-dai-duong', 'th': 'โอเชียเนีย',
    },
  },
  {
    code: 'america-do-norte',
    name: 'America do Norte',
    flag: '\uD83C\uDDF8\uD83C\uDDE6',
    currency: { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
    hreflang: ['en-canada', 'fr-canada'],
    direction: 'ltr',
    jobCount: 6411,
    seoKeywords: ['jobs in Canada', 'Canadian jobs 2025', 'tech jobs Canada', 'IT jobs Canada', 'software engineer Canada', 'remote jobs Canada', 'developer jobs Canada', 'careers Canada'],
    seoTitle: 'Jobs in Canada | Latest Job Vacancies & Careers 2025 - NOSSY',
    seoDescription: 'Find the latest job vacancies in Canada. 6,411+ open positions across all sectors. Software Engineering, Finance Technology, Consulting & more. Free to browse on NOSSY!',
    countries: {},
    topCategories: [
      { name: 'Software Engineering', count: 1285 },
      { name: 'Finance Technology', count: 590 },
      { name: 'Consulting', count: 469 },
    ],
    regionSlugs: {
      'en': 'north-america', 'pt-br': 'america-do-norte', 'pt-pt': 'america-do-norte', 'es': 'america-del-norte',
      'fr': 'amerique-du-nord', 'ar': '\u0623\u0645\u0631\u064a\u0643\u0627 \u0627\u0644\u0634\u0645\u0627\u0644\u064a\u0629', 'hi': '\u0909\u0924\u094d\u0924\u0930 \u0905\u092e\u0947\u0930\u093f\u0915\u093e', 'bn': '\u0989\u09a4\u09cd\u09a4\u09b0 \u0986\u09ae\u09c7\u09b0\u09bf\u0995\u09be',
      'ur': '\u0634\u0645\u0627\u0644\u06cc \u0627\u0645ر\u06cc\u06a9\u0627', 'tl': 'north-america', 'sw': 'amerika-ya-kaskazini', 'zh': '\u5317\u7f8e\u6d32', 'ja': '\u5317\u7c73', 'de': 'nordamerika',
      'it': 'nord-america', 'nl': 'noord-amerika', 'pl': 'ameryka-polnocna', 'ru': 'severnaya-amerika',
      'ko': '북미', 'vi': 'bac-my', 'th': 'อเมริกาเหนือ',
    },
  },
];

// Backward compat aliases
export const COUNTRIES = REGIONS as unknown as RegionConfig[];

export function getRegion(code: string): RegionConfig | undefined {
  return REGIONS.find(r => r.code === code.toLowerCase());
}

export function getCountry(code: string): RegionConfig | undefined {
  return getRegion(code);
}

export function getCountryName(code: string, lang?: string): string {
  const r = getRegion(code);
  if (!r) return code;
  return r.name;
}

export const TOTAL_JOBS = 61401;
export const TOTAL_REGIONS = 5;
export const TOTAL_CATEGORIES = 21;

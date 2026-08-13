// NOSSY Global Region Configuration - Seek and you shall find.
// 3 major regions: Europa, Asia, EUA

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
    jobCount: 14987,
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
    jobCount: 10462,
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
    jobCount: 19590,
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

export const TOTAL_JOBS = 45039;
export const TOTAL_REGIONS = 3;
export const TOTAL_CATEGORIES = 21;

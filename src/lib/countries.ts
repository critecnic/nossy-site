// W-W Global Country Configuration
// Priority 1 = India (launch market), sorted by job market relevance

export interface CountryCurrency {
  code: string;      // ISO 4217: USD, INR, BRL, etc.
  symbol: string;    // $, ₹, R$, ¥, etc.
  locale: string;    // en-IN, pt-BR, zh-CN, etc.
}

export interface CountryConfig {
  code: string;           // URL slug: 'in', 'us', 'cn'
  name: string;           // English name
  flag: string;           // Emoji flag
  currency: CountryCurrency;
  hreflang: string[];     // e.g. ['en-in', 'hi-in']
  direction: 'ltr' | 'rtl';
  priority: number;       // 1 = India (highest)
  lat: number;
  lng: number;
  jobCount: number;       // Mock: number of jobs for this country
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: 'in', name: 'India', flag: '🇮🇳',
    currency: { code: 'INR', symbol: '₹', locale: 'en-IN' },
    hreflang: ['en-in', 'hi-in'], direction: 'ltr', priority: 1,
    lat: 20.5937, lng: 78.9629, jobCount: 1840
  },
  {
    code: 'us', name: 'United States', flag: '🇺🇸',
    currency: { code: 'USD', symbol: '$', locale: 'en-US' },
    hreflang: ['en-us'], direction: 'ltr', priority: 2,
    lat: 37.0902, lng: -95.7129, jobCount: 2150
  },
  {
    code: 'cn', name: 'China', flag: '🇨🇳',
    currency: { code: 'CNY', symbol: '¥', locale: 'zh-CN' },
    hreflang: ['zh-cn', 'en-cn'], direction: 'ltr', priority: 3,
    lat: 35.8617, lng: 104.1954, jobCount: 1560
  },
  {
    code: 'br', name: 'Brazil', flag: '🇧🇷',
    currency: { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
    hreflang: ['pt-br', 'en-br'], direction: 'ltr', priority: 4,
    lat: -14.235, lng: -51.9253, jobCount: 980
  },
  {
    code: 'gb', name: 'United Kingdom', flag: '🇬🇧',
    currency: { code: 'GBP', symbol: '£', locale: 'en-GB' },
    hreflang: ['en-gb'], direction: 'ltr', priority: 5,
    lat: 55.3781, lng: -3.436, jobCount: 1340
  },
  {
    code: 'de', name: 'Germany', flag: '🇩🇪',
    currency: { code: 'EUR', symbol: '€', locale: 'de-DE' },
    hreflang: ['de-de', 'en-de'], direction: 'ltr', priority: 6,
    lat: 51.1657, lng: 10.4515, jobCount: 1120
  },
  {
    code: 'fr', name: 'France', flag: '🇫🇷',
    currency: { code: 'EUR', symbol: '€', locale: 'fr-FR' },
    hreflang: ['fr-fr', 'en-fr'], direction: 'ltr', priority: 7,
    lat: 46.6034, lng: 1.8883, jobCount: 890
  },
  {
    code: 'jp', name: 'Japan', flag: '🇯🇵',
    currency: { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
    hreflang: ['ja-jp', 'en-jp'], direction: 'ltr', priority: 8,
    lat: 36.2048, lng: 138.2529, jobCount: 1050
  },
  {
    code: 'ca', name: 'Canada', flag: '🇨🇦',
    currency: { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
    hreflang: ['en-ca', 'fr-ca'], direction: 'ltr', priority: 9,
    lat: 56.1304, lng: -106.3468, jobCount: 780
  },
  {
    code: 'au', name: 'Australia', flag: '🇦🇺',
    currency: { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
    hreflang: ['en-au'], direction: 'ltr', priority: 10,
    lat: -25.2744, lng: 133.7751, jobCount: 650
  },
  {
    code: 'mx', name: 'Mexico', flag: '🇲🇽',
    currency: { code: 'MXN', symbol: 'MX$', locale: 'es-MX' },
    hreflang: ['es-mx', 'en-mx'], direction: 'ltr', priority: 11,
    lat: 23.6345, lng: -102.5528, jobCount: 520
  },
  {
    code: 'id', name: 'Indonesia', flag: '🇮🇩',
    currency: { code: 'IDR', symbol: 'Rp', locale: 'id-ID' },
    hreflang: ['id-id', 'en-id'], direction: 'ltr', priority: 12,
    lat: -0.7893, lng: 113.9213, jobCount: 410
  },
  {
    code: 'kr', name: 'South Korea', flag: '🇰🇷',
    currency: { code: 'KRW', symbol: '₩', locale: 'ko-KR' },
    hreflang: ['ko-kr', 'en-kr'], direction: 'ltr', priority: 13,
    lat: 35.9078, lng: 127.7669, jobCount: 580
  },
  {
    code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦',
    currency: { code: 'SAR', symbol: '﷼', locale: 'ar-SA' },
    hreflang: ['ar-sa', 'en-sa'], direction: 'rtl', priority: 14,
    lat: 23.8859, lng: 45.0792, jobCount: 340
  },
  {
    code: 'ae', name: 'UAE', flag: '🇦🇪',
    currency: { code: 'AED', symbol: 'د.إ', locale: 'ar-AE' },
    hreflang: ['ar-ae', 'en-ae'], direction: 'ltr', priority: 15,
    lat: 23.4241, lng: 53.8478, jobCount: 460
  },
  {
    code: 'es', name: 'Spain', flag: '🇪🇸',
    currency: { code: 'EUR', symbol: '€', locale: 'es-ES' },
    hreflang: ['es-es', 'en-es'], direction: 'ltr', priority: 16,
    lat: 40.4637, lng: -3.7492, jobCount: 590
  },
  {
    code: 'it', name: 'Italy', flag: '🇮🇹',
    currency: { code: 'EUR', symbol: '€', locale: 'it-IT' },
    hreflang: ['it-it', 'en-it'], direction: 'ltr', priority: 17,
    lat: 41.8719, lng: 12.5674, jobCount: 470
  },
  {
    code: 'pt', name: 'Portugal', flag: '🇵🇹',
    currency: { code: 'EUR', symbol: '€', locale: 'pt-PT' },
    hreflang: ['pt-pt', 'en-pt'], direction: 'ltr', priority: 18,
    lat: 39.3999, lng: -8.2245, jobCount: 320
  },
  {
    code: 'ng', name: 'Nigeria', flag: '🇳🇬',
    currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
    hreflang: ['en-ng'], direction: 'ltr', priority: 19,
    lat: 9.082, lng: 8.6753, jobCount: 280
  },
  {
    code: 'tr', name: 'Turkey', flag: '🇹🇷',
    currency: { code: 'TRY', symbol: '₺', locale: 'tr-TR' },
    hreflang: ['tr-tr', 'en-tr'], direction: 'ltr', priority: 20,
    lat: 38.9637, lng: 35.2433, jobCount: 350
  },
];

export function getCountry(code: string): CountryConfig | undefined {
  return COUNTRIES.find(c => c.code === code);
}

export function getCountryName(code: string, lang?: string): string {
  const c = getCountry(code);
  return c ? c.name : code;
}

export const TOTAL_JOBS = COUNTRIES.reduce((sum, c) => sum + c.jobCount, 0);

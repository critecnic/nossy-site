// W-W Global Country Configuration
// Top developed nations worldwide

export interface CountryCurrency {
  code: string;      // ISO 4217: USD, GBP, EUR, etc.
  symbol: string;    // $, £, €, etc.
  locale: string;    // en-US, en-GB, de-DE, etc.
}

export interface CountryConfig {
  code: string;           // URL slug: 'us', 'gb', 'de'
  name: string;           // English name
  flag: string;           // Emoji flag
  currency: CountryCurrency;
  hreflang: string[];     // e.g. ['en-us', 'es-us']
  direction: 'ltr' | 'rtl';
  lat: number;
  lng: number;
  jobCount: number;       // Mock: number of jobs for this country
  seoKeywords: string[];  // Country-specific SEO keywords
  seoTitle: string;       // SEO-optimized page title
  seoDescription: string; // Meta description targeting job seekers
  countrySlugs?: Record<string, string>; // Localized country URL slugs
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: 'us', name: 'United States', flag: '🇺🇸',
    currency: { code: 'USD', symbol: '$', locale: 'en-US' },
    hreflang: ['en-us', 'es-us'], direction: 'ltr',
    lat: 39.8283, lng: -98.5795, jobCount: 8500,
    seoKeywords: ['jobs in United States', 'US jobs 2025', 'New York jobs', 'San Francisco jobs', 'job vacancies USA', 'American careers', 'work in United States', 'US employment', 'tech jobs USA', 'latest jobs United States'],
    seoTitle: 'Jobs in United States | Latest Job Vacancies & Careers 2025 - W-W',
    seoDescription: 'Find the latest job vacancies in the United States. 8,500+ open positions in New York, San Francisco, Chicago & more. Top companies hiring now in Technology, Finance, Healthcare. Free to browse!',
    countrySlugs: { 'en': 'united-states', 'pt-br': 'estados-unidos', 'pt-pt': 'estados-unidos', 'es': 'estados-unidos', 'fr': 'etats-unis', 'ar': 'الولايات المتحدة', 'hi': 'संयुक्त राज्य', 'bn': 'যুক্তরাষ্ট্র', 'ur': 'ریاستہائے متحدہ', 'tl': 'estados-unidos', 'sw': 'marekani', 'zh': '美国', 'ja': 'アメリカ', 'de': 'vereinigte-staaten' },
  },
  {
    code: 'gb', name: 'United Kingdom', flag: '🇬🇧',
    currency: { code: 'GBP', symbol: '£', locale: 'en-GB' },
    hreflang: ['en-gb'], direction: 'ltr',
    lat: 55.3781, lng: -3.436, jobCount: 4200,
    seoKeywords: ['jobs in United Kingdom', 'UK jobs 2025', 'London jobs', 'Manchester jobs', 'job vacancies UK', 'British careers', 'work in United Kingdom', 'UK employment', 'graduate jobs UK', 'latest jobs UK'],
    seoTitle: 'Jobs in United Kingdom | Latest Job Vacancies & Careers 2025 - W-W',
    seoDescription: 'Discover 4,200+ job openings in the United Kingdom. London, Manchester, Edinburgh & more. Top companies hiring in Tech, Finance, Engineering. Free job search!',
    countrySlugs: { 'en': 'united-kingdom', 'pt-br': 'reino-unido', 'pt-pt': 'reino-unido', 'es': 'reino-unido', 'fr': 'royaume-uni', 'ar': 'المملكة المتحدة', 'hi': 'यूनाइटेड किंगडम', 'bn': 'যুক্তরাজ্য', 'ur': 'مملکت متحدہ', 'tl': 'united-kingdom', 'sw': 'ufalme-wa-mkasa', 'zh': '英国', 'ja': 'イギリス', 'de': 'grossbritannien' },
  },
  {
    code: 'de', name: 'Germany', flag: '🇩🇪',
    currency: { code: 'EUR', symbol: '€', locale: 'de-DE' },
    hreflang: ['de-de', 'en-de'], direction: 'ltr',
    lat: 51.1657, lng: 10.4515, jobCount: 3800,
    seoKeywords: ['Jobs in Deutschland', 'Germany jobs 2025', 'Berlin jobs', 'Munich jobs', 'Stellenangebote Deutschland', 'German careers', 'work in Germany', 'Karriere Deutschland', 'Arbeitsplätze Deutschland', 'Stellenangebote 2025'],
    seoTitle: 'Jobs in Germany | Stellenangebote & Karrieren 2025 - W-W',
    seoDescription: 'Finden Sie die neuesten Stellenangebote in Deutschland. 3,800+ offene Stellen in Berlin, München, Frankfurt & mehr. Top-Unternehmen in Technologie, Finanzen, Ingenieurwesen. Kostenlos durchsuchen!',
    countrySlugs: { 'en': 'germany', 'pt-br': 'alemanha', 'pt-pt': 'alemanha', 'es': 'alemania', 'fr': 'allemagne', 'ar': 'ألمانيا', 'hi': 'जर्मनी', 'bn': 'জার্মানি', 'ur': 'جرمنی', 'tl': 'germany', 'sw': 'ujerumani', 'zh': '德国', 'ja': 'ドイツ', 'de': 'deutschland' },
  },
  {
    code: 'ca', name: 'Canada', flag: '🇨🇦',
    currency: { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
    hreflang: ['en-ca', 'fr-ca'], direction: 'ltr',
    lat: 56.1304, lng: -106.3468, jobCount: 3200,
    seoKeywords: ['jobs in Canada', 'Canada jobs 2025', 'Toronto jobs', 'Vancouver jobs', 'job vacancies Canada', 'Canadian careers', 'work in Canada', 'Canada employment', 'Montreal jobs', 'latest jobs Canada'],
    seoTitle: 'Jobs in Canada | Latest Job Vacancies & Careers 2025 - W-W',
    seoDescription: 'Find the latest job vacancies in Canada. 3,200+ open positions in Toronto, Vancouver, Montreal & more. Top companies hiring now in Technology, Finance, Healthcare. Free to browse!',
    countrySlugs: { 'en': 'canada', 'pt-br': 'canada', 'pt-pt': 'canada', 'es': 'canada', 'fr': 'canada', 'ar': 'كندا', 'hi': 'कनाडा', 'bn': 'কানাডা', 'ur': 'کینیڈا', 'tl': 'canada', 'sw': 'kanada', 'zh': '加拿大', 'ja': 'カナダ', 'de': 'kanada' },
  },
  {
    code: 'au', name: 'Australia', flag: '🇦🇺',
    currency: { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
    hreflang: ['en-au'], direction: 'ltr',
    lat: -25.2744, lng: 133.7751, jobCount: 2800,
    seoKeywords: ['jobs in Australia', 'Australia jobs 2025', 'Sydney jobs', 'Melbourne jobs', 'job vacancies Australia', 'Australian careers', 'work in Australia', 'Australia employment', 'Perth jobs', 'latest jobs Australia'],
    seoTitle: 'Jobs in Australia | Latest Job Vacancies & Careers 2025 - W-W',
    seoDescription: 'Discover 2,800+ job openings in Australia. Sydney, Melbourne, Brisbane & more. Top companies hiring in Tech, Finance, Mining. Free job search!',
    countrySlugs: { 'en': 'australia', 'pt-br': 'australia', 'pt-pt': 'australia', 'es': 'australia', 'fr': 'australie', 'ar': 'أستراليا', 'hi': 'ऑस्ट्रेलिया', 'bn': 'অস্ট্রেলিয়া', 'ur': 'آسٹریلیا', 'tl': 'australia', 'sw': 'australia', 'zh': '澳大利亚', 'ja': 'オーストラリア', 'de': 'australien' },
  },
  {
    code: 'jp', name: 'Japan', flag: '🇯🇵',
    currency: { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
    hreflang: ['ja-jp', 'en-jp'], direction: 'ltr',
    lat: 36.2048, lng: 138.2529, jobCount: 3500,
    seoKeywords: ['Jobs in Japan', 'Japan jobs 2025', 'Tokyo jobs', 'Osaka jobs', 'job vacancies Japan', 'Japanese careers', 'work in Japan', '求人', '就職', '転職'],
    seoTitle: 'Jobs in Japan | 求人・転職 2025 - W-W',
    seoDescription: 'Find the latest job vacancies in Japan. 3,500+ open positions in Tokyo, Osaka, Yokohama & more. Top companies hiring in Technology, Automotive, Finance. Free to browse!',
    countrySlugs: { 'en': 'japan', 'pt-br': 'japao', 'pt-pt': 'japao', 'es': 'japon', 'fr': 'japon', 'ar': 'اليابان', 'hi': 'जापान', 'bn': 'জাপান', 'ur': 'جاپان', 'tl': 'hapon', 'sw': 'japani', 'zh': '日本', 'ja': '日本', 'de': 'japan' },
  },
  {
    code: 'ch', name: 'Switzerland', flag: '🇨🇭',
    currency: { code: 'CHF', symbol: 'CHF', locale: 'de-CH' },
    hreflang: ['de-ch', 'fr-ch', 'it-ch', 'en-ch'], direction: 'ltr',
    lat: 46.8182, lng: 8.2275, jobCount: 1500,
    seoKeywords: ['jobs in Switzerland', 'Switzerland jobs 2025', 'Zurich jobs', 'Geneva jobs', 'Stellenangebote Schweiz', 'Swiss careers', 'work in Switzerland', 'emplois Suisse', 'Swiss employment', 'latest jobs Switzerland'],
    seoTitle: 'Jobs in Switzerland | Latest Job Vacancies & Careers 2025 - W-W',
    seoDescription: 'Discover 1,500+ job openings in Switzerland. Zurich, Geneva, Basel & more. Top companies hiring in Finance, Pharma, Technology. Free job search!',
    countrySlugs: { 'en': 'switzerland', 'pt-br': 'suica', 'pt-pt': 'suica', 'es': 'suiza', 'fr': 'suisse', 'ar': 'سويسرا', 'hi': 'स्विट्ज़रलैंड', 'bn': 'সুইজারল্যান্ড', 'ur': 'سوئٹزرلینڈ', 'tl': 'switzerland', 'sw': 'switzerland', 'zh': '瑞士', 'ja': 'スイス', 'de': 'schweiz' },
  },
  {
    code: 'fr', name: 'France', flag: '🇫🇷',
    currency: { code: 'EUR', symbol: '€', locale: 'fr-FR' },
    hreflang: ['fr-fr', 'en-fr'], direction: 'ltr',
    lat: 46.6034, lng: 1.8883, jobCount: 3100,
    seoKeywords: ['emplois en France', 'France jobs 2025', 'Paris jobs', 'Lyon jobs', 'offres emploi France', 'carrières France', 'travailler en France', 'French careers', 'emploi Paris', 'dernières offres France'],
    seoTitle: 'Emplois en France | Offres d\'Emploi & Carrières 2025 - W-W',
    seoDescription: 'Découvrez 3,100+ offres d\'emploi en France. Paris, Lyon, Marseille & plus. Entreprises leaders en Technologie, Finance, Industrie. Recherche gratuite!',
    countrySlugs: { 'en': 'france', 'pt-br': 'franca', 'pt-pt': 'franca', 'es': 'francia', 'fr': 'france', 'ar': 'فرنسا', 'hi': 'फ्रांस', 'bn': 'ফ্রান্স', 'ur': 'فرانس', 'tl': 'pransya', 'sw': 'ufaransa', 'zh': '法国', 'ja': 'フランス', 'de': 'frankreich' },
  },
  {
    code: 'nl', name: 'Netherlands', flag: '🇳🇱',
    currency: { code: 'EUR', symbol: '€', locale: 'nl-NL' },
    hreflang: ['nl-nl', 'en-nl'], direction: 'ltr',
    lat: 52.1326, lng: 5.2913, jobCount: 1800,
    seoKeywords: ['jobs in Netherlands', 'Netherlands jobs 2025', 'Amsterdam jobs', 'Rotterdam jobs', 'vacatures Nederland', 'Dutch careers', 'work in Netherlands', 'banen Nederland', 'Netherlands employment', 'latest jobs Netherlands'],
    seoTitle: 'Jobs in Netherlands | Vacatures & Carrières 2025 - W-W',
    seoDescription: 'Discover 1,800+ job openings in the Netherlands. Amsterdam, Rotterdam, The Hague & more. Top companies hiring in Tech, Finance, Engineering. Free job search!',
    countrySlugs: { 'en': 'netherlands', 'pt-br': 'holanda', 'pt-pt': 'holanda', 'es': 'paises-bajos', 'fr': 'pays-bas', 'ar': 'هولندا', 'hi': 'नीदरलैंड', 'bn': 'নেদারল্যান্ডস', 'ur': 'نیدرلینڈز', 'tl': 'netherlands', 'sw': 'netherlands', 'zh': '荷兰', 'ja': 'オランダ', 'de': 'niederlande' },
  },
  {
    code: 'sg', name: 'Singapore', flag: '🇸🇬',
    currency: { code: 'SGD', symbol: 'S$', locale: 'en-SG' },
    hreflang: ['en-sg', 'zh-sg', 'ms-sg', 'ta-sg'], direction: 'ltr',
    lat: 1.3521, lng: 103.8198, jobCount: 1600,
    seoKeywords: ['jobs in Singapore', 'Singapore jobs 2025', 'job vacancies Singapore', 'Singapore careers', 'work in Singapore', 'Singapore employment', 'tech jobs Singapore', 'finance jobs Singapore', 'latest jobs Singapore', 'Singapore hiring'],
    seoTitle: 'Jobs in Singapore | Latest Job Vacancies & Careers 2025 - W-W',
    seoDescription: 'Find the latest job vacancies in Singapore. 1,600+ open positions across the city-state. Top companies hiring in Technology, Finance, Logistics. Free to browse!',
    countrySlugs: { 'en': 'singapore', 'pt-br': 'singapura', 'pt-pt': 'singapura', 'es': 'singapur', 'fr': 'singapour', 'ar': 'سنغافورة', 'hi': 'सिंगापुर', 'bn': 'সিঙ্গাপুর', 'ur': 'سنگاپور', 'tl': 'singapore', 'sw': 'singapore', 'zh': '新加坡', 'ja': 'シンガポール', 'de': 'singapur' },
  },
  {
    code: 'ae', name: 'United Arab Emirates', flag: '🇦🇪',
    currency: { code: 'AED', symbol: 'AED', locale: 'ar-AE' },
    hreflang: ['ar-ae', 'en-ae', 'hi-ae'], direction: 'ltr',
    lat: 23.4241, lng: 53.8478, jobCount: 2200,
    seoKeywords: ['وظائف في الإمارات', 'UAE jobs 2025', 'Dubai jobs', 'Abu Dhabi jobs', 'وظائف دبي', 'UAE careers', 'work in UAE', 'Emirates employment', 'وظائف الإمارات', 'jobs Emirates'],
    seoTitle: 'Jobs in UAE | وظائف في الإمارات 2025 - W-W',
    seoDescription: 'Find the latest job vacancies in the UAE. 2,200+ open positions in Dubai, Abu Dhabi & more. Top companies hiring in Technology, Finance, Hospitality. Free to browse!',
    countrySlugs: { 'en': 'united-arab-emirates', 'pt-br': 'emirados-arabes', 'pt-pt': 'emirados-arabes', 'es': 'emiratos-arabes', 'fr': 'emirats-arabes-unis', 'ar': 'الإمارات العربية المتحدة', 'hi': 'संयुक्त अरब अमीरात', 'bn': 'সংযুক্ত আরব আমিরাত', 'ur': 'متحدہ عرب امارات', 'tl': 'united-arab-emirates', 'sw': 'united-arab-emirates', 'zh': '阿联酋', 'ja': 'アラブ首長国連邦', 'de': 'vereinigte-arabische-emirate' },
  },
  {
    code: 'br', name: 'Brazil', flag: '🇧🇷',
    currency: { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
    hreflang: ['pt-br', 'en-br'], direction: 'ltr',
    lat: -14.235, lng: -51.9253, jobCount: 4500,
    seoKeywords: ['vagas de emprego Brasil', 'empregos no Brasil', 'trabalhar no Brasil', 'vagas 2025 Brasil', 'emprego Brasil', 'vagas de trabalho', 'Brasil hiring', 'Brazil jobs', 'vagas SP', 'vagas Rio'],
    seoTitle: 'Vagas de Emprego no Brasil | Jobs in Brazil 2025 - W-W',
    seoDescription: 'Encontre as melhores vagas de emprego no Brasil. 4,500+ vagas abertas em São Paulo, Rio de Janeiro, Belo Horizonte & mais. Top empresas contratando. Pesquisa grátis!',
    countrySlugs: { 'en': 'brazil', 'pt-br': 'brasil', 'pt-pt': 'brasil', 'es': 'brasil', 'fr': 'bresil', 'ar': 'البرازيل', 'hi': 'ब्राज़ील', 'bn': 'ব্রাজিল', 'ur': 'برازیل', 'tl': 'brazil', 'sw': 'brazil', 'zh': '巴西', 'ja': 'ブラジル', 'de': 'brasilien' },
  },
];

export function getCountry(code: string): CountryConfig | undefined {
  return COUNTRIES.find(c => c.code === code);
}

export function getCountryName(code: string, lang?: string): string {
  const c = getCountry(code);
  if (!c) return code;
  if (lang) {
    const { countryNames } = require('./i18n');
    const translated = countryNames[lang as keyof typeof countryNames]?.[code];
    if (translated) return translated;
  }
  return c.name;
}

export const TOTAL_JOBS = COUNTRIES.reduce((sum, c) => sum + c.jobCount, 0);

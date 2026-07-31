// W-W Global Country Configuration
// Focused on high-unemployment, high-growth emerging markets

export interface CountryCurrency {
  code: string;      // ISO 4217: USD, INR, BRL, etc.
  symbol: string;    // $, Rs, R$, etc.
  locale: string;    // en-IN, pt-BR, etc.
}

export interface CountryConfig {
  code: string;           // URL slug: 'ng', 'za', 'in'
  name: string;           // English name
  flag: string;           // Emoji flag
  currency: CountryCurrency;
  hreflang: string[];     // e.g. ['en-ng', 'ha-ng']
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
    code: 'ng', name: 'Nigeria', flag: 'NG',
    currency: { code: 'NGN', symbol: 'N', locale: 'en-NG' },
    hreflang: ['en-ng', 'ha-ng', 'yo-ng', 'ig-ng'], direction: 'ltr',
    lat: 9.082, lng: 8.6753, jobCount: 2400,
    seoKeywords: ['jobs in Nigeria', 'Nigeria jobs 2025', 'Lagos jobs', 'Abuja jobs', 'job vacancies Nigeria', 'Nigeria employment', 'work in Nigeria', 'Nigerian careers', 'graduate jobs Nigeria', 'latest jobs Nigeria'],
    seoTitle: 'Jobs in Nigeria | Latest Job Vacancies & Careers 2025 - W-W',
    seoDescription: 'Find the latest job vacancies in Nigeria. 2,400+ open positions in Lagos, Abuja, Port Harcourt & more. Top companies hiring now in Technology, Finance, Healthcare. Free to browse!',
    countrySlugs: { 'en': 'nigeria', 'pt-br': 'nigeria', 'es': 'nigeria', 'fr': 'nigeria', 'ar': 'نيجيريا', 'hi': 'नाइजीरिया', 'bn': 'নাইজেরিয়া', 'ur': 'نائیجیریا', 'tl': 'nigeria', 'sw': 'nigeria', 'zh': '尼日利亚', 'ja': 'ナイジェリア', 'de': 'nigeria', 'pt-pt': 'nigeria' },
  },
  {
    code: 'za', name: 'South Africa', flag: 'ZA',
    currency: { code: 'ZAR', symbol: 'R', locale: 'en-ZA' },
    hreflang: ['en-za', 'af-za', 'zu-za', 'xh-za'], direction: 'ltr',
    lat: -30.5595, lng: 22.9375, jobCount: 1800,
    seoKeywords: ['jobs in South Africa', 'South Africa jobs 2025', 'Cape Town jobs', 'Johannesburg jobs', 'job vacancies SA', 'South Africa careers', 'work in South Africa', 'Durban jobs', 'graduate jobs South Africa'],
    seoTitle: 'Jobs in South Africa | Latest Vacancies & Careers 2025 - W-W',
    seoDescription: 'Discover 1,800+ job openings in South Africa. Johannesburg, Cape Town, Durban & more. Top companies hiring in Tech, Finance, Mining. Free job search!',
    countrySlugs: { 'en': 'south-africa', 'pt-br': 'africa-do-sul', 'es': 'sudafrika', 'fr': 'afrique-du-sud', 'ar': 'جنوب أفريقيا', 'hi': 'दक्षिण अफ्रीका', 'bn': 'দক্ষিণ আফ্রিকা', 'ur': 'جنوبی افریقا', 'tl': 'timog-aprika', 'sw': 'afrika-kusini', 'zh': '南非', 'ja': '南アフリカ', 'de': 'suedafrika', 'pt-pt': 'africa-do-sul' },
  },
  {
    code: 'in', name: 'India', flag: 'IN',
    currency: { code: 'INR', symbol: 'Rs', locale: 'en-IN' },
    hreflang: ['en-in', 'hi-in', 'bn-in', 'ta-in', 'te-in'], direction: 'ltr',
    lat: 20.5937, lng: 78.9629, jobCount: 5200,
    seoKeywords: ['jobs in India', 'India jobs 2025', 'apply jobs India', 'India hiring', 'job vacancies India', 'India employment', 'work in India', 'career India', 'Indian job portal', 'latest jobs India', 'fresher jobs India'],
    seoTitle: 'Jobs in India | Latest Job Vacancies & Careers 2025 - W-W',
    seoDescription: 'Find the latest job vacancies in India. 5,200+ open positions in Bangalore, Mumbai, Delhi & more. Top companies hiring now in Technology, Finance, Healthcare. Free to browse!',
    countrySlugs: { 'en': 'india', 'pt-br': 'india', 'es': 'india', 'fr': 'inde', 'ar': 'الهند', 'hi': 'भारत', 'bn': 'ভারত', 'ur': 'ہندوستان', 'tl': 'india', 'sw': 'india', 'zh': '印度', 'ja': 'インド', 'de': 'indien', 'pt-pt': 'india' },
  },
  {
    code: 'ke', name: 'Kenya', flag: 'KE',
    currency: { code: 'KES', symbol: 'KSh', locale: 'en-KE' },
    hreflang: ['en-ke', 'sw-ke'], direction: 'ltr',
    lat: -0.0236, lng: 37.9062, jobCount: 1200,
    seoKeywords: ['jobs in Kenya', 'Kenya jobs 2025', 'Nairobi jobs', 'Mombasa jobs', 'job vacancies Kenya', 'Kenya careers', 'work in Kenya', 'Kenyan employment'],
    seoTitle: 'Jobs in Kenya | Latest Job Vacancies & Careers 2025 - W-W',
    seoDescription: 'Browse 1,200+ job vacancies in Kenya. Nairobi, Mombasa, Kisumu & more. Top companies hiring in Technology, Finance, NGO sector. Free job search!',
    countrySlugs: { 'en': 'kenya', 'pt-br': 'quenia', 'es': 'kenia', 'fr': 'kenya', 'ar': 'كينيا', 'hi': 'कीनिया', 'bn': 'কেনিয়া', 'ur': 'کینیا', 'tl': 'kenya', 'sw': 'kenya', 'zh': '肯尼亚', 'ja': 'ケニア', 'de': 'kenia', 'pt-pt': 'quenia' },
  },
  {
    code: 'eg', name: 'Egypt', flag: 'EG',
    currency: { code: 'EGP', symbol: 'E£', locale: 'ar-EG' },
    hreflang: ['ar-eg', 'en-eg'], direction: 'ltr',
    lat: 26.8206, lng: 30.8025, jobCount: 1600,
    seoKeywords: ['وظائف في مصر', 'Egypt jobs 2025', 'وظائف القاهرة', 'Cairo jobs', 'job vacancies Egypt', 'work in Egypt', 'عمل في مصر', 'Egypt careers'],
    seoTitle: 'وظائف في مصر | Jobs in Egypt 2025 - W-W',
    seoDescription: 'Browse 1,600+ job vacancies in Egypt. Cairo, Alexandria, Giza & more. Top companies hiring in Technology, Engineering, Finance. بحث مجاني!',
    countrySlugs: { 'en': 'egypt', 'pt-br': 'egito', 'es': 'egipto', 'fr': 'egypte', 'ar': 'مصر', 'hi': 'मिस्र', 'bn': 'মিসর', 'ur': 'مصر', 'tl': 'egypt', 'sw': 'misri', 'zh': '埃及', 'ja': 'エジプト', 'de': 'aegypten', 'pt-pt': 'egito' },
  },
  {
    code: 'ph', name: 'Philippines', flag: 'PH',
    currency: { code: 'PHP', symbol: '₱', locale: 'en-PH' },
    hreflang: ['en-ph', 'tl-ph'], direction: 'ltr',
    lat: 12.8797, lng: 121.7740, jobCount: 1400,
    seoKeywords: ['jobs in Philippines', 'Philippines jobs 2025', 'Manila jobs', 'Cebu jobs', 'job vacancies Philippines', 'work in Philippines', 'Philippine careers', 'Pinoy jobs'],
    seoTitle: 'Jobs in Philippines | Mga Trabaho 2025 - W-W',
    seoDescription: 'Find 1,400+ job openings in the Philippines. Manila, Cebu, Davao & more. Top companies hiring in BPO, Technology, Healthcare. Free job search!',
    countrySlugs: { 'en': 'philippines', 'pt-br': 'filipinas', 'es': 'filipinas', 'fr': 'philippines', 'ar': 'الفلبين', 'hi': 'फिलीपीन्स', 'bn': 'ফিলিপাইন', 'ur': 'فلپائن', 'tl': 'pilipinas', 'sw': 'filipino', 'zh': '菲律宾', 'ja': 'フィリピン', 'de': 'philippinen', 'pt-pt': 'filipinas' },
  },
  {
    code: 'gh', name: 'Ghana', flag: 'GH',
    currency: { code: 'GHS', symbol: 'GH¢', locale: 'en-GH' },
    hreflang: ['en-gh', 'ak-gh'], direction: 'ltr',
    lat: 7.9465, lng: -1.0232, jobCount: 800,
    seoKeywords: ['jobs in Ghana', 'Ghana jobs 2025', 'Accra jobs', 'Kumasi jobs', 'job vacancies Ghana', 'Ghana careers', 'work in Ghana', 'Ghanaian employment'],
    seoTitle: 'Jobs in Ghana | Latest Job Vacancies & Careers 2025 - W-W',
    seoDescription: 'Browse 800+ job vacancies in Ghana. Accra, Kumasi, Tamale & more. Top companies hiring in Technology, Mining, Finance. Free job search!',
    countrySlugs: { 'en': 'ghana', 'pt-br': 'gana', 'es': 'ghana', 'fr': 'ghana', 'ar': 'غانا', 'hi': 'घाना', 'bn': 'ঘানা', 'ur': 'غانا', 'tl': 'ghana', 'sw': 'ghana', 'zh': '加纳', 'ja': 'ガーナ', 'de': 'ghana', 'pt-pt': 'gana' },
  },
  {
    code: 'pk', name: 'Pakistan', flag: 'PK',
    currency: { code: 'PKR', symbol: 'Rs', locale: 'ur-PK' },
    hreflang: ['ur-pk', 'en-pk'], direction: 'ltr',
    lat: 30.3753, lng: 69.3451, jobCount: 1500,
    seoKeywords: ['jobs in Pakistan', 'Pakistan jobs 2025', 'Karachi jobs', 'Lahore jobs', 'Islamabad jobs', 'job vacancies Pakistan', 'work in Pakistan', 'Pakistani careers'],
    seoTitle: 'Jobs in Pakistan | نوکریات پاکستان 2025 - W-W',
    seoDescription: 'Find 1,500+ job vacancies in Pakistan. Karachi, Lahore, Islamabad & more. Top companies hiring in Technology, Finance, Telecom. Free job search!',
    countrySlugs: { 'en': 'pakistan', 'pt-br': 'paquistao', 'es': 'pakistan', 'fr': 'pakistan', 'ar': 'باكستان', 'hi': 'पाकिस्तान', 'bn': 'পাকিস্তান', 'ur': 'پاکستان', 'tl': 'pakistan', 'sw': 'pakistan', 'zh': '巴基斯坦', 'ja': 'パキスタン', 'de': 'pakistan', 'pt-pt': 'paquistao' },
  },
  {
    code: 'bd', name: 'Bangladesh', flag: 'BD',
    currency: { code: 'BDT', symbol: '৳', locale: 'bn-BD' },
    hreflang: ['bn-bd', 'en-bd'], direction: 'ltr',
    lat: 23.6850, lng: 90.3563, jobCount: 1100,
    seoKeywords: ['চাকরি বাংলাদেশ', 'jobs in Bangladesh', 'Bangladesh jobs 2025', 'Dhaka jobs', 'job vacancies Bangladesh', 'work in Bangladesh', 'Bangladeshi careers'],
    seoTitle: 'চাকরি বাংলাদেশ | Jobs in Bangladesh 2025 - W-W',
    seoDescription: 'বাংলাদেশে 1,100+ চাকরির সুযোগ খুঁজুন। ঢাকা, চট্টগ্রাম ও আরও অনেক শহরের চাকরি। বিনা মুল্যে খুঁজুন!',
    countrySlugs: { 'en': 'bangladesh', 'pt-br': 'bangladesh', 'es': 'bangladesh', 'fr': 'bangladesh', 'ar': 'بنغلاديش', 'hi': 'बांग्लादेश', 'bn': 'বাংলাদেশ', 'ur': 'بنگلادیش', 'tl': 'bangladesh', 'sw': 'bangladeshi', 'zh': '孟加拉国', 'ja': 'バングラデシュ', 'de': 'bangladesch', 'pt-pt': 'bangladesh' },
  },
  {
    code: 'br', name: 'Brazil', flag: 'BR',
    currency: { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
    hreflang: ['pt-br', 'en-br'], direction: 'ltr',
    lat: -14.235, lng: -51.9253, jobCount: 3200,
    seoKeywords: ['vagas de emprego Brasil', 'empregos no Brasil', 'trabalhar no Brasil', 'vagas 2025 Brasil', 'emprego Brasil', 'vagas de trabalho', 'Brasil hiring', 'Brazil jobs', 'vagas SP', 'vagas Rio'],
    seoTitle: 'Vagas de Emprego no Brasil | Jobs in Brazil 2025 - W-W',
    seoDescription: 'Encontre as melhores vagas de emprego no Brasil. 3,200+ vagas abertas em Sao Paulo, Rio de Janeiro, Belo Horizonte & mais. Top empresas contratando. Pesquisa gratis!',
    countrySlugs: { 'en': 'brazil', 'pt-br': 'brasil', 'es': 'brasil', 'fr': 'bresil', 'ar': 'البرازيل', 'hi': 'ब्राज़िल', 'bn': 'ব্রাজিল', 'ur': 'برازیل', 'tl': 'brazil', 'sw': 'brazil', 'zh': '巴西', 'ja': 'ブラジル', 'de': 'brasilien', 'pt-pt': 'brasil' },
  },
  {
    code: 'co', name: 'Colombia', flag: 'CO',
    currency: { code: 'COP', symbol: '$', locale: 'es-CO' },
    hreflang: ['es-co', 'en-co'], direction: 'ltr',
    lat: 4.5709, lng: -74.2973, jobCount: 1300,
    seoKeywords: ['trabajos en Colombia', 'empleo Colombia', 'vacantes Colombia', 'trabajar en Colombia', 'bolsa de trabajo Colombia', 'Bogota jobs', 'Medellin jobs'],
    seoTitle: 'Trabajos en Colombia | Empleo & Vacantes 2025 - W-W',
    seoDescription: 'Encuentra 1,300+ vacantes de empleo en Colombia. Bogota, Medellin, Cali & mas. Empresas lideres contratando en Tecnologia, Finanzas, Salud. Busqueda gratis!',
    countrySlugs: { 'en': 'colombia', 'pt-br': 'colombia', 'es': 'colombia', 'fr': 'colombie', 'ar': 'كولومبيا', 'hi': 'कोलंबिया', 'bn': 'কোলোম্বিয়া', 'ur': 'کولومبیا', 'tl': 'colombia', 'sw': 'kolombia', 'zh': '哥伦比亚', 'ja': 'コロンビア', 'de': 'kolumbien', 'pt-pt': 'colombia' },
  },
  {
    code: 'ma', name: 'Morocco', flag: 'MA',
    currency: { code: 'MAD', symbol: 'MAD', locale: 'ar-MA' },
    hreflang: ['ar-ma', 'fr-ma', 'en-ma'], direction: 'ltr',
    lat: 31.7917, lng: -7.0926, jobCount: 900,
    seoKeywords: ['وظائف المغرب', 'Morocco jobs 2025', 'معتمد الخريج', 'Casablanca jobs', 'job vacancies Morocco', 'travail Maroc', 'emplois Maroc', 'work in Morocco'],
    seoTitle: 'وظائف المغرب | Emplois au Maroc 2025 - W-W',
    seoDescription: 'Browse 900+ job vacancies in Morocco. Casablanca, Rabat, Marrakech & more. Top companies hiring in Technology, Tourism, Finance. Free job search!',
    countrySlugs: { 'en': 'morocco', 'pt-br': 'marrocos', 'es': 'marruecos', 'fr': 'maroc', 'ar': 'المغرب', 'hi': 'मॉरोक्को', 'bn': 'মরোক্কো', 'ur': 'مراکش', 'tl': 'morocco', 'sw': 'moroko', 'zh': '摩洛哥', 'ja': 'モロッコ', 'de': 'marokko', 'pt-pt': 'marrocos' },
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

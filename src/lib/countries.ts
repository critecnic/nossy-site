// W-W Global Country Configuration
// All countries are equal - no priority ranking

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
  lat: number;
  lng: number;
  jobCount: number;       // Mock: number of jobs for this country
  seoKeywords: string[];  // Country-specific SEO keywords for high-unemployment targeting
  seoTitle: string;       // SEO-optimized page title for this country
  seoDescription: string; // Meta description targeting job seekers
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: 'in', name: 'India', flag: '🇮🇳',
    currency: { code: 'INR', symbol: '₹', locale: 'en-IN' },
    hreflang: ['en-in', 'hi-in'], direction: 'ltr',
    lat: 20.5937, lng: 78.9629, jobCount: 1840,
    seoKeywords: ['jobs in India', 'India jobs 2025', 'apply jobs India', 'India hiring', 'job vacancies India', 'India employment', 'work in India', 'career India', 'Indian job portal', 'latest jobs India'],
    seoTitle: 'Jobs in India | Latest Job Vacancies & Careers 2025 - W-W',
    seoDescription: 'Find the latest job vacancies in India. 1,840+ open positions in Technology, Finance, Healthcare & more. Top companies hiring now. Free to browse - apply today!',
  },
  {
    code: 'us', name: 'United States', flag: '🇺🇸',
    currency: { code: 'USD', symbol: '$', locale: 'en-US' },
    hreflang: ['en-us'], direction: 'ltr',
    lat: 37.0902, lng: -95.7129, jobCount: 2150,
    seoKeywords: ['jobs in USA', 'US jobs hiring', 'America jobs', 'United States careers', 'job openings USA', 'work in America', 'US employment', 'American job vacancies'],
    seoTitle: 'Jobs in USA | Latest Job Openings & Careers 2025 - W-W',
    seoDescription: 'Discover 2,150+ job openings in the United States. Top companies across Technology, Finance, Healthcare are hiring. Browse free and apply today!',
  },
  {
    code: 'cn', name: 'China', flag: '🇨🇳',
    currency: { code: 'CNY', symbol: '¥', locale: 'zh-CN' },
    hreflang: ['zh-cn', 'en-cn'], direction: 'ltr',
    lat: 35.8617, lng: 104.1954, jobCount: 1560,
    seoKeywords: ['jobs in China', 'China jobs', 'Chinese careers', 'work in China', 'China hiring 2025', 'job vacancies China', 'China employment', '中国工作', '找工作', '中国招聘'],
    seoTitle: 'Jobs in China | 中国工作 | Latest Careers & Vacancies - W-W',
    seoDescription: 'Explore 1,560+ job vacancies in China. Top employers in Technology, Engineering, Data Science. Local salary info. Free job search - apply now!',
  },
  {
    code: 'br', name: 'Brazil', flag: '🇧🇷',
    currency: { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
    hreflang: ['pt-br', 'en-br'], direction: 'ltr',
    lat: -14.235, lng: -51.9253, jobCount: 980,
    seoKeywords: ['vagas de emprego Brasil', 'empregos no Brasil', 'trabalhar no Brasil', 'vagas 2025 Brasil', 'concursos Brasil', 'emprego Brasil', 'vagas de trabalho', 'Brasil hiring', 'Brazil jobs'],
    seoTitle: 'Vagas de Emprego no Brasil | Jobs in Brazil 2025 - W-W',
    seoDescription: 'Encontre as melhores vagas de emprego no Brasil. 980+ vagas abertas em Tecnologia, Finanças, Saúde. Top empresas contratando. Pesquisa grátis!',
  },
  {
    code: 'gb', name: 'United Kingdom', flag: '🇬🇧',
    currency: { code: 'GBP', symbol: '£', locale: 'en-GB' },
    hreflang: ['en-gb'], direction: 'ltr',
    lat: 55.3781, lng: -3.436, jobCount: 1340,
    seoKeywords: ['jobs in UK', 'UK jobs', 'United Kingdom careers', 'job vacancies UK', 'work in London', 'Britain jobs', 'UK employment', 'British job openings'],
    seoTitle: 'Jobs in UK | United Kingdom Job Vacancies & Careers 2025 - W-W',
    seoDescription: 'Browse 1,340+ job vacancies in the United Kingdom. Top companies hiring across London, Manchester & more. Free job search with salary details.',
  },
  {
    code: 'de', name: 'Germany', flag: '🇩🇪',
    currency: { code: 'EUR', symbol: '€', locale: 'de-DE' },
    hreflang: ['de-de', 'en-de'], direction: 'ltr',
    lat: 51.1657, lng: 10.4515, jobCount: 1120,
    seoKeywords: ['Jobs in Deutschland', 'Stellenangebote', 'Arbeitsplätze Deutschland', 'Jobs Deutschland 2025', 'arbeiten in Deutschland', 'German jobs', 'Stellenanzeigen', 'Karriere Deutschland'],
    seoTitle: 'Jobs in Deutschland | Stellenangebote & Karriere 2025 - W-W',
    seoDescription: '1.120+ Stellenangebote in Deutschland. Top-Arbeitgeber in Technologie, Finanzen, Ingenieurwesen. Kostenlos durchsuchen und bewerben!',
  },
  {
    code: 'fr', name: 'France', flag: '🇫🇷',
    currency: { code: 'EUR', symbol: '€', locale: 'fr-FR' },
    hreflang: ['fr-fr', 'en-fr'], direction: 'ltr',
    lat: 46.6034, lng: 1.8883, jobCount: 890,
    seoKeywords: ['emploi France', 'offres emploi', 'travail France', 'postes vacants France', 'recrutement France', 'France jobs', 'annonces emploi', 'chercher emploi France'],
    seoTitle: 'Emploi en France | Offres d\'Emploi & Recrutement 2025 - W-W',
    seoDescription: '890+ offres d\'emploi en France. Entreprises leaders recrutent en Technologie, Finance, Santé. Recherche gratuite avec salaires détaillés.',
  },
  {
    code: 'jp', name: 'Japan', flag: '🇯🇵',
    currency: { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
    hreflang: ['ja-jp', 'en-jp'], direction: 'ltr',
    lat: 36.2048, lng: 138.2529, jobCount: 1050,
    seoKeywords: ['Japan jobs', '日本の求人', '就職', '仵資格', 'work in Japan', '求人情報', 'Japanese careers', 'job vacancies Japan'],
    seoTitle: 'Jobs in Japan | 日本の求人 | Careers & Vacancies 2025 - W-W',
    seoDescription: '1.050+ job vacancies in Japan. Top companies hiring in Technology, Engineering, Design. Local salary info. Free job search - apply now!',
  },
  {
    code: 'ca', name: 'Canada', flag: '🇨🇦',
    currency: { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
    hreflang: ['en-ca', 'fr-ca'], direction: 'ltr',
    lat: 56.1304, lng: -106.3468, jobCount: 780,
    seoKeywords: ['jobs in Canada', 'Canadian jobs', 'work in Canada', 'Canada hiring 2025', 'job openings Canada', 'Canada careers', 'Canadian employment', 'Toronto jobs'],
    seoTitle: 'Jobs in Canada | Canadian Job Openings & Careers 2025 - W-W',
    seoDescription: 'Find 780+ job openings across Canada. Top employers in Toronto, Vancouver & more. Free job search with local salary information.',
  },
  {
    code: 'au', name: 'Australia', flag: '🇦🇺',
    currency: { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
    hreflang: ['en-au'], direction: 'ltr',
    lat: -25.2744, lng: 133.7751, jobCount: 650,
    seoKeywords: ['jobs in Australia', 'Australian jobs', 'work in Australia', 'Australia hiring', 'job vacancies Australia', 'Australia careers', 'Sydney jobs', 'Australia employment'],
    seoTitle: 'Jobs in Australia | Australian Job Vacancies & Careers 2025 - W-W',
    seoDescription: 'Explore 650+ job vacancies in Australia. Leading companies hiring in Sydney, Melbourne & more. Free job search with salary details.',
  },
  {
    code: 'mx', name: 'Mexico', flag: '🇲🇽',
    currency: { code: 'MXN', symbol: 'MX$', locale: 'es-MX' },
    hreflang: ['es-mx', 'en-mx'], direction: 'ltr',
    lat: 23.6345, lng: -102.5528, jobCount: 520,
    seoKeywords: ['trabajos en México', 'empleo México', 'vacantes México', 'trabajar en México', 'bolsa de trabajo', 'México hiring', 'ofertas empleo', 'Mexico jobs 2025'],
    seoTitle: 'Trabajos en México | Empleo & Vacantes 2025 - W-W',
    seoDescription: '520+ vacantes de empleo en México. Empresas líderes contratando en Tecnología, Finanzas, Salud. Búsqueda gratis con salarios locales.',
  },
  {
    code: 'id', name: 'Indonesia', flag: '🇮🇩',
    currency: { code: 'IDR', symbol: 'Rp', locale: 'id-ID' },
    hreflang: ['id-id', 'en-id'], direction: 'ltr',
    lat: -0.7893, lng: 113.9213, jobCount: 410,
    seoKeywords: ['lowongan kerja Indonesia', 'kerja Indonesia', 'lowongan kerja 2025', 'karir Indonesia', 'jobs Indonesia', 'work in Indonesia', 'Indonesia hiring'],
    seoTitle: 'Lowongan Kerja Indonesia | Jobs & Karir 2025 - W-W',
    seoDescription: 'Temukan 410+ lowongan kerja di Indonesia. Perusahaan terkemuka merekrut di Teknologi, Keuangan, Kesehatan. Gratis!',
  },
  {
    code: 'kr', name: 'South Korea', flag: '🇰🇷',
    currency: { code: 'KRW', symbol: '₩', locale: 'ko-KR' },
    hreflang: ['ko-kr', 'en-kr'], direction: 'ltr',
    lat: 35.9078, lng: 127.7669, jobCount: 580,
    seoKeywords: ['South Korea jobs', '사직관리', '최관직', '한국 취업', 'Korea careers', 'work in Korea', 'job vacancies Korea'],
    seoTitle: 'Jobs in South Korea | 한국 취업 | Careers 2025 - W-W',
    seoDescription: '580+ job openings in South Korea. Top companies in Seoul & beyond. Technology, Engineering, Design roles. Free job search!',
  },
  {
    code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦',
    currency: { code: 'SAR', symbol: '﷼', locale: 'ar-SA' },
    hreflang: ['ar-sa', 'en-sa'], direction: 'rtl',
    lat: 23.8859, lng: 45.0792, jobCount: 340,
    seoKeywords: ['وظائف السعودية', 'وظائف', 'عمل السعودية', 'Saudi Arabia jobs', 'work in Saudi', 'Saudi careers', 'Riyadh jobs'],
    seoTitle: 'وظائف في السعودية | Jobs in Saudi Arabia 2025 - W-W',
    seoDescription: 'ابحث عن 340+ وظيفة في السعودية. شركات رائدة توظف في التكنولوجيا والمالية. بحث مجاني!',
  },
  {
    code: 'ae', name: 'UAE', flag: '🇦🇪',
    currency: { code: 'AED', symbol: 'د.إ', locale: 'ar-AE' },
    hreflang: ['ar-ae', 'en-ae'], direction: 'ltr',
    lat: 23.4241, lng: 53.8478, jobCount: 460,
    seoKeywords: ['jobs in UAE', 'Dubai jobs', 'Abu Dhabi jobs', 'work in UAE', 'UAE careers', 'Emirates jobs', 'Gulf jobs', 'UAE hiring 2025'],
    seoTitle: 'Jobs in UAE | Dubai & Abu Dhabi Careers 2025 - W-W',
    seoDescription: '460+ job openings in UAE. Dubai, Abu Dhabi & beyond. Top companies in Tech, Finance, Healthcare. Free job search with salary info.',
  },
  {
    code: 'es', name: 'Spain', flag: '🇪🇸',
    currency: { code: 'EUR', symbol: '€', locale: 'es-ES' },
    hreflang: ['es-es', 'en-es'], direction: 'ltr',
    lat: 40.4637, lng: -3.7492, jobCount: 590,
    seoKeywords: ['trabajo España', 'empleo España', 'ofertas de trabajo', 'trabajar en España', 'España jobs', 'Spain careers', 'Madrid jobs', 'España hiring 2025'],
    seoTitle: 'Trabajo en España | Empleo & Ofertas de Trabajo 2025 - W-W',
    seoDescription: '590+ ofertas de trabajo en España. Empresas líderes contratando en Madrid, Barcelona y más. Búsqueda gratuita con salarios.',
  },
  {
    code: 'it', name: 'Italy', flag: '🇮🇹',
    currency: { code: 'EUR', symbol: '€', locale: 'it-IT' },
    hreflang: ['it-it', 'en-it'], direction: 'ltr',
    lat: 41.8719, lng: 12.5674, jobCount: 470,
    seoKeywords: ['lavoro Italia', 'offerte di lavoro', 'lavorare in Italia', 'annunci lavoro', 'Italy jobs', 'Italian careers', 'Rome jobs', 'Italia hiring 2025'],
    seoTitle: 'Lavoro in Italia | Offerte di Lavoro & Carriera 2025 - W-W',
    seoDescription: '470+ offerte di lavoro in Italia. Aziende leader assumono a Milano, Roma e oltre. Ricerca gratuita con dettagli sullo stipendio.',
  },
  {
    code: 'pt', name: 'Portugal', flag: '🇵🇹',
    currency: { code: 'EUR', symbol: '€', locale: 'pt-PT' },
    hreflang: ['pt-pt', 'en-pt'], direction: 'ltr',
    lat: 39.3999, lng: -8.2245, jobCount: 320,
    seoKeywords: ['emprego Portugal', 'ofertas de emprego', 'trabalhar em Portugal', 'vagas Portugal', 'Portugal jobs', 'Lisboa emprego', 'Portugal careers', 'recrutamento Portugal'],
    seoTitle: 'Emprego em Portugal | Ofertas de Emprego 2025 - W-W',
    seoDescription: '320+ ofertas de emprego em Portugal. Empresas líderes em Lisboa, Porto e mais. Pesquisa gratuita com salários detalhados.',
  },
  {
    code: 'ng', name: 'Nigeria', flag: '🇳🇬',
    currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
    hreflang: ['en-ng'], direction: 'ltr',
    lat: 9.082, lng: 8.6753, jobCount: 280,
    seoKeywords: ['jobs in Nigeria', 'Nigeria jobs', 'Lagos jobs', 'work in Nigeria', 'Nigerian careers', 'job vacancies Nigeria', 'Nigeria employment', 'Nigeria hiring 2025'],
    seoTitle: 'Jobs in Nigeria | Latest Job Vacancies & Careers 2025 - W-W',
    seoDescription: 'Find 280+ job vacancies in Nigeria. Lagos, Abuja & beyond. Top companies hiring in Technology, Finance, Healthcare. Free job search!',
  },
  {
    code: 'tr', name: 'Turkey', flag: '🇹🇷',
    currency: { code: 'TRY', symbol: '₺', locale: 'tr-TR' },
    hreflang: ['tr-tr', 'en-tr'], direction: 'ltr',
    lat: 38.9637, lng: 35.2433, jobCount: 350,
    seoKeywords: ['Türkiye iş ilanları', 'İş ilanları', 'İstanbul iş', 'çalışma Türkiye', 'Turkey jobs', 'Turkish careers', 'Istanbul jobs', 'Turkey employment 2025'],
    seoTitle: 'Türkiye İş İlanları | Jobs in Turkey 2025 - W-W',
    seoDescription: '350+ iş ilanı Türkiye\'de. İstanbul, Ankara ve dışında önde gelen şirketler. Üret detaylarıyla ücretsiz iş arama!',
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
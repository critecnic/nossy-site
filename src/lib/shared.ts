// Shared constants used across all pages - eliminates duplication

import type { Lang } from './i18n';

export const REGION_NAMES: Record<string, Record<string, string>> = {
  en: { europa: "Europe", asia: "Asia", eua: "United States", oceania: "Oceania", "america-do-norte": "North America" },
  "pt-br": { europa: "Europa", asia: "Asia", eua: "Estados Unidos", oceania: "Oceania", "america-do-norte": "América do Norte" },
  "pt-pt": { europa: "Europa", asia: "Asia", eua: "Estados Unidos", oceania: "Oceania", "america-do-norte": "América do Norte" },
  es: { europa: "Europa", asia: "Asia", eua: "Estados Unidos", oceania: "Oceanía", "america-do-norte": "América del Norte" },
  fr: { europa: "Europe", asia: "Asie", eua: "Etats-Unis", oceania: "Océanie", "america-do-norte": "Amérique du Nord" },
  de: { europa: "Europa", asia: "Asien", eua: "USA", oceania: "Ozeanien", "america-do-norte": "Nordamerika" },
  it: { europa: "Europa", asia: "Asia", eua: "Stati Uniti", oceania: "Oceania", "america-do-norte": "Nord America" },
  nl: { europa: "Europa", asia: "Azie", eua: "VS", oceania: "Oceanië", "america-do-norte": "Noord-Amerika" },
  pl: { europa: "Europa", asia: "Azja", eua: "USA", oceania: "Oceania", "america-do-norte": "Ameryka Pólnocna" },
  ru: { europa: "Evropa", asia: "Aziya", eua: "SShA", oceania: "Okeaniya", "america-do-norte": "Severnaya Amerika" },
  zh: { europa: "欧洲", asia: "亚洲", eua: "美国", oceania: "大洋洲", "america-do-norte": "北美洲" },
  ja: { europa: "ヨーロッパ", asia: "アジア", eua: "アメリカ", oceania: "オセアニア", "america-do-norte": "北米" },
  ko: { europa: "유럽", asia: "아시아", eua: "미국", oceania: "오세아니아", "america-do-norte": "북미" },
  hi: { europa: "यूरोप", asia: "एशिया", eua: "अमेरिका", oceania: "ओशियानिया", "america-do-norte": "उत्तर अमेरिका" },
  bn: { europa: "ইউরোপ", asia: "এশিয়া", eua: "যুক্তরাষ্ট্র", oceania: "ওশেনিয়া", "america-do-norte": "উত্তর আমেরিকা" },
  ar: { europa: "أوروبا", asia: "آسيا", eua: "الولايات المتحدة", oceania: "أوقيانوسيا", "america-do-norte": "أمريكا الشمالية" },
  tr: { europa: "Avrupa", asia: "Asya", eua: "ABD", oceania: "Okyanusya", "america-do-norte": "Kuzey Amerika" },
  vi: { europa: "Chau Au", asia: "Chau A", eua: "My", oceania: "Chau Dai Duong", "america-do-norte": "Bac My" },
  th: { europa: "ยุโรป", asia: "เอเชีย", eua: "อเมริกา", oceania: "โอเชียเนีย", "america-do-norte": "อเมริกาเหนือ" },
  ur: { europa: "یورپ", asia: "ایشیا", eua: "امریکہ", oceania: "اوشیانیا", "america-do-norte": "شمالی امریکہ" },
  tl: { europa: "Europa", asia: "Asia", eua: "USA", oceania: "Oceania", "america-do-norte": "North America" },
  sw: { europa: "Ulaya", asia: "Asia", eua: "Marekani", oceania: "Oseania", "america-do-norte": "Amerika ya Kaskazini" },
};

export function getRegionName(lang: string, regionCode: string): string {
  return REGION_NAMES[lang]?.[regionCode] || regionCode;
}

export const SECTOR_META: Record<string, { icon: string; color: string }> = {
  "Software Engineering": { icon: "💻", color: "from-blue-500 to-cyan-400" },
  "Cloud & DevOps": { icon: "☁️", color: "from-sky-500 to-blue-400" },
  "Data Science & Analytics": { icon: "📊", color: "from-violet-500 to-purple-400" },
  "AI & Machine Learning": { icon: "🤖", color: "from-fuchsia-500 to-pink-400" },
  "Product Management": { icon: "📋", color: "from-amber-500 to-orange-400" },
  Cybersecurity: { icon: "🔒", color: "from-red-500 to-rose-400" },
  "Engineering Leadership": { icon: "👑", color: "from-purple-500 to-indigo-400" },
  Consulting: { icon: "🤝", color: "from-teal-500 to-cyan-400" },
  "Data Engineering": { icon: "🗄️", color: "from-indigo-500 to-blue-400" },
  "UX/UI & Design": { icon: "🎨", color: "from-pink-500 to-rose-400" },
  "QA & Testing": { icon: "✅", color: "from-green-500 to-emerald-400" },
  "Mobile Development": { icon: "📱", color: "from-blue-600 to-violet-400" },
  "Game Development": { icon: "🎮", color: "from-emerald-500 to-green-400" },
  "Specialized Development": { icon: "⚡", color: "from-yellow-500 to-amber-400" },
  "Embedded & IoT": { icon: "🔌", color: "from-stone-500 to-neutral-400" },
  "Writing & Content": { icon: "✍️", color: "from-lime-500 to-green-400" },
  "Sales & Marketing": { icon: "📢", color: "from-orange-500 to-red-400" },
  "Finance Technology": { icon: "💰", color: "from-emerald-600 to-green-500" },
  "IT Support & Operations": { icon: "🔧", color: "from-gray-500 to-slate-400" },
  "Research & Development": { icon: "🔬", color: "from-cyan-500 to-teal-400" },
  Other: { icon: "📂", color: "from-sky-400 to-blue-500" },
};

export function getSectorMeta(name: string) {
  return SECTOR_META[name] || { icon: "📂", color: "from-sky-400 to-blue-500" };
}

export const TYPE_STYLES: Record<string, string> = {
  Remoto: "bg-green-50 text-green-700 border-green-200",
  Hibrido: "bg-amber-50 text-amber-700 border-amber-200",
  Presencial: "bg-blue-50 text-blue-700 border-blue-200",
  Remote: "bg-green-50 text-green-700 border-green-200",
  Hybrid: "bg-amber-50 text-amber-700 border-amber-200",
  "On-site": "bg-blue-50 text-blue-700 border-blue-200",
};

export function getTypeStyle(type: string): string {
  return TYPE_STYLES[type] || "bg-gray-50 text-gray-700 border-gray-200";
}

export const TYPE_LABELS: Record<string, Record<string, string>> = {
  en: { all: "All Types", Remoto: "Remote", Hibrido: "Hybrid", Presencial: "On-site", Remote: "Remote", Hybrid: "Hybrid", "On-site": "On-site" },
  "pt-br": { all: "Todos", Remoto: "Remoto", Hibrido: "Hibrido", Presencial: "Presencial", Remote: "Remoto", Hybrid: "Hibrido", "On-site": "Presencial" },
  "pt-pt": { all: "Todos", Remoto: "Remoto", Hibrido: "Hibrido", Presencial: "Presencial", Remote: "Remoto", Hybrid: "Hibrido", "On-site": "Presencial" },
  es: { all: "Todos", Remoto: "Remoto", Hibrido: "Hibrido", Presencial: "Presencial", Remote: "Remoto", Hybrid: "Hibrido", "On-site": "Presencial" },
  fr: { all: "Tous", Remoto: "Teletravail", Hibrido: "Hybride", Presencial: "Presentiel", Remote: "Teletravail", Hybrid: "Hybride", "On-site": "Presentiel" },
  de: { all: "Alle", Remoto: "Remote", Hibrido: "Hybrid", Presencial: "Vor Ort", Remote: "Remote", Hybrid: "Hybrid", "On-site": "Vor Ort" },
  it: { all: "Tutti", Remoto: "Remoto", Hibrido: "Ibrido", Presencial: "In Presenza", Remote: "Remoto", Hybrid: "Ibrido", "On-site": "In Presenza" },
  nl: { all: "Alle", Remoto: "Op Afstand", Hibrido: "Hybride", Presencial: "Op Locatie", Remote: "Op Afstand", Hybrid: "Hybride", "On-site": "Op Locatie" },
  pl: { all: "Wszystkie", Remoto: "Zdalnie", Hibrido: "Hybrydowo", Presencial: "Stacjonarnie", Remote: "Zdalnie", Hybrid: "Hybrydowo", "On-site": "Stacjonarnie" },
  ru: { all: "Vse", Remoto: "Udalyonno", Hibrido: "Gibrid", Presencial: "V Ofise", Remote: "Udalyonno", Hybrid: "Gibrid", "On-site": "V Ofise" },
  zh: { all: "全部", Remoto: "远程", Hibrido: "混合", Presencial: "现场", Remote: "远程", Hybrid: "混合", "On-site": "现场" },
  ja: { all: "すべて", Remoto: "リモート", Hibrido: "ハイブリッド", Presencial: "オフィス", Remote: "リモート", Hybrid: "ハイブリッド", "On-site": "オフィス" },
  ko: { all: "모두", Remoto: "원격", Hibrido: "하이브리드", Presencial: "현장", Remote: "원격", Hybrid: "하이브리드", "On-site": "현장" },
  hi: { all: "सभी", Remoto: "रिमोट", Hibrido: "हाइब्रिड", Presencial: "ऑनसाइट", Remote: "रिमोट", Hybrid: "हाइब्रिड", "On-site": "ऑनसाइट" },
  bn: { all: "সব", Remoto: "দূরবর্তী", Hibrido: "হাইব্রিড", Presencial: "অনসাইট", Remote: "দূরবর্তী", Hybrid: "হাইব্রিড", "On-site": "অনসাইট" },
  ar: { all: "الكل", Remoto: "عن بُعد", Hibrido: "هجين", Presencial: "في الموقع", Remote: "عن بُعد", Hybrid: "هجين", "On-site": "في الموقع" },
  tr: { all: "Tumu", Remoto: "Uzaktan", Hibrido: "Hibrit", Presencial: "Yuz Yuze", Remote: "Uzaktan", Hybrid: "Hibrit", "On-site": "Yuz Yuze" },
  vi: { all: "Tat ca", Remoto: "Tu xa", Hibrido: "Linh hoat", Presencial: "Tai cho", Remote: "Tu xa", Hybrid: "Linh hoat", "On-site": "Tai cho" },
  th: { all: "ทั้งหมด", Remoto: "ระยะไกล", Hibrido: "ไฮบริด", Presencial: "ที่สำนักงาน", Remote: "ระยะไกล", Hybrid: "ไฮบริด", "On-site": "ที่สำนักงาน" },
  ur: { all: "تمام", Remoto: "ریموٹ", Hibrido: "ہائبرڈ", Presencial: "ان سائٹ", Remote: "ریموٹ", Hybrid: "ہائبرڈ", "On-site": "ان سائٹ" },
  tl: { all: "Lahat", Remoto: "Remote", Hibrido: "Hybrid", Presencial: "On-site", Remote: "Remote", Hybrid: "Hybrid", "On-site": "On-site" },
  sw: { all: "Yote", Remoto: "Umbali", Hibrido: "Mseto", Presencial: "Mahali", Remote: "Umbali", Hybrid: "Mseto", "On-site": "Mahali" },
};

export function getTypeLabel(lang: string, type: string): string {
  return TYPE_LABELS[lang]?.[type] || TYPE_LABELS["en"]?.[type] || type;
}

export const PAYWALL_TEXT: Record<string, { unlock: string; premium: string }> = {
  en: { unlock: 'Unlock Contact', premium: 'Premium' },
  "pt-br": { unlock: 'Desbloquear Contato', premium: 'Premium' },
  "pt-pt": { unlock: 'Desbloquear Contacto', premium: 'Premium' },
  es: { unlock: 'Desbloquear Contacto', premium: 'Premium' },
  fr: { unlock: 'Debloquer Contact', premium: 'Premium' },
  de: { unlock: 'Kontakt Freischalten', premium: 'Premium' },
  it: { unlock: 'Sblocca Contatto', premium: 'Premium' },
  nl: { unlock: 'Contact Ontgrendelen', premium: 'Premium' },
  pl: { unlock: 'Odblokuj Kontakt', premium: 'Premium' },
  ru: { unlock: 'Razblokirovat Kontakt', premium: 'Premium' },
  zh: { unlock: '解锁联系方式', premium: '高级' },
  ja: { unlock: '連絡先解除', premium: 'プレミアム' },
  ko: { unlock: '연락처 잠금 해제', premium: '프리미엄' },
  hi: { unlock: 'संपर्क अनलॉक करें', premium: 'प्रीमियम' },
  bn: { unlock: 'যোগাযোগ আনলক', premium: 'প্রিমিয়াম' },
  ar: { unlock: 'فتح جهات الاتصال', premium: 'مميز' },
  tr: { unlock: 'Iletisimi Ac', premium: 'Premium' },
  vi: { unlock: 'Mo khoa lien he', premium: 'Premium' },
  th: { unlock: 'ปลดล็อกข้อมูลติดต่อ', premium: 'พรีเมียม' },
  ur: { unlock: 'رابطہ کھولیں', premium: 'پریمیم' },
  tl: { unlock: 'I-unlock ang Contact', premium: 'Premium' },
  sw: { unlock: 'Fungua Mawasiliano', premium: 'Premium' },
};

export function getPaywallText(lang: string) {
  return PAYWALL_TEXT[lang] || PAYWALL_TEXT['en'];
}

// ─── Dynamic Paywall Logic ─────────────────────────────────────────

export interface PaywallResult {
  paywall: boolean;
  reason: '' | 'remote_1pct';
}

/**
 * Deterministic paywall: only 1% of remote jobs (id % 100 === 0)
 * All other jobs are FREE (no paywall).
 */
export function shouldHavePaywall(job: {
  id?: number;
  type?: string;
}): PaywallResult {
  const id = job.id || 0;
  const workType = (job.type || '').toLowerCase();
  const isRemote = workType === 'remote' || workType === 'remoto';

  // 1% of remote jobs (deterministic)
  if (isRemote && id % 100 === 0) {
    return { paywall: true, reason: 'remote_1pct' };
  }

  return { paywall: false, reason: '' };
}

// ─── Company URL Cleaning ──────────────────────────────────────────

/**
 * Known competitor/agency job board domains.
 * Links pointing to these should be replaced with direct company URLs.
 */
const COMPETITOR_DOMAINS = [
  'remotive.com', 'jobgether.com', 'arbeitnow.co.uk', 'arbeitnow.com',
  'wellfound.com', 'justremote.co', 'weworkremotely.com', 'remoteok.com',
  'flexjobs.com', 'ziprecruiter.com', 'indeed.com',
  'monster.com', 'naukri.com', 'stepstone.de', 'stepstone.be',
  'careerjet.com', 'jooble.org', 'adzuna.com', 'talent.com', 'jobisjob.com',
  'linkedin.com/jobs', 'glassdoor.com', 'glassdoor.',
  'wowjobs.ca', 'jobrapido.com', 'lensa.com', 'simplyhired.com',
  'usajobs.gov', 'gov.uk/find-a-job', 'seek.com.au',
];

/**
 * Known companies mapped to their career/homepage URLs.
 * Extend this map as needed for major companies.
 */
const KNOWN_COMPANY_URLS: Record<string, string> = {
  'sea group': 'https://www.sea-group.com',
  'garena': 'https://www.garena.com',
  'shopee': 'https://careers.shopee.com',
  'spotify': 'https://www.lifeatspotify.com',
  'samsung electronics': 'https://www.samsung.com/careers',
  'samsung': 'https://www.samsung.com/careers',
  'sony': 'https://www.sony.com/careers',
  'tencent': 'https://careers.tencent.com',
  'hsbc': 'https://www.hsbc.com/careers',
  'hsbc hong kong': 'https://www.hsbc.com/careers',
  'adyen': 'https://careers.adyen.com',
  'glovo': 'https://about.glovoapp.com/careers',
  'cd projekt': 'https://en.cdprojektred.com/careers',
  'epfl': 'https://www.epfl.ch/about/working-at-epfl',
  'clipster': 'https://www.clipster.com',
  'vnpay': 'https://tuyendung.vnpay.vn',
  'outsite': 'https://www.outsite.io',
  'remote.com': 'https://remote.com/careers',
  'intercom': 'https://www.intercom.com/careers',
  'google': 'https://careers.google.com',
  'microsoft': 'https://careers.microsoft.com',
  'amazon': 'https://www.amazon.jobs',
  'apple': 'https://www.apple.com/careers',
  'meta': 'https://www.metacareers.com',
  'netflix': 'https://jobs.netflix.com',
  'stripe': 'https://stripe.com/jobs',
  'shopify': 'https://www.shopify.com/careers',
  'airbnb': 'https://careers.airbnb.com',
  'uber': 'https://www.uber.com/careers',
  'bytedance': 'https://jobs.bytedance.com',
  'alibaba': 'https://talent.alibaba.com',
  'booking.com': 'https://careers.booking.com',
  'nvidia': 'https://www.nvidia.com/en-us/about-nvidia/careers',
  'intel': 'https://www.intel.com/content/www/us/en/jobs',
  'oracle': 'https://www.oracle.com/careers',
  'sap': 'https://www.sap.com/about/careers',
  'salesforce': 'https://www.salesforce.com/company/careers',
  'adobe': 'https://www.adobe.com/careers.html',
  'paypal': 'https://www.paypal.com/us/webapps/mpp/jobs',
  'visa': 'https://www.visa.com/careers',
  'mastercard': 'https://www.mastercard.com/careers',
  'tcs': 'https://www.tcs.com/careers',
  'tata consultancy': 'https://www.tcs.com/careers',
  'infosys': 'https://www.infosys.com/careers',
  'wipro': 'https://careers.wipro.com',
  'accenture': 'https://www.accenture.com/us-en/careers',
  'deloitte': 'https://www2.deloitte.com/careers',
  'pwc': 'https://www.pwc.com/careers',
  'ey': 'https://www.ey.com/en_us/careers',
  'kpmg': 'https://kpmg.com/careers',
  'databricks': 'https://www.databricks.com/company/careers',
  'snowflake': 'https://careers.snowflake.com',
  'palantir': 'https://www.palantir.com/careers',
  'coinbase': 'https://www.coinbase.com/careers',
  'coinbase global': 'https://www.coinbase.com/careers',
  'binance': 'https://binance.com/careers',
  'revolut': 'https://www.revolut.com/careers',
  'monzo': 'https://monzo.com/careers',
  'wise': 'https://wise.com/jobs',
  'klarna': 'https://www.klarna.com/careers',
  'deezer': 'https://www.deezer.com/jobs',
  'bolt': 'https://bolt.eu/careers',
  'wolt': 'https://wolt.com/careers',
  'delivery hero': 'https://www.deliveryhero.com/careers',
  'zomato': 'https://www.zomato.com/careers',
  'swiggy': 'https://careers.swiggy.com',
  'grab': 'https://grab.careers',
  'gojek': 'https://www.gojek.com/careers',
  'sea ltd': 'https://www.sea-group.com',
  'criteo': 'https://www.criteo.com/careers',
  'cognizant': 'https://careers.cognizant.com',
  'capgemini': 'https://www.capgemini.com/careers',
  'hcl': 'https://www.hcltech.com/careers',
  'tech mahindra': 'https://careers.techmahindra.com',
  'micron': 'https://www.micron.com/careers',
  'qualcomm': 'https://www.qualcomm.com/company/careers',
  'broadcom': 'https://www.broadcom.com/careers',
  'amd': 'https://www.amd.com/en/corporate/careers',
  'arm': 'https://www.arm.com/careers',
  'ti': 'https://careers.ti.com',
  'texas instruments': 'https://careers.ti.com',
  'philips': 'https://www.philips.com/careers',
  'siemens': 'https://new.siemens.com/careers',
  'bosch': 'https://www.bosch.com/careers',
  'siemens healthineers': 'https://www.siemens-healthineers.com/careers',
  'asml': 'https://www.asml.com/careers',
  'sas': 'https://www.sas.com/en_us/careers',
  'unity': 'https://careers.unity.com',
  'unreal engine': 'https://www.epicgames.com/site/en-US/careers',
  'epic games': 'https://www.epicgames.com/site/en-US/careers',
  'electronic arts': 'https://www.ea.com/careers',
  'ea sports': 'https://www.ea.com/careers',
  'ubisoft': 'https://www.ubisoft.com/en-us/careers',
  ' Activision': 'https://www.activision.com/careers',
  'blizzard': 'https://careers.blizzard.com',
  'riot games': 'https://www.riotgames.com/en/work-with-us',
  'valve': 'https://www.valvesoftware.com/en/careers',
  'nintendo': 'https://www.nintendo.com/corporate/jobs',
  'sony interactive': 'https://www.playstation.com/careers',
  'playstation': 'https://www.playstation.com/careers',
  'xiaomi': 'https://hr.xiaomi.com',
  'huawei': 'https://www.huawei.com/en/careers',
  'oppo': 'https://www.oppo.com/en/careers',
  'oneplus': 'https://www.oneplus.com/careers',
  'realme': 'https://www.realme.com/careers',
  'lenovo': 'https://www.lenovo.com/careers',
  'dell': 'https://jobs.dell.com',
  'hp': 'https://careers.hp.com',
  'hewlett packard': 'https://careers.hp.com',
  'cisco': 'https://www.cisco.com/c/en/us/about/careers.html',
  'juniper': 'https://www.juniper.net/careers',
  'palo alto': 'https://jobs.paloaltonetworks.com',
  'fortinet': 'https://www.fortinet.com/corporate/about-us/careers',
  'check point': 'https://www.checkpoint.com/careers',
  'crowdstrike': 'https://www.crowdstrike.com/careers',
  'sentinelone': 'https://www.sentinelone.com/careers',
  'splunk': 'https://www.splunk.com/en_us/about/careers',
  'datadog': 'https://www.datadoghq.com/careers',
  'grafana labs': 'https://grafana.com/about/careers',
  'hashicorp': 'https://www.hashicorp.com/careers',
  'confluent': 'https://www.confluent.io/careers',
  'mongodb': 'https://www.mongodb.com/careers',
  'redis labs': 'https://redis.com/careers',
  'elastic': 'https://www.elastic.co/careers',
  'cloudflare': 'https://www.cloudflare.com/careers',
  'fastly': 'https://www.fastly.com/careers',
  'akamai': 'https://www.akamai.com/careers',
  'digitalocean': 'https://www.digitalocean.com/careers',
  'linode': 'https://www.linode.com/careers',
  'rackspace': 'https://www.rackspace.com/careers',
  'heroku': 'https://www.heroku.com/careers',
  'vercel': 'https://vercel.com/careers',
  'netlify': 'https://www.netlify.com/careers',
  'github': 'https://github.com/about/careers',
  'gitlab': 'https://about.gitlab.com/jobs',
  'atlassian': 'https://www.atlassian.com/company/careers',
  'jira': 'https://www.atlassian.com/company/careers',
  'slack': 'https://slack.com/careers',
  'figma': 'https://www.figma.com/careers',
  'canva': 'https://www.canva.com/careers',
  'notion': 'https://www.notion.so/careers',
  'airtable': 'https://airtable.com/careers',
  'zapier': 'https://zapier.com/jobs',
  'twilio': 'https://www.twilio.com/en-us/company/jobs',
  'sendgrid': 'https://www.twilio.com/en-us/company/jobs',
  'mailchimp': 'https://mailchimp.com/jobs',
  'hubspot': 'https://www.hubspot.com/careers',
  'zendesk': 'https://www.zendesk.com/jobs',
  'freshworks': 'https://www.freshworks.com/company/careers',
  'postman': 'https://www.postman.com/careers',
};

/**
 * Domains that host actual company career pages (not competitors).
 * Links to these domains are kept as-is.
 */
const CAREER_HOST_DOMAINS = [
  'boards.greenhouse.io', 'jobs.lever.co', 'jobvite.com',
  'myworkdayjobs.com', 'workday.com', 'taleo.net',
  'smartrecruiters.com', 'ashbyhq.com', 'breezy.hr',
  'personio.de', 'recruitee.com', 'torre.co',
  'applytojob.com', 'hire.withgoogle.com', 'careers.google',
  'lifeatspotify.com', 'amazon.jobs', 'metacareers.com',
  'apple.com/careers', 'jobs.netflix.com', 'jobs.bytedance.com',
  'talent.alibaba.com', 'careers.booking.com', 'jobs.nvidia.com',
  'jobs.dell.com', 'careers.hp.com', 'github.com/about',
  'about.gitlab.com', 'grab.careers', 'careers.swiggy.com',
  'hr.xiaomi.com', 'jobs.paloaltonetworks.com',
  'careers.adyen.com', 'careers.uber.com', 'careers.airbnb.com',
];

/**
 * Extracts a clean company website URL from a job object.
 * Removes competitor job board links and returns direct company URLs.
 */
export function getCompanyCareerUrl(job: { company?: string; companyUrl?: string }): string {
  const rawUrl = job.companyUrl || '';
  const company = job.company || '';

  if (!rawUrl) {
    return inferCompanyUrl(company);
  }

  // Check if URL points to a career page host (keep as-is)
  const urlLower = rawUrl.toLowerCase();
  for (const host of CAREER_HOST_DOMAINS) {
    if (urlLower.includes(host)) return rawUrl;
  }

  // Check if URL points to a competitor job board (replace)
  for (const domain of COMPETITOR_DOMAINS) {
    if (urlLower.includes(domain)) {
      return inferCompanyUrl(company);
    }
  }

  // If URL looks like a direct company URL, keep it
  if (urlLower.startsWith('https://') || urlLower.startsWith('http://')) {
    return rawUrl;
  }

  return inferCompanyUrl(company);
}

/**
 * Infer a company career/homepage URL from the company name.
 */
function inferCompanyUrl(company: string): string {
  if (!company) return '';

  const nameLower = company.toLowerCase().trim();

  // Check known company map
  for (const [key, url] of Object.entries(KNOWN_COMPANY_URLS)) {
    if (nameLower === key || nameLower.startsWith(key + ' ') || nameLower.includes('(' + key)) {
      return url;
    }
  }

  // Extract core name: remove parenthetical suffixes like (Garena/Shopee)
  let coreName = company.split('(')[0].trim();
  // Remove common suffixes
  coreName = coreName
    .replace(/(inc|ltd|llc|corp|corporation|gmbh|ag|sa|srl|bv|pty|limited|holdings|group|technologies|solutions|services|global|international)/gi, '')
    .replace(/[.,]/g, '')
    .trim();

  if (!coreName) return '';

  // Take the first meaningful word as domain
  const words = coreName.split(/\s+/).filter(w => w.length > 1);
  const domainBase = words[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
  if (!domainBase) return '';

  return 'https://www.' + domainBase + '.com';
}

const PERIOD_LABELS: Record<string, Record<string, string>> = {
  en: { year: '/year', month: '/month', hourly: '/hour' },
  'pt-br': { year: '/ano', month: '/mês', hourly: '/hora' },
  'pt-pt': { year: '/ano', month: '/mês', hourly: '/hora' },
  es: { year: '/año', month: '/mes', hourly: '/hora' },
  fr: { year: '/an', month: '/mois', hourly: '/heure' },
  de: { year: '/Jahr', month: '/Monat', hourly: '/Stunde' },
  it: { year: '/anno', month: '/mese', hourly: '/ora' },
  nl: { year: '/jaar', month: '/maand', hourly: '/uur' },
  pl: { year: '/rok', month: '/miesiac', hourly: '/godzine' },
  ru: { year: '/god', month: '/mesyac', hourly: '/chas' },
  zh: { year: '/年', month: '/月', hourly: '/小时' },
  ja: { year: '/年', month: '/月', hourly: '/時間' },
  ko: { year: '/년', month: '/월', hourly: '/시간' },
  hi: { year: '/वर्ष', month: '/महीना', hourly: '/घंटा' },
  bn: { year: '/বছর', month: '/মাস', hourly: '/ঘন্টা' },
  ar: { year: '/سنة', month: '/شهر', hourly: '/ساعة' },
  tr: { year: '/yil', month: '/ay', hourly: '/saat' },
  vi: { year: '/nam', month: '/thang', hourly: '/gio' },
  th: { year: '/ปี', month: '/เดือน', hourly: '/ชั่วโมง' },
  ur: { year: '/سال', month: '/ماہ', hourly: '/گنتہ' },
  tl: { year: '/taon', month: '/buwan', hourly: '/oras' },
  sw: { year: '/mwaka', month: '/mwezi', hourly: '/saa' },
};

export function formatSalary(j: { salaryMin?: number | null; salaryMax?: number | null; salaryCurrency?: string; salaryPeriod?: string; salary?: string }, lang?: string): string {
  const S: Record<string, string> = { EUR: 'EUR', USD: 'USD', GBP: 'GBP', BRL: 'BRL', INR: 'INR', JPY: 'JPY', CNY: 'CNY', SGD: 'SGD', KRW: 'KRW' };
  const mn = j.salaryMin || 0, mx = j.salaryMax || 0;
  if (!mn && !mx) return j.salary || '';
  const cur = j.salaryCurrency || '';
  const sym = S[cur] || cur || '';
  const a = Math.round(mn).toLocaleString(), b = Math.round(mx).toLocaleString();
  const period = j.salaryPeriod || 'year';
  const label = PERIOD_LABELS[lang || 'en']?.[period] || PERIOD_LABELS['en']?.[period] || '';
  return sym + ' ' + a + (mx ? ' - ' + b : '') + ' ' + label;
}
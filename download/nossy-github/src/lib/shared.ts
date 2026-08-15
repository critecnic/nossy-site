// Shared constants used across all pages - eliminates duplication

import type { Lang } from './i18n';

export const REGION_NAMES: Record<string, Record<string, string>> = {
  en: { europa: "Europe", asia: "Asia", eua: "United States" },
  "pt-br": { europa: "Europa", asia: "Ásia", eua: "Estados Unidos" },
  "pt-pt": { europa: "Europa", asia: "Ásia", eua: "Estados Unidos" },
  es: { europa: "Europa", asia: "Asia", eua: "Estados Unidos" },
  fr: { europa: "Europe", asia: "Asie", eua: "États-Unis" },
  de: { europa: "Europa", asia: "Asien", eua: "USA" },
  it: { europa: "Europa", asia: "Asia", eua: "Stati Uniti" },
  nl: { europa: "Europa", asia: "Azië", eua: "VS" },
  pl: { europa: "Europa", asia: "Azja", eua: "USA" },
  ru: { europa: "Европа", asia: "Азия", eua: "США" },
  zh: { europa: "欧洲", asia: "亚洲", eua: "美国" },
  ja: { europa: "ヨーロッパ", asia: "アジア", eua: "アメリカ" },
  ko: { europa: "유럽", asia: "아시아", eua: "미국" },
  hi: { europa: "यूरोप", asia: "एशिया", eua: "अमेरिका" },
  bn: { europa: "ইউরোপ", asia: "এশিয়া", eua: "যুক্তরাষ্ট্র" },
  ar: { europa: "أوروبا", asia: "آسيا", eua: "الولايات المتحدة" },
  tr: { europa: "Avrupa", asia: "Asya", eua: "ABD" },
  vi: { europa: "Châu Âu", asia: "Châu Á", eua: "Mỹ" },
  th: { europa: "ยุโรป", asia: "เอเชีย", eua: "อเมริกา" },
  ur: { europa: "یورپ", asia: "ایشیا", eua: "امریکہ" },
  tl: { europa: "Europa", asia: "Asia", eua: "USA" },
  sw: { europa: "Ulaya", asia: "Asia", eua: "Marekani" },
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
  "pt-br": { all: "Todos", Remoto: "Remoto", Hibrido: "Híbrido", Presencial: "Presencial" },
  "pt-pt": { all: "Todos", Remoto: "Remoto", Hibrido: "Híbrido", Presencial: "Presencial" },
  es: { all: "Todos", Remoto: "Remoto", Hibrido: "Híbrido", Presencial: "Presencial" },
  fr: { all: "Tous", Remoto: "Télétravail", Hibrido: "Hybride", Presencial: "Présentiel" },
  de: { all: "Alle", Remoto: "Remote", Hibrido: "Hybrid", Presencial: "Vor Ort" },
  it: { all: "Tutti", Remoto: "Remoto", Hibrido: "Ibrido", Presencial: "In Presenza" },
  nl: { all: "Alle", Remoto: "Op Afstand", Hibrido: "Hybride", Presencial: "Op Locatie" },
  pl: { all: "Wszystkie", Remoto: "Zdalnie", Hibrido: "Hybrydowo", Presencial: "Stacjonarnie" },
  ru: { all: "Все", Remoto: "Удалённо", Hibrido: "Гибрид", Presencial: "В Офисе" },
  zh: { all: "全部", Remoto: "远程", Hibrido: "混合", Presencial: "现场" },
  ja: { all: "すべて", Remoto: "リモート", Hibrido: "ハイブリッド", Presencial: "オフィス" },
  ko: { all: "모두", Remoto: "원격", Hibrido: "하이브リ드", Presencial: "현장" },
  hi: { all: "सभी", Remoto: "रिमोट", Hibrido: "हाइब्रिड", Presencial: "ऑनसाइट" },
  bn: { all: "সব", Remoto: "দূরবর্তী", Hibrido: "হাইব্রিড", Presencial: "অনসাইট" },
  ar: { all: "الكل", Remoto: "عن بُعد", Hibrido: "هجين", Presencial: "في الموقع" },
  tr: { all: "Tümü", Remoto: "Uzaktan", Hibrido: "Hibrit", Presencial: "Yüz Yüze" },
  vi: { all: "Tất cả", Remoto: "Từ xa", Hibrido: "Linh hoạt", Presencial: "Tại chỗ" },
  th: { all: "ทั้งหมด", Remoto: "ระยะไกล", Hibrido: "ไฮบริด", Presencial: "ที่สำนักงาน" },
  ur: { all: "تمام", Remoto: "ریموٹ", Hibrido: "ہائبرڈ", Presencial: "ان سائٹ" },
  tl: { all: "Lahat", Remoto: "Remote", Hibrido: "Hybrid", Presencial: "On-site" },
  sw: { all: "Yote", Remoto: "Umbali", Hibrido: "Mseto", Presencial: "Mahali" },
};

export function getTypeLabel(lang: string, type: string): string {
  return TYPE_LABELS[lang]?.[type] || type;
}

export const PAYWALL_TEXT: Record<string, { unlock: string; premium: string }> = {
  en: { unlock: 'Unlock Contact', premium: 'Premium' },
  "pt-br": { unlock: 'Desbloquear Contato', premium: 'Premium' },
  es: { unlock: 'Desbloquear', premium: 'Premium' },
  fr: { unlock: 'Débloquer', premium: 'Premium' },
  de: { unlock: 'Freischalten', premium: 'Premium' },
  it: { unlock: 'Sblocca', premium: 'Premium' },
  nl: { unlock: 'Ontgrendelen', premium: 'Premium' },
  pl: { unlock: 'Odblokuj', premium: 'Premium' },
  ru: { unlock: 'Разблокировать', premium: 'Premium' },
  zh: { unlock: '解锁联系方式', premium: '高级' },
  ja: { unlock: '連絡先を解锁', premium: 'プレミアム' },
  ko: { unlock: '연락처 잠금 해제', premium: '프리미엄' },
  hi: { unlock: 'संपर्क अनलॉक करें', premium: 'प्रीमियम' },
  ar: { unlock: 'فتح جهات الاتصال', premium: 'مميز' },
  tr: { unlock: 'İletişimi Aç', premium: 'Premium' },
  vi: { unlock: 'Mở khóa liên hệ', premium: 'Premium' },
  th: { unlock: 'ปลดล็อกข้อมูลติดต่อ', premium: 'พรีเมียม' },
};

export function getPaywallText(lang: string) {
  return PAYWALL_TEXT[lang] || PAYWALL_TEXT['en'];
}

// Maps Portuguese country names from data files to English
export const COUNTRY_NAME_EN: Record<string, string> = {
  "Japao": "Japan", "Coreia do Sul": "South Korea", "Singapura": "Singapore",
  "Tailandia": "Thailand", "Malasia": "Malaysia", "Vietna": "Vietnam",
  "Filipinas": "Philippines", "Paquistao": "Pakistan", "Remoto Global": "Remote Global",
  "China": "China", "India": "India", "Indonesia": "Indonesia",
  "Hong Kong": "Hong Kong", "Taiwan": "Taiwan", "Sri Lanka": "Sri Lanka",
  "Bangladesh": "Bangladesh", "Nepal": "Nepal",
};

export const COUNTRY_NAME_PT: Record<string, string> = {
  "Japan": "Japão", "South Korea": "Coreia do Sul", "Singapore": "Singapura",
  "Thailand": "Tailândia", "Malaysia": "Malásia", "Vietnam": "Vietnã",
  "Philippines": "Filipinas", "Pakistan": "Paquistão", "Remote Global": "Remoto Global",
  "United States": "Estados Unidos", "China": "China", "India": "Índia",
  "Indonesia": "Indonésia", "Hong Kong": "Hong Kong", "Taiwan": "Taiwan",
  "Sri Lanka": "Sri Lanka", "Bangladesh": "Bangladesh", "Nepal": "Nepal",
  "United Kingdom": "Reino Unido", "Germany": "Alemanha", "France": "França",
  "Spain": "Espanha", "Italy": "Itália", "Netherlands": "Países Baixos",
  "Poland": "Polônia", "Ireland": "Irlanda", "Finland": "Finlândia",
  "Portugal": "Portugal", "Switzerland": "Suíça", "Denmark": "Dinamarca",
  "Norway": "Noruega", "Sweden": "Suécia", "Belgium": "Bélgica",
  "Austria": "Áustria", "Czech Republic": "República Tcheca", "Romania": "Romênia",
  "Hungary": "Hungria", "Greece": "Grécia", "Bulgaria": "Bulgária",
  "Croatia": "Croácia", "Slovakia": "Eslováquia", "Slovenia": "Eslovênia",
  "Estonia": "Estônia", "Latvia": "Letônia", "Lithuania": "Lituânia",
  "Luxembourg": "Luxemburgo", "Malta": "Malta", "Cyprus": "Chipre",
  "Iceland": "Islândia", "Serbia": "Sérvia", "Ukraine": "Ucrânia",
  "Bosnia and Herzegovina": "Bósnia e Herzegovina", "Montenegro": "Montenegro",
  "Moldova": "Moldávia", "Albania": "Albânia", "North Macedonia": "Macedônia do Norte",
  "Georgia": "Geórgia", "Remote": "Remoto",
};

export function getLocalizedCountryName(name: string, lang: string): string {
  if (lang === 'pt-br' || lang === 'pt-pt') {
    return COUNTRY_NAME_PT[name] || name;
  }
  return COUNTRY_NAME_EN[name] || name;
}

export function formatSalary(j: { salaryMin?: number; salaryMax?: number; salaryCurrency?: string; salaryPeriod?: string; salary?: string }): string {
  const S: Record<string, string> = { EUR: '€', USD: '$', GBP: '£', BRL: 'R$', INR: '₹', JPY: '¥', CNY: '¥', SGD: 'S$', KRW: '₩' };
  const mn = j.salaryMin || 0, mx = j.salaryMax || 0;
  if (!mn && !mx) return j.salary || '';
  const sym = S[j.salaryCurrency || ''] || j.salaryCurrency || '';
  const a = Math.round(mn).toLocaleString(), b = Math.round(mx).toLocaleString();
  if (j.salaryPeriod === 'year') return sym + ' ' + a + ' - ' + b + '/yr';
  if (j.salaryPeriod === 'month') return sym + ' ' + a + ' - ' + b + '/mo';
  return sym + ' ' + a + ' - ' + b;
}

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

export const PAYWALL_TEXT: Record<string, { unlock: string; premium: string; contactAvailable: string }> = {
  en: { unlock: 'Unlock Contact', premium: 'Premium', contactAvailable: 'Contact Available' },
  "pt-br": { unlock: 'Desbloquear Contato', premium: 'Premium', contactAvailable: 'Contato Disponível' },
  "pt-pt": { unlock: 'Desbloquear Contacto', premium: 'Premium', contactAvailable: 'Contacto Disponível' },
  es: { unlock: 'Desbloquear', premium: 'Premium', contactAvailable: 'Contacto Disponible' },
  fr: { unlock: 'Débloquer', premium: 'Premium', contactAvailable: 'Contact Disponible' },
  de: { unlock: 'Freischalten', premium: 'Premium', contactAvailable: 'Kontakt Verfügbar' },
  it: { unlock: 'Sblocca', premium: 'Premium', contactAvailable: 'Contatto Disponibile' },
  nl: { unlock: 'Ontgrendelen', premium: 'Premium', contactAvailable: 'Contact Beschikbaar' },
  pl: { unlock: 'Odblokuj', premium: 'Premium', contactAvailable: 'Kontakt Dostępny' },
  ru: { unlock: 'Разблокировать', premium: 'Premium', contactAvailable: 'Контакт Доступен' },
  zh: { unlock: '解锁联系方式', premium: '高级', contactAvailable: '联系可用' },
  ja: { unlock: '連絡先をアンロック', premium: 'プレミアム', contactAvailable: '連絡先あり' },
  ko: { unlock: '연락처 잠금 해제', premium: '프리미엄', contactAvailable: '연락처 있음' },
  hi: { unlock: 'संपर्क अनलॉक करें', premium: 'प्रीमियम', contactAvailable: 'संपर्क उपलब्ध' },
  bn: { unlock: 'যোগাযোগ আনলক করুন', premium: 'প্রিমিয়াম', contactAvailable: 'যোগাযোগ পাওয়া যায়' },
  ar: { unlock: 'فتح جهات الاتصال', premium: 'مميز', contactAvailable: 'الاتصال متاح' },
  tr: { unlock: 'İletişimi Aç', premium: 'Premium', contactAvailable: 'İletişim Mevcut' },
  vi: { unlock: 'Mở khóa liên hệ', premium: 'Premium', contactAvailable: 'Có Liên Hệ' },
  th: { unlock: 'ปลดล็อกข้อมูลติดต่อ', premium: 'พรีเมียม', contactAvailable: 'ติดต่อได้' },
  ur: { unlock: 'رابطہ کھولیں', premium: 'پریمیم', contactAvailable: 'رابطہ موجود' },
  tl: { unlock: 'I-unlock ang Contact', premium: 'Premium', contactAvailable: 'Contact Available' },
  sw: { unlock: 'Fungua Mawasiliano', premium: 'Premium', contactAvailable: 'Mawasiliano Yapo' },
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

// ============================================================
// Sector translations for all languages
// ============================================================
export const SECTOR_LABELS: Record<string, Record<string, string>> = {
  en: {
    "Software Engineering": "Software Engineering", "Cloud & DevOps": "Cloud & DevOps",
    "Data Science & Analytics": "Data Science & Analytics", "AI & Machine Learning": "AI & Machine Learning",
    "Product Management": "Product Management", "Cybersecurity": "Cybersecurity",
    "Engineering Leadership": "Engineering Leadership", "Consulting": "Consulting",
    "Data Engineering": "Data Engineering", "UX/UI & Design": "UX/UI & Design",
    "QA & Testing": "QA & Testing", "Mobile Development": "Mobile Development",
    "Game Development": "Game Development", "Specialized Development": "Specialized Development",
    "Embedded & IoT": "Embedded & IoT", "Writing & Content": "Writing & Content",
    "Sales & Marketing": "Sales & Marketing", "Finance Technology": "Finance Technology",
    "IT Support & Operations": "IT Support & Operations", "Research & Development": "R&D",
    Other: "Other",
  },
  "pt-br": {
    "Software Engineering": "Engenharia de Software", "Cloud & DevOps": "Cloud e DevOps",
    "Data Science & Analytics": "Ciencia de Dados e Analytics", "AI & Machine Learning": "IA e Machine Learning",
    "Product Management": "Gerenciamento de Produto", "Cybersecurity": "Ciberseguranca",
    "Engineering Leadership": "Lideranca de Engenharia", "Consulting": "Consultoria",
    "Data Engineering": "Engenharia de Dados", "UX/UI & Design": "UX/UI e Design",
    "QA & Testing": "QA e Testes", "Mobile Development": "Desenvolvimento Mobile",
    "Game Development": "Desenvolvimento de Games", "Specialized Development": "Desenvolvimento Especializado",
    "Embedded & IoT": "Embedded e IoT", "Writing & Content": "Redacao e Conteudo",
    "Sales & Marketing": "Vendas e Marketing", "Finance Technology": "Tecnologia Financeira",
    "IT Support & Operations": "Suporte e Operacoes de TI", "Research & Development": "Pesquisa e Desenvolvimento",
    Other: "Outro",
  },
  es: {
    "Software Engineering": "Ingenieria de Software", "Cloud & DevOps": "Cloud y DevOps",
    "Data Science & Analytics": "Ciencia de Datos y Analytics", "AI & Machine Learning": "IA y Machine Learning",
    "Product Management": "Gestion de Producto", "Cybersecurity": "Ciberseguridad",
    "Engineering Leadership": "Liderazgo de Ingenieria", "Consulting": "Consultoria",
    "Data Engineering": "Ingenieria de Datos", "UX/UI & Design": "UX/UI y Diseno",
    "QA & Testing": "QA y Testing", "Mobile Development": "Desarrollo Mobile",
    "Game Development": "Desarrollo de Videojuegos", "Specialized Development": "Desarrollo Especializado",
    "Embedded & IoT": "Embedded e IoT", "Writing & Content": "Redaccion y Contenido",
    "Sales & Marketing": "Ventas y Marketing", "Finance Technology": "Tecnologia Financiera",
    "IT Support & Operations": "Soporte y Operaciones de TI", "Research & Development": "Investigacion y Desarrollo",
    Other: "Otro",
  },
  fr: {
    "Software Engineering": "Ingenierie Logicielle", "Cloud & DevOps": "Cloud et DevOps",
    "Data Science & Analytics": "Science des Donnees et Analytics", "AI & Machine Learning": "IA et Machine Learning",
    "Product Management": "Gestion de Produit", "Cybersecurity": "Cybersecurite",
    "Engineering Leadership": "Direction Technique", "Consulting": "Conseil",
    "Data Engineering": "Ingenierie des Donnees", "UX/UI & Design": "UX/UI et Design",
    "QA & Testing": "QA et Tests", "Mobile Development": "Developpement Mobile",
    "Game Development": "Developpement de Jeux", "Specialized Development": "Developpement Specialise",
    "Embedded & IoT": "Embarque et IoT", "Writing & Content": "Redaction et Contenu",
    "Sales & Marketing": "Ventes et Marketing", "Finance Technology": "Technologie Financiere",
    "IT Support & Operations": "Support et Operations IT", "Research & Development": "Recherche et Developpement",
    Other: "Autre",
  },
  de: {
    "Software Engineering": "Softwareentwicklung", "Cloud & DevOps": "Cloud und DevOps",
    "Data Science & Analytics": "Datenwissenschaft und Analytics", "AI & Machine Learning": "KI und Machine Learning",
    "Product Management": "Produktmanagement", "Cybersecurity": "Cybersicherheit",
    "Engineering Leadership": "Technische Fuehrung", "Consulting": "Beratung",
    "Data Engineering": "Datenengineering", "UX/UI & Design": "UX/UI und Design",
    "QA & Testing": "QA und Testing", "Mobile Development": "Mobile Entwicklung",
    "Game Development": "Spieleentwicklung", "Specialized Development": "Spezialisierte Entwicklung",
    "Embedded & IoT": "Embedded und IoT", "Writing & Content": "Redaktion und Inhalt",
    "Sales & Marketing": "Vertrieb und Marketing", "Finance Technology": "Finanztechnologie",
    "IT Support & Operations": "IT-Support und Betrieb", "Research & Development": "Forschung und Entwicklung",
    Other: "Sonstige",
  },
  it: {
    "Software Engineering": "Ingegneria del Software", "Cloud & DevOps": "Cloud e DevOps",
    "Data Science & Analytics": "Scienza dei Dati e Analytics", "AI & Machine Learning": "IA e Machine Learning",
    "Product Management": "Product Management", "Cybersecurity": "Cybersicurezza",
    "Engineering Leadership": "Leadership Tecnico", "Consulting": "Consulenza",
    "Data Engineering": "Ingegneria dei Dati", "UX/UI & Design": "UX/UI e Design",
    "QA & Testing": "QA e Testing", "Mobile Development": "Sviluppo Mobile",
    "Game Development": "Sviluppo Giochi", "Specialized Development": "Sviluppo Specializzato",
    "Embedded & IoT": "Embedded e IoT", "Writing & Content": "Scrittura e Contenuti",
    "Sales & Marketing": "Vendite e Marketing", "Finance Technology": "Tecnologia Finanziaria",
    "IT Support & Operations": "Supporto IT e Operazioni", "Research & Development": "Ricerca e Sviluppo",
    Other: "Altro",
  },
  nl: {
    "Software Engineering": "Software Engineering", "Cloud & DevOps": "Cloud en DevOps",
    "Data Science & Analytics": "Data Science en Analytics", "AI & Machine Learning": "AI en Machine Learning",
    "Product Management": "Product Management", "Cybersecurity": "Cybersecurity",
    "Engineering Leadership": "Engineering Leadership", "Consulting": "Consulting",
    "Data Engineering": "Data Engineering", "UX/UI & Design": "UX/UI en Design",
    "QA & Testing": "QA en Testing", "Mobile Development": "Mobiele Ontwikkeling",
    "Game Development": "Game Ontwikkeling", "Specialized Development": "Gespecialiseerde Ontwikkeling",
    "Embedded & IoT": "Embedded en IoT", "Writing & Content": "Schrijven en Content",
    "Sales & Marketing": "Sales en Marketing", "Finance Technology": "Financiele Technologie",
    "IT Support & Operations": "IT Support en Operations", "Research & Development": "Onderzoek en Ontwikkeling",
    Other: "Overig",
  },
  pl: {
    "Software Engineering": "Inzynieria Oprogramowania", "Cloud & DevOps": "Chmura i DevOps",
    "Data Science & Analytics": "Data Science i Analytics", "AI & Machine Learning": "AI i Machine Learning",
    "Product Management": "Zarzadzanie Produktami", "Cybersecurity": "Cyberbezpieczenstwo",
    "Engineering Leadership": "Prowadzenie Inzynierii", "Consulting": "Konsulting",
    "Data Engineering": "Inzynieria Danych", "UX/UI & Design": "UX/UI i Design",
    "QA & Testing": "QA i Testy", "Mobile Development": "Tworzenie Aplikacji Mobilnych",
    "Game Development": "Tworzenie Gier", "Specialized Development": "Specjalistyczne Tworzenie",
    "Embedded & IoT": "Embedded i IoT", "Writing & Content": "Pisanie i Tresc",
    "Sales & Marketing": "Sprzedaz i Marketing", "Finance Technology": "Technologie Finansowe",
    "IT Support & Operations": "Wsparcie IT i Operacje", "Research & Development": "Badania i Rozwoj",
    Other: "Inne",
  },
  ru: {
    "Software Engineering": "Razrabotka PO", "Cloud & DevOps": "Oblachnye i DevOps",
    "Data Science & Analytics": "Nauka o dannykh i Analitika", "AI & Machine Learning": "II i Mashinnoe obuchenie",
    "Product Management": "Upravlenie produktami", "Cybersecurity": "Kiberbezopasnost",
    "Engineering Leadership": "Tekhnicheskoe rukovodstvo", "Consulting": "Konsalting",
    "Data Engineering": "Inzheneriya dannykh", "UX/UI & Design": "UX/UI i Dizain",
    "QA & Testing": "QA i Testirovanie", "Mobile Development": "Mobil'naya razrabotka",
    "Game Development": "Razrabotka igr", "Specialized Development": "Spetsializirovannaya razrabotka",
    "Embedded & IoT": "Vstroennye i IoT", "Writing & Content": "Redaktsiya i kontent",
    "Sales & Marketing": "Prodazhi i Marketing", "Finance Technology": "Finansovye tekhnologii",
    "IT Support & Operations": "IT-podderzhka i operatsii", "Research & Development": "Issledovaniya i razrabotka",
    Other: "Drugoe",
  },
  zh: {
    "Software Engineering": "软件工程", "Cloud & DevOps": "云与DevOps",
    "Data Science & Analytics": "数据科学与分析", "AI & Machine Learning": "AI与机器学习",
    "Product Management": "产品管理", "Cybersecurity": "网络安全",
    "Engineering Leadership": "工程领导力", "Consulting": "咨询",
    "Data Engineering": "数据工程", "UX/UI & Design": "UX/UI设计",
    "QA & Testing": "QA与测试", "Mobile Development": "移动开发",
    "Game Development": "游戏开发", "Specialized Development": "专业开发",
    "Embedded & IoT": "嵌入式与物联网", "Writing & Content": "写作与内容",
    "Sales & Marketing": "销售与营销", "Finance Technology": "金融科技",
    "IT Support & Operations": "IT支持与运维", "Research & Development": "研发",
    Other: "其他",
  },
  ja: {
    "Software Engineering": "ソフトウェアエンジニアリング", "Cloud & DevOps": "クラウド＆DevOps",
    "Data Science & Analytics": "データサイエンス＆分析", "AI & Machine Learning": "AI＆機械学習",
    "Product Management": "プロダクトマネジメント", "Cybersecurity": "サイバーセキュリティ",
    "Engineering Leadership": "エンジニアリングリーダーシップ", "Consulting": "コンサルティング",
    "Data Engineering": "データエンジニアリング", "UX/UI & Design": "UX/UIデザイン",
    "QA & Testing": "QA＆テスト", "Mobile Development": "モバイル開発",
    "Game Development": "ゲーム開発", "Specialized Development": "専門開発",
    "Embedded & IoT": "組み込み＆IoT", "Writing & Content": "ライティング＆コンテンツ",
    "Sales & Marketing": "営業＆マーケティング", "Finance Technology": "フィンテック",
    "IT Support & Operations": "ITサポート＆運用", "Research & Development": "研究開発",
    Other: "その他",
  },
  ko: {
    "Software Engineering": "소프트웨어 엔지니어링", "Cloud & DevOps": "클라우드 및 DevOps",
    "Data Science & Analytics": "데이터 과학 및 분석", "AI & Machine Learning": "AI 및 머신러닝",
    "Product Management": "제품 관리", "Cybersecurity": "사이버보안",
    "Engineering Leadership": "엔지니어링 리더십", "Consulting": "컨설팅",
    "Data Engineering": "데이터 엔지니어링", "UX/UI & Design": "UX/UI 디자인",
    "QA & Testing": "QA 및 테스팅", "Mobile Development": "모바일 개발",
    "Game Development": "게임 개발", "Specialized Development": "전문 개발",
    "Embedded & IoT": "임베디드 및 IoT", "Writing & Content": "라이팅 및 콘텐츠",
    "Sales & Marketing": "영업 및 마케팅", "Finance Technology": "핀테크",
    "IT Support & Operations": "IT 지원 및 운영", "Research & Development": "연구개발",
    Other: "기타",
  },
};

// Fill missing languages with English defaults
const sectorLangKeys = ["hi","bn","ar","tr","vi","th","ur","tl","sw","pt-pt"];
for (const k of sectorLangKeys) { if (!SECTOR_LABELS[k]) SECTOR_LABELS[k] = { ...SECTOR_LABELS["en"] }; }

export function getSectorLabel(sector: string, lang: string): string {
  return SECTOR_LABELS[lang]?.[sector] || SECTOR_LABELS["en"]?.[sector] || sector;
}

// ============================================================
// PAYWALL LOGIC: apenas 10% remoto + todos com salario >= $450k/ano
// ============================================================
export interface PaywallInfo {
  paywall: boolean;
  reason?: 'remote_10pct' | 'high_salary';
  hasDiscount: boolean;
}

export function shouldHavePaywall(job: {
  id: number;
  type?: string;
  salaryMax?: number;
  salaryPeriod?: string;
  salaryCurrency?: string;
  contactEmail?: string;
}): PaywallInfo {
  // Se ja tem contato, nao precisa de paywall
  if (job.contactEmail) return { paywall: false, hasDiscount: false };

  // Verifica se salario anual >= $450.000 (apenas USD)
  const maxSalary = job.salaryMax || 0;
  const period = job.salaryPeriod || 'year';
  const annualMax = period === 'month' ? maxSalary * 12 : period === 'hour' ? maxSalary * 2080 : maxSalary;
  const isUsd = !job.salaryCurrency || job.salaryCurrency === 'USD';
  const isHighSalary = isUsd && annualMax >= 450000;

  // Verifica se eh trabalho remoto
  const t = (job.type || '').toLowerCase();
  const isRemote = t === 'remoto' || t === 'remote';

  // Exatamente 10% dos trabalhos remotos: job.id % 10 === 0
  const isRemote10Pct = isRemote && (job.id % 10 === 0);

  // Salario alto SEMPRE tem paywall (qualquer tipo de trabalho)
  if (isHighSalary) {
    return { paywall: true, reason: 'high_salary', hasDiscount: isRemote };
  }

  // 10% dos trabalhos remotos tem paywall
  if (isRemote10Pct) {
    return { paywall: true, reason: 'remote_10pct', hasDiscount: false };
  }

  // Demais trabalhos: SEM paywall
  return { paywall: false, hasDiscount: false };
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

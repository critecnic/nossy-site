import { Metadata } from 'next';
import { LANGUAGES, LANG_SLUGS } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import countriesData from '@/data/countries.json';

interface CountryInfo { name: string; slug: string; region: string; count: number; }

const COUNTRY_EN: Record<string, string> = {
  'japao': 'Japan', 'coreia-do-sul': 'South Korea', 'singapura': 'Singapore',
  'tailandia': 'Thailand', 'malasia': 'Malaysia', 'vietna': 'Vietnam',
  'filipinas': 'Philippines', 'paquistao': 'Pakistan', 'remoto-global': 'Remote',
  'india': 'India', 'china': 'China', 'indonesia': 'Indonesia',
  'hong-kong': 'Hong Kong', 'taiwan': 'Taiwan', 'sri-lanka': 'Sri Lanka',
  'bangladesh': 'Bangladesh', 'nepal': 'Nepal',
  'united-states': 'United States', 'united-kingdom': 'United Kingdom',
  'germany': 'Germany', 'france': 'France', 'spain': 'Spain', 'italy': 'Italy',
  'netherlands': 'Netherlands', 'poland': 'Poland', 'ireland': 'Ireland',
  'finland': 'Finland', 'portugal': 'Portugal', 'switzerland': 'Switzerland',
  'denmark': 'Denmark', 'norway': 'Norway', 'sweden': 'Sweden', 'belgium': 'Belgium',
  'austria': 'Austria', 'czech-republic': 'Czech Republic', 'romania': 'Romania',
  'hungary': 'Hungary', 'greece': 'Greece', 'bulgaria': 'Bulgaria', 'croatia': 'Croatia',
  'slovakia': 'Slovakia', 'slovenia': 'Slovenia', 'estonia': 'Estonia',
  'latvia': 'Latvia', 'lithuania': 'Lithuania', 'luxembourg': 'Luxembourg',
  'malta': 'Malta', 'cyprus': 'Cyprus', 'iceland': 'Iceland', 'serbia': 'Serbia',
  'ukraine': 'Ukraine', 'bosnia-and-herzegovina': 'Bosnia and Herzegovina',
  'montenegro': 'Montenegro', 'moldova': 'Moldova', 'albania': 'Albania',
  'north-macedonia': 'North Macedonia', 'georgia': 'Georgia',
};

const REGION_EN: Record<string, string> = {
  'europa': 'Europe', 'asia': 'Asia', 'eua': 'North America',
};

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string; slug: string; region: string; country: string }> }): Promise<Metadata> {
  const { lang: langCode, slug, region, country } = await params;
  const lang = langCode as Lang;
  const countries = countriesData as CountryInfo[];
  const info = countries.find(c => c.slug === country);
  const countryEn = COUNTRY_EN[country] || country;
  const regionEn = REGION_EN[region] || region;
  const count = info?.count || 0;
  const locationStr = `${countryEn}${regionEn !== countryEn ? ', ' + regionEn : ''}`;

  const titles: Record<string, string> = {
    en: `${countryEn} Tech Jobs | NOSSY`,
    'pt-br': `Vagas de Tecnologia ${info?.name || country} | NOSSY`,
    'pt-pt': `Vagas de Tecnologia ${info?.name || country} | NOSSY`,
    es: `Empleos Tech en ${countryEn} | NOSSY`,
    fr: `Emplois Tech ${countryEn} | NOSSY`,
    de: `Tech-Jobs ${countryEn} | NOSSY`,
    it: `Lavori Tech ${countryEn} | NOSSY`,
    nl: `Tech Vacatures ${countryEn} | NOSSY`,
    pl: `Praca IT ${countryEn} | NOSSY`,
    ru: `IT-вакансии ${countryEn} | NOSSY`,
    zh: `${countryEn}科技职位 | NOSSY`,
    ja: `${countryEn}テック求人 | NOSSY`,
    ko: `${countryEn} 기술 채용 | NOSSY`,
    hi: `${countryEn} टेक नौकरियां | NOSSY`,
    bn: `${countryEn} টেক চাকরি | NOSSY`,
    ar: `وظائف تقنية ${countryEn} | NOSSY`,
    tr: `${countryEn} Teknoloji İşleri | NOSSY`,
    vi: `Việc làm Tech ${countryEn} | NOSSY`,
    th: `งานด้านเทคโนโลยี ${countryEn} | NOSSY`,
    ur: `${countryEn} ٹیک نوکریاں | NOSSY`,
    tl: `Tech Jobs sa ${countryEn} | NOSSY`,
    sw: `Kazi za Teknolojia ${countryEn} | NOSSY`,
  };

  const descriptions: Record<string, string> = {
    en: `Find ${count.toLocaleString()}+ tech jobs in ${locationStr}. Browse the latest vacancies with salaries. Free to search!`,
    'pt-br': `Encontre ${count.toLocaleString()}+ vagas de tecnologia em ${info?.name || country}. Navegue pelas ultimas vagas com salarios. Gratis!`,
    'pt-pt': `Encontre ${count.toLocaleString()}+ vagas de tecnologia em ${info?.name || country}. Navegue pelas ultimas vagas com salarios. Gratis!`,
    es: `Encuentra ${count.toLocaleString()}+ vacantes tecnologicas en ${locationStr}. Explora las ultimas vacantes con salarios. Gratis!`,
    fr: `Trouvez ${count.toLocaleString()}+ offres tech en ${locationStr}. Parcourez les dernieres offres avec salaires. Gratuit!`,
    de: `Finden Sie ${count.toLocaleString()}+ Tech-Stellenangebote in ${locationStr}. Durchsuchen Sie die neuesten Angebote mit Gehaltsangaben. Kostenlos!`,
    it: `Trova ${count.toLocaleString()}+ offerte di lavoro tech in ${locationStr}. Sfoglia le ultime offerte con stipendi. Gratis!`,
    nl: `Vind ${count.toLocaleString()}+ tech-vacatures in ${locationStr}. Blader door de nieuwste vacatures met salarissen. Gratis!`,
    pl: `Znajdz ${count.toLocaleString()}+ oferty pracy IT w ${locationStr}. Przegladaj najnowsze oferty z wynagrodzeniami. Za darmo!`,
    ru: `Найдите ${count.toLocaleString()}+ IT-вакансий в ${locationStr}. Просматривайте последние вакансии с зарплатами. Бесплатно!`,
    zh: `在${locationStr}查找 ${count.toLocaleString()}+ 科技职位。浏览最新职位和薪资信息。免费！`,
    ja: `${locationStr}の ${count.toLocaleString()}+ テック求人を見つけましょう。給付付き最新求人を閲覧。無料！`,
    ko: `${locationStr}에서 ${count.toLocaleString()}+ 기술 채용을 찾으세요. 급여 정보가 있는 최신 채용을 탐색하세요. 무료!`,
    hi: `${locationStr} में ${count.toLocaleString()}+ टेक नौकरियां खोजें। वेतन के साथ नवीनतम नौकरियां ब्राउज़ करें। मुफ्त!`,
    bn: `${locationStr} এ ${count.toLocaleString()}+ টেক চাকরি খুঁজুন। বেতন সহ সর্বশেষ চাকরি ব্রাউজ করুন। বিনামূল্যে!`,
    ar: `ابحث عن ${count.toLocaleString()}+ وظيفة تقنية في ${locationStr}. تصفح أحدث الوظائف مع الرواتب. مجانا!`,
    tr: `${locationStr}'da ${count.toLocaleString()}+ teknoloji işi bulun. Maaşlı en son iş ilanlarına göz atın. Ücretsiz!`,
    vi: `Tìm ${count.toLocaleString()}+ việc làm công nghệ ở ${locationStr}. Duyệt các việc làm mới nhất có mức lương. Miễn phí!`,
    th: `ค้นหา ${count.toLocaleString()}+ งานด้านเทคโนโลยีใน${locationStr} เรียกดูงานล่าสุดพร้อมเงินเดือน ฟรี!`,
    ur: `${locationStr} میں ${count.toLocaleString()}+ ٹیک نوکریاں تلاش کریں۔ تنخواہوں کے ساتھ تازہ ترین نوکریاں براؤز کریں۔ مفت!`,
    tl: `Hanapin ang ${count.toLocaleString()}+ tech jobs sa ${locationStr}. Mag-browse ng mga bagong trabaho kasama ang sweldo. Libre!`,
    sw: `Tafuta ${count.toLocaleString()}+ nafasi za kazi za teknolojia ${locationStr}. Vinjari nafasi za hivi karibuni na mishahara. Bure!`,
  };

  return {
    title: titles[lang] || titles['en'],
    description: descriptions[lang] || descriptions['en'],
    alternates: {
      canonical: 'https://nossy.pro/' + lang + '/' + slug + '/' + region + '/' + country,
      languages: {
        'x-default': '/en/jobs/' + region + '/' + country,
        ...Object.fromEntries(LANGUAGES.map((l) => [l.code, '/' + l.code + '/' + LANG_SLUGS[l.code] + '/' + region + '/' + country])),
      },
    },
    robots: { index: true, follow: true },
  };
}

export default function CountryLayout({ children }: { children: React.ReactNode }) {
  return children;
}

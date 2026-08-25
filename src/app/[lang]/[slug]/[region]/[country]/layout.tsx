import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { REGIONS } from "@/lib/countries";
import { getRegionName } from "@/lib/shared";
import { getCountryNameTranslated } from "@/lib/country-names";
import type { Lang } from "@/lib/i18n";
import countriesData from "@/data/countries.json";

const COUNTRY_META_DESC: Record<string, (n: string, c: string) => string> = {
  en: (n: string, c: string) => `Find ${c}+ tech job vacancies in ${n}. Software engineering, data science, cloud, remote and more. Free to browse on NOSSY.`,
  "pt-br": (n: string, c: string) => `Encontre ${c}+ vagas de tecnologia em ${n}. Engenharia de software, ciência de dados, cloud, remoto e mais. Grátis no NOSSY.`,
  "pt-pt": (n: string, c: string) => `Encontre ${c}+ vagas de tecnologia em ${n}. Engenharia de software, ciência de dados, cloud, remoto e mais. Grátis no NOSSY.`,
  es: (n: string, c: string) => `Encuentra ${c}+ vacantes tecnológicas en ${n}. Ingeniería de software, ciencia de datos, cloud, remoto y más. ¡Gratis en NOSSY!`,
  fr: (n: string, c: string) => `Trouvez ${c}+ offres d'emploi tech à ${n}. Ingénierie logicielle, data science, cloud, télétravail et plus. Gratuit sur NOSSY.`,
  de: (n: string, c: string) => `Finden Sie ${c}+ Tech-Stellenangebote in ${n}. Software-Engineering, Data Science, Cloud, Remote und mehr. Kostenlos auf NOSSY.`,
  it: (n: string, c: string) => `Trova ${c}+ offerte di lavoro tech in ${n}. Ingegneria del software, data science, cloud, remoto e altro. Gratis su NOSSY.`,
  nl: (n: string, c: string) => `Vind ${c}+ tech-vacatures in ${n}. Software engineering, data science, cloud, remote en meer. Gratis op NOSSY.`,
  pl: (n: string, c: string) => `Znajdź ${c}+ oferty pracy IT w ${n}. Inżynieria oprogramowania, data science, chmura, praca zdalna i więcej. Za darmo na NOSSY.`,
  ru: (n: string, c: string) => `Найдите ${c}+ вакансий в IT в ${n}. Разработка ПО, data science, облачные технологии и более. Бесплатно на NOSSY.`,
  zh: (n: string, c: string) => `在${n}找到${c}+技术岗位。软件工程、数据科学、云计算、远程等。免费浏览NOSSY。`,
  ja: (n: string, c: string) => `${n}で${c}+のテック求人を探す。ソフトウェアエンジニア、データサイエンス、クラウド、リモートなど。NOSSYで無料。`,
  ko: (n: string, c: string) => `${n}에서 ${c}+개의 테크 췄용 정보를 찾아보세요. 소프트웨어 엔지니어링, 데이터 사이언스, 클라우드, 원격 등. NOSSY에서 무료.`,
  hi: (n: string, c: string) => `${n} में ${c}+ टेक नौकरियाँ खोजें। सॉफ्टवेयर इंजीनियरिंग, डेटा साइंस, क्लाउड और बहुत कुछ। NOSSY पर मुफ्त।`,
  bn: (n: string, c: string) => `${n}-এ ${c}+ টেক চাকরি খুঁজুন। সফটওয়েয়ার ইংজিনিয়ারিং, ডাটা সাইন্স, ক্লাউড এবং আরও অনেক। NOSSY-এ বিনামূল্যে।`,
  ar: (n: string, c: string) => `ابحث عن ${c}+ وظيفة تقنية في ${n}. هندسة برمجية، علوم بيانات، حوسبة سحابية والمزيد. مجاناً على NOSSY.`,
  tr: (n: string, c: string) => `${n}'da ${c}+ teknoloji iş ilanı bulun. Yazılım mühendisliği, veri bilimi, bulut, uzaktan ve daha fazlası. NOSSY'da üccretsiz.`,
  vi: (n: string, c: string) => `Tìm ${c}+ việc làm công nghệ tại ${n}. Phát triển phần mềm, khoa học dữ liệu, đám mây, từ xa và hơn. Miễn phí trên NOSSY.`,
  th: (n: string, c: string) => `ค้นหา ${c}+ งานด้านเทคโนโลยีที่ ${n} สมัครสร้างซอฟต์แวร์ วิศวกรรมข้อมูล คลาวด์ ระยะไกล และอื่นๆ ฟรีบน NOSSY`,
  ur: (n: string, c: string) => `${n} میں ${c}+ ٹیک نوکریاں تلاش کریں۔ سافٹ ویر اینجنئرینگ، ڈیٹا سائنس، کلاؤڈد، ریموٹ و مزید۔ NOSSY پر مفت۔`,
  tl: (n: string, c: string) => `Hanapin ang ${c}+ na tech job vacancies sa ${n}. Software engineering, data science, cloud, remote at marami pa. Libre sa NOSSY.`,
  sw: (n: string, c: string) => `Pata nafasi ${c}+ za kazi za teknolojia ${n}. Uhandisi wa programu, sayansi ya data, wingu, u mbali na zaidi. Bure kwenye NOSSY.`,
};

const COUNTRY_META_TITLE: Record<string, (n: string, c: string) => string> = {
  en: (n: string, c: string) => `Tech Jobs in ${n} | ${c}+ Vacancies | NOSSY`,
  "pt-br": (n: string, c: string) => `Vagas de Tecnologia em ${n} | ${c}+ Vagas | NOSSY`,
  "pt-pt": (n: string, c: string) => `Vagas de Tecnologia em ${n} | ${c}+ Vagas | NOSSY`,
  es: (n: string, c: string) => `Empleos Tech en ${n} | ${c}+ Vacantes | NOSSY`,
  fr: (n: string, c: string) => `Emplois Tech à ${n} | ${c}+ Offres | NOSSY`,
  de: (n: string, c: string) => `Tech-Stellen in ${n} | ${c}+ Stellen | NOSSY`,
  it: (n: string, c: string) => `Offerte Tech a ${n} | ${c}+ Vacanze | NOSSY`,
  nl: (n: string, c: string) => `Tech Vacatures in ${n} | ${c}+ Vacatures | NOSSY`,
  pl: (n: string, c: string) => `Praca IT w ${n} | ${c}+ Ofert | NOSSY`,
  ru: (n: string, c: string) => `Работа в IT в ${n} | ${c}+ вакансий | NOSSY`,
  zh: (n: string, c: string) => `探索${n}的${c}+科技职位 | NOSSY`,
  ja: (n: string, c: string) => `${n}の${c}+テック求人 | NOSSY`,
  ko: (n: string, c: string) => `${n}의 ${c}+ 기술 채용 | NOSSY`,
  hi: (n: string, c: string) => `${n} में ${c}+ टेक नौकरियां | NOSSY`,
  bn: (n: string, c: string) => `${n}-এ ${c}+ টেক চাকরি | NOSSY`,
  ar: (n: string, c: string) => `${c}+ وظيفة تقنية في ${n} | NOSSY`,
  tr: (n: string, c: string) => `${n}'da ${c}+ Teknoloji İş İlanı | NOSSY`,
  vi: (n: string, c: string) => `${c}+ việc làm công nghệ tại ${n} | NOSSY`,
  th: (n: string, c: string) => `${c}+ งานด้านเทคโนโลยีใน${n} | NOSSY`,
  ur: (n: string, c: string) => `${n} میں ${c}+ ٹیک نوکریاں | NOSSY`,
  tl: (n: string, c: string) => `${c}+ Tech Jobs sa ${n} | NOSSY`,
  sw: (n: string, c: string) => `${c}+ Nafasi za Kazi za Teknolojia ${n} | NOSSY`,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string; region: string; country: string }>;
}): Promise<Metadata> {
  const { lang: langCode, slug, region: rc, country: cc } = await params;
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const countryInfo = (countriesData as any[]).find(c => c.slug === cc);
  const regionInfo = REGIONS.find(r => r.code === rc);
  const countryName = getCountryNameTranslated(cc, lang, countryInfo?.name || cc);
  const count = countryInfo?.count || 0;
  const countStr = count.toLocaleString();

  const url = `https://nossy.pro/${langCode}/${slug}/${rc}/${cc}`;
  const alternates: Record<string, string> = { "x-default": `/en/jobs/${rc}/${cc}` };
  for (const l of LANGUAGES) {
    alternates[l.code] = `/${l.code}/${LANG_SLUGS[l.code]}/${rc}/${cc}`;
  }

  const titleFn = COUNTRY_META_TITLE[lang] || COUNTRY_META_TITLE["en"];
  const descFn = COUNTRY_META_DESC[lang] || COUNTRY_META_DESC["en"];

  return {
    title: titleFn(countryName, countStr),
    description: descFn(countryName, countStr),
    alternates: { canonical: url, languages: alternates },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      title: titleFn(countryName, countStr),
      description: descFn(countryName, countStr),
      url,
      siteName: "NOSSY",
      images: [{ url: "https://nossy.pro/og/og-default.png", width: 1200, height: 630, alt: countryName }],
    },
    twitter: {
      card: "summary_large_image",
      title: titleFn(countryName, countStr),
      description: descFn(countryName, countStr),
      images: ["https://nossy.pro/og/og-default.png"],
    },
  };
}

export default function CountryLayout({ children }: { children: React.ReactNode }) {
  return children;
}

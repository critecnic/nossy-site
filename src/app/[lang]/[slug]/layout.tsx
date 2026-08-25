import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { TOTAL_JOBS } from "@/lib/countries";
import type { Lang } from "@/lib/i18n";
import LangUpdater from "@/components/LangUpdater";

const DESC: Record<string, string> = {
  en: "NOSSY - Seek and you shall find. Browse " + TOTAL_JOBS.toLocaleString() + "+ tech job vacancies across Europe, Asia and USA. Free to browse!",
  "pt-br": "NOSSY - Busque e encontrará. Navegue por " + TOTAL_JOBS.toLocaleString() + "+ vagas de tecnologia na Europa, Ásia e EUA. Grátis!",
  "pt-pt": "NOSSY - Procure e encontrará. Navegue por " + TOTAL_JOBS.toLocaleString() + "+ vagas de tecnologia na Europa, Ásia e EUA. Grátis!",
  es: "NOSSY - Busca y encontrarás. Explora " + TOTAL_JOBS.toLocaleString() + "+ vacantes tecnológicas en Europa, Asia y EE.UU. ¡Gratis!",
  fr: "NOSSY - Cherchez et vous trouverez. Parcourez " + TOTAL_JOBS.toLocaleString() + "+ offres d'emploi tech en Europe, Asie et USA. Gratuit!",
  de: "NOSSY - Suchen und Sie werden finden. Durchsuchen Sie " + TOTAL_JOBS.toLocaleString() + "+ Tech-Stellenangebote in Europa, Asien und USA. Kostenlos!",
  it: "NOSSY - Cerca e troverai. Sfoglia " + TOTAL_JOBS.toLocaleString() + "+ offerte di lavoro tech in Europa, Asia e USA. Gratis!",
  nl: "NOSSY - Zoek en u zult vinden. Blader door " + TOTAL_JOBS.toLocaleString() + "+ tech-vacatures in Europa, Azië en VS. Gratis!",
  pl: "NOSSY - Szukaj a znajdziesz. Przeglądaj " + TOTAL_JOBS.toLocaleString() + "+ oferty pracy IT w Europie, Azji i USA. Za darmo!",
  ru: "NOSSY - Ищите и найдёте. Просматривайте " + TOTAL_JOBS.toLocaleString() + "+ вакансий в IT в Европе, Азии и США. Бесплатно!",
  zh: "NOSSY - 寻找，你将找到。浏览 " + TOTAL_JOBS.toLocaleString() + "+ 欧洲和亚洲和美国的科技职位。免费！",
  ja: "NOSSY - 探せば見つかります。ヨーロッパ、アジア、米国の " + TOTAL_JOBS.toLocaleString() + "+ のテック求人を閲覧。無料！",
  ko: "NOSSY - 찾으면 찾을 수 있습니다. 유럽, 아시아, 미국의 " + TOTAL_JOBS.toLocaleString() + "+ 기술 채용 정보를 탐색하세요. 무료!",
  hi: "NOSSY - खोजें और पाएंगे। यूरोप, एशिया और अमेरिका में " + TOTAL_JOBS.toLocaleString() + "+ टेक नौकरियां ब्राउज़ करें। मुफ्त!",
  bn: "NOSSY - খুঁজুন এবং পাবেন। ইউরোপ, এশিয়া এবং আমেরিকায় " + TOTAL_JOBS.toLocaleString() + "+ টেক চাকরি ব্রাউজ করুন। বিনামূল্যে!",
  ar: "NOSSY - ابحث وستجد. تصفح " + TOTAL_JOBS.toLocaleString() + "+ وظيفة تقنية في أوروبا وآسيا وأمريكا. مجانا!",
  tr: "NOSSY - Arayın ve bulacaksınız. Avrupa, Asya ve ABD'de " + TOTAL_JOBS.toLocaleString() + "+ teknoloji iş ilanlarına göz atın. Ücretsiz!",
  vi: "NOSSY - Tìm và bạn sẽ tìm thấy. Duyệt " + TOTAL_JOBS.toLocaleString() + "+ việc làm công nghệ ở Châu Âu, Châu Á và Mỹ. Miễn phí!",
  th: "NOSSY - ค้นหาแล้วคุณจะพบ. เรียกดู " + TOTAL_JOBS.toLocaleString() + "+ งานด้านเทคโนโลยีในยุโรป เอเชีย และอเมริกา ฟรี!",
  ur: "NOSSY - تلاش کریں اور پائیں گا۔ یورپ، ایشیا اور امریکہ میں " + TOTAL_JOBS.toLocaleString() + "+ ٹیک نوکریوں کو براؤز کریں۔ مفت!",
  tl: "NOSSY - Hanapin at makikita mo. Mag-browse ng " + TOTAL_JOBS.toLocaleString() + "+ tech jobs sa Europa, Asya at USA. Libre!",
  sw: "NOSSY - Tafuta utapata. Vinjari " + TOTAL_JOBS.toLocaleString() + "+ nafasi za kazi za teknolojia Ulaya, Asia na Marekani. Bure!",
};

export function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ lang: lang.code, slug: LANG_SLUGS[lang.code] }));
}

const LOCALE_MAP: Record<string, string> = {
  en: 'en_US', 'pt-br': 'pt_BR', 'pt-pt': 'pt_PT', es: 'es_ES', fr: 'fr_FR',
  de: 'de_DE', it: 'it_IT', nl: 'nl_NL', pl: 'pl_PL', ru: 'ru_RU',
  zh: 'zh_CN', ja: 'ja_JP', ko: 'ko_KR', hi: 'hi_IN', bn: 'bn_BD',
  ar: 'ar_SA', tr: 'tr_TR', vi: 'vi_VN', th: 'th_TH', ur: 'ur_PK',
  tl: 'tl_PH', sw: 'sw_TZ',
};

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang: langCode, slug } = await params;
  const lang = langCode as Lang;
  const langCfg = LANGUAGES.find((l) => l.code === lang);
  const total = TOTAL_JOBS.toLocaleString();
  const url = "https://nossy.pro" + "/" + lang + "/" + slug;

  return {
    title: "NOSSY | " + (langCfg?.name || lang) + " | " + total + "+ " + (lang === "pt-br" || lang === "pt-pt" ? "Vagas" : "Jobs"),
    description: DESC[lang] || DESC["en"],
    alternates: {
      canonical: url,
      languages: {
        "x-default": "/en/jobs",
        ...Object.fromEntries(LANGUAGES.map((l) => [l.code, "/" + l.code + "/" + LANG_SLUGS[l.code]])),
      },
    },
    openGraph: {
      locale: LOCALE_MAP[lang] || 'en_US',
      title: "NOSSY | " + total + "+ " + (lang === "pt-br" || lang === "pt-pt" ? "Vagas" : "Jobs"),
      description: DESC[lang] || DESC["en"],
      url,
      siteName: "NOSSY",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function LangSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang } = await params;
  return <><LangUpdater lang={lang} />{children}</>;
}
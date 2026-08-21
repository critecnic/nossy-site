import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { REGIONS } from "@/lib/countries";
import { getRegionName } from "@/lib/shared";
import type { Lang } from "@/lib/i18n";

const REGION_META_DESC: Record<string, (name: string, count: string) => string> = {
  en: (n, c) => `Browse ${n} tech jobs on NOSSY. ${c}+ vacancies across multiple countries.`,
  "pt-br": (n, c) => `Navegue vagas de tecnologia na ${n} no NOSSY. ${c}+ vagas em diversos paises.`,
  "pt-pt": (n, c) => `Navegue vagas de tecnologia na ${n} no NOSSY. ${c}+ vagas em diversos paises.`,
  es: (n, c) => `Explora empleos tech en ${n} en NOSSY. ${c}+ vacantes en multiples paises.`,
  fr: (n, c) => `Parcourez les offres tech en ${n} sur NOSSY. ${c}+ offres dans plusieurs pays.`,
  de: (n, c) => `Durchsuchen Sie Tech-Stellenangebote in ${n} auf NOSSY. ${c}+ Stellen in mehreren Landern.`,
  it: (n, c) => `Sfoglia offerte tech in ${n} su NOSSY. ${c}+ vacanze in diversi paesi.`,
  nl: (n, c) => `Blader door tech-vacatures in ${n} op NOSSY. ${c}+ vacatures in meerdere landen.`,
  pl: (n, c) => `Przegladaj oferty IT w ${n} na NOSSY. ${c}+ ofert w wielu krajach.`,
  ru: (n, c) => `Просматривайте вакансии в IT в ${n} на NOSSY. ${c}+ вакансий в нескольких странах.`,
  zh: (n, c) => `在NOSSY浏览${n}技术岗位。${c}+个职位，覆盖多个国家。`,
  ja: (n, c) => `NOSSYで${n}のテック求人を閲覧。${c}+件の求人、複数の国にわたる。`,
  ko: (n, c) => `NOSSY에서 ${n} 테크 채용을 탐색하세요. ${c}+개의 채용, 여러 국가.`,
  hi: (n, c) => `NOSSY पर ${n} में टेक नौकरियां ब्राउज़ करें। कई देशों में ${c}+ नौकरियां।`,
  bn: (n, c) => `NOSSY-এ ${n}-এ টেক চাকরি ব্রাউজ করুন। একাধিক দেশে ${c}+ চাকরি।`,
  ar: (n, c) => `تصفح الوظائف التقنية في ${n} على NOSSY. ${c}+ وظيفة عبر عدة دول.`,
  tr: (n, c) => `NOSSY'da ${n} teknoloji iş ilanlarına göz atın. Birden çok ulkede ${c}+ ilan.`,
  vi: (n, c) => `Duyệt việc làm công nghệ tại ${n} trên NOSSY. ${c}+ việc làm ở nhiều quốc gia.`,
  th: (n, c) => `เรียกดูงานด้านเทคโนโลยีใน${n}บน NOSSY ${c}+ งานในหลายประเทศ`,
  ur: (n, c) => `NOSSY پر ${n} میں ٹیک نوکریوں کو براؤز کریں۔ کئی ممالک میں ${c}+ نوکریاں۔`,
  tl: (n, c) => `Mag-browse ng tech jobs sa ${n} sa NOSSY. ${c}+ vacancies sa maraming bansa.`,
  sw: (n, c) => `Vinjari nafasi za kazi za teknolojia ${n} kwenye NOSSY. ${c}+ nafasi katika nchi nyingi.`,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string; region: string }>;
}): Promise<Metadata> {
  const { lang: langCode, slug, region: rc } = await params;
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const regionInfo = REGIONS.find(r => r.code === rc);
  const regionName = getRegionName(lang, rc);
  const countStr = regionInfo?.jobCount.toLocaleString() || "0";

  const url = `https://nossy.pro/${langCode}/${slug}/${rc}`;
  const alternates: Record<string, string> = { "x-default": `/en/jobs/${rc}` };
  for (const l of LANGUAGES) {
    alternates[l.code] = `/${l.code}/${LANG_SLUGS[l.code]}/${rc}`;
  }

  const descFn = REGION_META_DESC[lang] || REGION_META_DESC["en"];

  return {
    title: `${regionInfo?.flag || ''} ${regionName} | Tech Jobs | NOSSY`,
    description: regionInfo?.seoDescription || descFn(regionName, countStr),
    alternates: { canonical: url, languages: alternates },
    robots: { index: false, follow: true },
  };
}

export default function RegionLayout({ children }: { children: React.ReactNode }) {
  return children;
}

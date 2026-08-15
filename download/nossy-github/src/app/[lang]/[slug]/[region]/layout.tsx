import { Metadata } from 'next';
import { LANGUAGES, LANG_SLUGS } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';
import countriesData from '@/data/countries.json';

interface CountryInfo { name: string; slug: string; region: string; count: number; }

const REGION_EN: Record<string, string> = {
  'europa': 'Europe', 'asia': 'Asia', 'eua': 'United States',
};

const REGION_META: Record<string, { flag: string; count: number }> = {
  'europa': { flag: '\u{1F1EA}\u{1F1FA}', count: 14853 },
  'asia': { flag: '\u{1F1E8}\u{1F1F3}', count: 10328 },
  'eua': { flag: '\u{1F1FA}\u{1F1F8}', count: 19046 },
};

export function generateStaticParams() {
  const regions = ['europa', 'asia', 'eua'];
  const params: { lang: string; slug: string; region: string }[] = [];
  for (const lang of LANGUAGES) {
    for (const region of regions) {
      params.push({ lang: lang.code, slug: LANG_SLUGS[lang.code], region });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string; slug: string; region: string }> }): Promise<Metadata> {
  const { lang: langCode, region: rc } = await params;
  const lang = langCode as Lang;
  const langCfg = LANGUAGES.find(l => l.code === lang);
  const regionEn = REGION_EN[rc] || rc;
  const meta = REGION_META[rc] || { flag: '', count: 0 };
  const countries = (countriesData as CountryInfo[]).filter(c => c.region === rc);
  const countryCount = countries.length;
  const slug = LANG_SLUGS[lang];
  const pageUrl = `/${lang}/${slug}/${rc}`;

  const title = `${meta.count.toLocaleString()}+ ${lang === 'pt-br' || lang === 'pt-pt' ? 'Vagas' : 'Jobs'} in ${regionEn} | ${countryCount} ${lang === 'pt-br' || lang === 'pt-pt' ? 'Países' : 'Countries'} | NOSSY`;
  const description = lang === 'pt-br' || lang === 'pt-pt'
    ? `Explore ${meta.count.toLocaleString()}+ vagas de tecnologia em ${regionEn}. ${countryCount} países com vagas remotas, híbridas e presenciais. As melhores empresas estão contratando.`
    : `Browse ${meta.count.toLocaleString()}+ tech jobs across ${regionEn}. ${countryCount} countries with remote, hybrid and on-site positions. Top companies are hiring.`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: Object.fromEntries(LANGUAGES.map(l => [l.code, `/${l.code}/${LANG_SLUGS[l.code]}/${rc}`])),
    },
    openGraph: {
      url: pageUrl,
      title,
      description,
      type: 'website',
      siteName: 'NOSSY',
    },
    robots: { index: true, follow: true },
  };
}

export default function RegionLayout({ children }: { children: React.ReactNode }) {
  return children;
}

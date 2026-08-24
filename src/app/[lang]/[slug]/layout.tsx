import { Metadata } from 'next';
import { LANGUAGES, LANG_SLUGS, i18n } from '@/lib/i18n';
import type { Lang } from '@/lib/i18n';

export function generateStaticParams() {
  return LANGUAGES.map(l => ({ lang: l.code, slug: LANG_SLUGS[l.code] }));
}

const DESC: Record<string, string> = {};
for (const l of LANGUAGES) {
  const t = i18n[l.code] || i18n['en'];
  DESC[l.code] = t.homeDesc || ('Browse ' + t.totalJobs + '+ tech jobs across 60 countries in Europe, Asia and the USA. ' + (t.homeSubtitle || ''));
}

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const resolved = typeof params.then === 'function' ? await params : params;
  const lang = resolved.lang as Lang;
  const slug = LANG_SLUGS[lang];
  const url = '/' + lang + '/' + slug;
  return {
    title: 'NOSSY | ' + (i18n[lang]?.totalJobs || '44,000+') + '+ ' + (i18n[lang]?.vacancies || 'Tech Jobs') + ' Worldwide',
    description: DESC[lang] || DESC['en'],
    alternates: { canonical: url, languages: Object.fromEntries(LANGUAGES.map(l => [l.code, '/' + l.code + '/' + LANG_SLUGS[l.code]])) },
    openGraph: { url, type: 'website', siteName: 'NOSSY', locale: lang === 'pt-br' ? 'pt_BR' : lang === 'pt-pt' ? 'pt_PT' : lang },
    robots: { index: true, follow: true },
  };
}

export default function LangSlugLayout({ children }: { children: React.ReactNode }) { return children; }

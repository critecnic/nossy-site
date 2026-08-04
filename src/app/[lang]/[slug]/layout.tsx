import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { COUNTRIES, TOTAL_JOBS } from "@/lib/countries";
import type { Lang } from "@/lib/i18n";

export function generateStaticParams() {
  return LANGUAGES.map((lang) => ({
    lang: lang.code,
    slug: LANG_SLUGS[lang.code],
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: langCode, slug } = await params;
  const lang = langCode as Lang;
  const langCfg = LANGUAGES.find((l) => l.code === lang);
  const totalJobs = TOTAL_JOBS.toLocaleString();

  return {
    title: `Work Versaly | ${langCfg?.name || lang} - Jobs in 12 Countries | ${totalJobs}+ Vacancies`,
    description: `Browse ${totalJobs}+ job vacancies across USA, UK, Germany, Canada, Australia, Japan, Switzerland, France, Netherlands, Singapore, UAE, Brazil. ${langCfg?.name || lang} version. Free to apply.`,
    alternates: {
      canonical: `/${lang}/${slug}`,
      languages: Object.fromEntries(
        LANGUAGES.map((l) => [l.code, `/${l.code}/${LANG_SLUGS[l.code]}`])
      ),
    },
    openGraph: {
      title: `Work Versaly | ${langCfg?.name || lang} | ${totalJobs}+ Jobs`,
      description: `Browse ${totalJobs}+ job vacancies across 12 countries. Free global job search.`,
      type: "website",
      siteName: "Work Versaly",
      locale: lang?.replace("-", "_") || "en_US",
    },
    robots: {
      index: true, follow: true,
      googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default function LangSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}

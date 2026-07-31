import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
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

  return {
    title: `W-W | World of Work - ${langCfg?.name || lang} - Jobs Worldwide`,
    description:
      "Browse 15,400+ job vacancies across 20 countries. Free global job search with real salaries and top companies.",
    alternates: {
      canonical: `/${lang}/${slug}`,
      languages: Object.fromEntries(
        LANGUAGES.map((l) => [l.code, `/${l.code}/${LANG_SLUGS[l.code]}`])
      ),
    },
    openGraph: {
      title: `W-W | World of Work - ${langCfg?.name || lang}`,
      description:
        "Browse 15,400+ job vacancies across 20 countries. Free global job search.",
      type: "website",
      siteName: "W-W World of Work",
    },
  };
}

export default function LangSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

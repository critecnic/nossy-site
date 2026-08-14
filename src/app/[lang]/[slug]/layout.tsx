import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { TOTAL_JOBS } from "@/lib/countries";
import type { Lang } from "@/lib/i18n";

export function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ lang: lang.code, slug: LANG_SLUGS[lang.code] }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang: langCode, slug } = await params;
  const lang = langCode as Lang;
  const langCfg = LANGUAGES.find((l) => l.code === lang);
  const total = TOTAL_JOBS.toLocaleString();
  return {
    title: "NOSSY | " + (langCfg?.name || lang) + " | " + total + "+ " + (lang === "pt-br" || lang === "pt-pt" ? "Vagas" : "Jobs"),
    description: "NOSSY - Seek and you shall find. Browse " + total + "+ tech job vacancies across Europe, Asia and USA. Free to browse!",
    alternates: {
      canonical: "https://nossy.pro" + "/" + lang + "/" + slug,
      languages: {
        "x-default": "/en/jobs",
        ...Object.fromEntries(LANGUAGES.map((l) => [l.code, "/" + l.code + "/" + LANG_SLUGS[l.code]])),
      },
    },
    robots: { index: true, follow: true },
  };
}

export default function LangSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}

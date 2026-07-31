import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { COUNTRIES, getCountry } from "@/lib/countries";
import type { Lang } from "@/lib/i18n";

export function generateStaticParams() {
  return LANGUAGES.flatMap((lang) =>
    COUNTRIES.map((country) => ({
      lang: lang.code,
      slug: LANG_SLUGS[lang.code],
      country: country.code,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string; country: string }>;
}): Promise<Metadata> {
  const { lang: langCode, country: countryCode } = await params;
  const lang = langCode as Lang;
  const country = getCountry(countryCode);
  const langCfg = LANGUAGES.find((l) => l.code === lang);

  if (!country) return { title: "Country Not Found | W-W" };

  const title = `${country.name} Jobs | ${langCfg?.name || lang} - W-W World of Work`;
  const description = `Browse ${country.jobCount.toLocaleString()}+ job vacancies in ${country.name}. Top companies hiring now in Technology, Finance, Healthcare & more. Free to browse - apply today!`;
  const url = `https://ww.jobs/${lang}/${LANG_SLUGS[lang]}/${country.code}`;

  return {
    title,
    description,
    keywords: country.seoKeywords,
    alternates: {
      canonical: `/${lang}/${LANG_SLUGS[lang]}/${country.code}`,
      languages: Object.fromEntries(
        LANGUAGES.map((l) => [l.code, `/${l.code}/${LANG_SLUGS[l.code]}/${country.code}`])
      ),
    },
    openGraph: {
      title, description, type: "website", url,
      siteName: "W-W World of Work",
      locale: lang?.replace("-", "_") || "en_US",
      images: [{ url: `https://ww.jobs/og-${country.code}.png`, width: 1200, height: 630, alt: `${country.name} Jobs - W-W World of Work` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`https://ww.jobs/og-${country.code}.png`] },
    robots: {
      index: true, follow: true,
      googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default function LangSlugCountryLayout({ children }: { children: React.ReactNode }) {
  return children;
}

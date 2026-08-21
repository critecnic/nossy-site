import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { REGIONS } from "@/lib/countries";
import { getRegionName } from "@/lib/shared";
import type { Lang } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string; region: string }>;
}): Promise<Metadata> {
  const { lang: langCode, slug, region: rc } = await params;
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const regionInfo = REGIONS.find(r => r.code === rc);
  const regionName = getRegionName(lang, rc);

  const url = `https://nossy.pro/${langCode}/${slug}/${rc}`;
  const alternates: Record<string, string> = { "x-default": `/en/jobs/${rc}` };
  for (const l of LANGUAGES) {
    alternates[l.code] = `/${l.code}/${LANG_SLUGS[l.code]}/${rc}`;
  }

  return {
    title: `${regionInfo?.flag || ''} ${regionName} | Tech Jobs | NOSSY`,
    description: regionInfo?.seoDescription || `Browse ${regionName} tech jobs on NOSSY. ${regionInfo?.jobCount.toLocaleString()}+ vacancies across multiple countries.`,
    alternates: { canonical: url, languages: alternates },
    robots: { index: false, follow: true },
  };
}

export default function RegionLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { REGIONS } from "@/lib/countries";
import type { Lang } from "@/lib/i18n";
import countriesData from "@/data/countries.json";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string; region: string; country: string }>;
}): Promise<Metadata> {
  const { lang: langCode, slug, region: rc, country: cc } = await params;
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const countryInfo = (countriesData as any[]).find(c => c.slug === cc);
  const regionInfo = REGIONS.find(r => r.code === rc);
  const countryName = countryInfo?.name || cc;
  const count = countryInfo?.count || 0;

  const url = `https://nossy.pro/${langCode}/${slug}/${rc}/${cc}`;
  const alternates: Record<string, string> = { "x-default": `/en/jobs/${rc}/${cc}` };
  for (const l of LANGUAGES) {
    alternates[l.code] = `/${l.code}/${LANG_SLUGS[l.code]}/${rc}/${cc}`;
  }

  return {
    title: `Tech Jobs in ${countryName} | ${count.toLocaleString()}+ Vacancies | NOSSY`,
    description: `Find ${count.toLocaleString()}+ tech job vacancies in ${countryName}. Software engineering, data science, cloud, remote and more. Free to browse on NOSSY.`,
    alternates: { canonical: url, languages: alternates },
    robots: { index: false, follow: true },
  };
}

export default function CountryLayout({ children }: { children: React.ReactNode }) {
  return children;
}

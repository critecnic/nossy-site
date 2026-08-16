import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import countriesData from "@/data/countries.json";

interface CountryInfo { name: string; slug: string; region: string; count: number; }

const REGION_EN: Record<string, string> = { europa: "Europe", asia: "Asia", eua: "United States" };
const REGION_COUNT: Record<string, number> = {};
for (const c of countriesData as CountryInfo[]) { REGION_COUNT[c.region] = (REGION_COUNT[c.region] || 0) + c.count; }

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string; region: string }> }): Promise<Metadata> {
  const { lang: lc, region: rc } = await params;
  const lang = lc as Lang;
  const regionEn = REGION_EN[rc] || rc;
  const count = REGION_COUNT[rc] || 0;
  const countries = (countriesData as CountryInfo[]).filter(c => c.region === rc);
  const slug = LANG_SLUGS[lang];
  const pageUrl = "/" + lang + "/" + slug + "/" + rc;
  const isPt = lang === "pt-br" || lang === "pt-pt";
  const title = count.toLocaleString() + "+ " + (isPt ? "Vagas" : "Jobs") + " in " + regionEn + " | " + countries.length + " " + (isPt ? "Paises" : "Countries") + " | NOSSY";
  const description = isPt
    ? "Explore " + count.toLocaleString() + "+ vagas de tecnologia em " + regionEn + ". " + countries.length + " paises com vagas remotas, hibridas e presenciais."
    : "Browse " + count.toLocaleString() + "+ tech jobs across " + regionEn + ". " + countries.length + " countries with remote, hybrid and on-site positions.";
  return {
    title, description,
    alternates: { canonical: pageUrl, languages: Object.fromEntries(LANGUAGES.map(l => [l.code, "/" + l.code + "/" + LANG_SLUGS[l.code] + "/" + rc])) },
    openGraph: { url: pageUrl, title, description, type: "website", siteName: "NOSSY", locale: lang === "pt-br" ? "pt_BR" : lang === "pt-pt" ? "pt_PT" : lang },
    robots: { index: true, follow: true },
  };
}

export default function RegionLayout({ children }: { children: React.ReactNode }) { return children; }

import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import countriesData from "@/data/countries.json";

interface CountryInfo { name: string; slug: string; region: string; count: number; }

const COUNTRY_EN: Record<string, string> = {
  "japao": "Japan", "coreia-do-sul": "South Korea", "singapura": "Singapore",
  "tailandia": "Thailand", "malasia": "Malaysia", "vietna": "Vietnam",
  "filipinas": "Philippines", "paquistao": "Pakistan", "remoto-global": "Remote",
  "india": "India", "china": "China", "indonesia": "Indonesia",
  "hong-kong": "Hong Kong", "taiwan": "Taiwan", "sri-lanka": "Sri Lanka",
  "bangladesh": "Bangladesh", "nepal": "Nepal",
  "united-states": "United States", "united-kingdom": "United Kingdom",
  "germany": "Germany", "france": "France", "spain": "Spain", "italy": "Italy",
  "netherlands": "Netherlands", "poland": "Poland", "ireland": "Ireland",
  "finland": "Finland", "portugal": "Portugal", "switzerland": "Switzerland",
  "denmark": "Denmark", "norway": "Norway", "sweden": "Sweden", "belgium": "Belgium",
  "austria": "Austria", "czech-republic": "Czech Republic", "romania": "Romania",
  "hungary": "Hungary", "greece": "Greece", "bulgaria": "Bulgaria", "croatia": "Croatia",
  "slovakia": "Slovakia", "slovenia": "Slovenia", "estonia": "Estonia",
  "latvia": "Latvia", "lithuania": "Lithuania", "luxembourg": "Luxembourg",
  "malta": "Malta", "cyprus": "Cyprus", "iceland": "Iceland", "serbia": "Serbia",
  "ukraine": "Ukraine", "bosnia-and-herzegovina": "Bosnia and Herzegovina",
  "montenegro": "Montenegro", "moldova": "Moldova", "albania": "Albania",
  "north-macedonia": "North Macedonia", "georgia": "Georgia",
};

const REGION_EN: Record<string, string> = { europa: "Europe", asia: "Asia", eua: "United States" };

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string; region: string; country: string }> }): Promise<Metadata> {
  const { lang: lc, region: rc, country: cc } = await params;
  const lang = lc as Lang;
  const countryEn = COUNTRY_EN[cc] || cc;
  const regionEn = REGION_EN[rc] || rc;
  const countries = countriesData as CountryInfo[];
  const cInfo = countries.find(c => c.slug === cc);
  const jobCount = cInfo?.count || 0;
  const slug = LANG_SLUGS[lang];
  const pageUrl = "/" + lang + "/" + slug + "/" + rc + "/" + cc;
  const isPt = lang === "pt-br" || lang === "pt-pt";
  const title = jobCount.toLocaleString() + "+ " + (isPt ? "Vagas" : "Jobs") + " in " + countryEn + " | NOSSY";
  const description = isPt
    ? "Encontre " + jobCount.toLocaleString() + "+ vagas de tecnologia em " + countryEn + ", " + regionEn + ". Trabalhe remoto, hibrido ou presencial nas melhores empresas. Atualizado diariamente."
    : "Find " + jobCount.toLocaleString() + "+ tech jobs in " + countryEn + ", " + regionEn + ". Remote, hybrid and on-site positions at top companies. Updated daily.";
  const ogMap: Record<string, string> = { europa: "/og/og-europa.png", asia: "/og/og-asia.png", eua: "/og/og-eua.png" };
  return {
    title, description,
    alternates: { canonical: pageUrl, languages: Object.fromEntries(LANGUAGES.map(l => [l.code, "/" + l.code + "/" + LANG_SLUGS[l.code] + "/" + rc + "/" + cc])) },
    openGraph: { url: pageUrl, title, description, type: "website", siteName: "NOSSY", locale: lang === "pt-br" ? "pt_BR" : lang === "pt-pt" ? "pt_PT" : lang, images: [{ url: ogMap[rc] || "/og/og-default.png", width: 1200, height: 630 }] },
    robots: { index: true, follow: true },
  };
}

export default function CountryLayout({ children }: { children: React.ReactNode }) { return children; }

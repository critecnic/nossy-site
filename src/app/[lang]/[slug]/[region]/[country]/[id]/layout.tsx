import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getLocalizedCountryName } from "@/lib/shared";
import countriesData from "@/data/countries.json";

interface CountryInfo { name: string; slug: string; region: string; count: number; }

const COUNTRY_EN: Record<string, string> = {
  'japao': 'Japan', 'coreia-do-sul': 'South Korea', 'singapura': 'Singapore',
  'tailandia': 'Thailand', 'malasia': 'Malaysia', 'vietna': 'Vietnam',
  'filipinas': 'Philippines', 'paquistao': 'Pakistan', 'remoto-global': 'Remote',
  'india': 'India', 'china': 'China', 'indonesia': 'Indonesia',
  'hong-kong': 'Hong Kong', 'taiwan': 'Taiwan', 'sri-lanka': 'Sri Lanka',
  'bangladesh': 'Bangladesh', 'nepal': 'Nepal',
  'united-states': 'United States', 'united-kingdom': 'United Kingdom',
  'germany': 'Germany', 'france': 'France', 'spain': 'Spain', 'italy': 'Italy',
  'netherlands': 'Netherlands', 'poland': 'Poland', 'ireland': 'Ireland',
  'finland': 'Finland', 'portugal': 'Portugal', 'switzerland': 'Switzerland',
  'denmark': 'Denmark', 'norway': 'Norway', 'sweden': 'Sweden', 'belgium': 'Belgium',
  'austria': 'Austria', 'czech-republic': 'Czech Republic', 'romania': 'Romania',
  'hungary': 'Hungary', 'greece': 'Greece', 'bulgaria': 'Bulgaria', 'croatia': 'Croatia',
  'slovakia': 'Slovakia', 'slovenia': 'Slovenia', 'estonia': 'Estonia',
  'latvia': 'Latvia', 'lithuania': 'Lithuania', 'luxembourg': 'Luxembourg',
  'malta': 'Malta', 'cyprus': 'Cyprus', 'iceland': 'Iceland', 'serbia': 'Serbia',
  'ukraine': 'Ukraine', 'bosnia-and-herzegovina': 'Bosnia and Herzegovina',
  'montenegro': 'Montenegro', 'moldova': 'Moldova', 'albania': 'Albania',
  'north-macedonia': 'North Macedonia', 'georgia': 'Georgia',
};

const countriesArr = countriesData as unknown as CountryInfo[];

function getCountryEnglish(slug: string): string {
  return COUNTRY_EN[slug] || countriesArr.find(c => c.slug === slug)?.name || slug;
}

async function fetchJob(rc: string, cc: string, jobId: string) {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/data/country?file=${encodeURIComponent(rc + "_" + cc + ".json")}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.find((j: { id: number }) => String(j.id) === String(jobId)) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string; region: string; country: string; id: string }>;
}): Promise<Metadata> {
  const { lang: langCode, slug, region: rc, country: cc, id: jobId } = await params;
  const lang = langCode as Lang;
  const isPT = lang === "pt-br" || lang === "pt-pt";
  const pageUrl = `/${lang}/${slug}/${rc}/${cc}/${jobId}`;

  const job = await fetchJob(rc, cc, jobId);

  if (!job) {
    return {
      title: isPT ? "Vaga nao encontrada | NOSSY" : "Job Not Found | NOSSY",
      description: isPT
        ? "A vaga solicitada nao foi encontrada."
        : "The requested job listing was not found.",
      alternates: { canonical: pageUrl },
      robots: { index: false, follow: false },
    };
  }

  const countryEn = getCountryEnglish(cc);
  const countryLocal = getLocalizedCountryName(job.countryName || countryEn, lang);

  const fullDesc = job.description || `${job.title} at ${job.company} in ${job.location}`;
  const shortDesc = fullDesc.length > 160 ? fullDesc.slice(0, 157) + "..." : fullDesc;
  const ogDesc = fullDesc.length > 300 ? fullDesc.slice(0, 297) + "..." : fullDesc;

  const title = `${job.title} - ${job.company} | ${countryLocal} | NOSSY`;

  return {
    title,
    description: shortDesc,
    alternates: {
      canonical: pageUrl,
      languages: Object.fromEntries(
        LANGUAGES.map((l) => [
          l.code,
          `/${l.code}/${LANG_SLUGS[l.code]}/${rc}/${cc}/${jobId}`,
        ])
      ),
    },
    openGraph: {
      url: pageUrl,
      title,
      description: ogDesc,
      type: "article",
      siteName: "NOSSY",
      locale: lang === "pt-br" ? "pt_BR" : lang === "pt-pt" ? "pt_PT" : lang,
    },
    robots: { index: true, follow: true },
  };
}

export default function JobDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}

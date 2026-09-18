import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { REGIONS } from "@/lib/countries";
import { getRegionName, shouldHavePaywall } from "@/lib/shared";
import { getCountryNameTranslated } from "@/lib/country-names";
import { safeJsonLd } from "@/lib/jsonld";
import { scrubCompanyFromText } from "@/lib/paywall-mask";
import { findJobFast } from "@/lib/job-lookup";
import { findJobInPoolsSync } from "@/lib/remote-pool";
import { isCompetitorJob } from "@/lib/competitors";
import {
  formatJobLocationWithCountry,
  expandLocationNames,
} from "@/lib/location-names";
import type { Lang } from "@/lib/i18n";
import countriesData from "@/data/countries.json";
import { US_STATES_EN, CA_PROVINCES_EN } from "@/lib/location-names";

interface Job {
  id: number; title: string; company: string; companyUrl: string;
  location: string; country: string; countryName: string;
  salary: string; salaryMin: number | null; salaryMax: number | null;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  paywall: boolean; contactEmail: string;
}

// A busca da vaga usa o índice id->chunk gerado no build (gen-idmaps.mjs):
// em vez de varrer até 19 chunks sequencialmente, lê 1 mapa + 1 chunk.
// CATÁLOGO MUNDIAL: países sem arquivo próprio (ex. africa_angola) caem no
// pool remoto global — mesmo dado exibido pela listagem do país.
function findJob(region: string, country: string, jobId: string): Job | null {
  const local = findJobFast<Job>(`${region}_${country}`, jobId);
  if (local) return local;
  return findJobInPoolsSync(jobId) as Job | null;
}

const JOB_META_DESC: Record<string, (title: string, company: string, location: string, type: string, salary: string) => string> = {
  en: (t, c, l, tp, s) => `Apply for ${t} at ${c} in ${l}.${tp ? ' ' + tp + ' position.' : ''}${s ? ' Salary: ' + s + '.' : ''} Find more tech jobs on NOSSY.`,
  "pt-br": (t, c, l, tp, s) => `Candidate-se a ${t} na ${c} em ${l}.${tp ? ' Vaga ' + tp + '.' : ''}${s ? ' Salario: ' + s + '.' : ''} Veja mais vagas no NOSSY.`,
  "pt-pt": (t, c, l, tp, s) => `Candidate-se a ${t} na ${c} em ${l}.${tp ? ' Vaga ' + tp + '.' : ''}${s ? ' Salario: ' + s + '.' : ''} Veja mais vagas no NOSSY.`,
  es: (t, c, l, tp, s) => `Postula a ${t} en ${c} en ${l}.${tp ? ' Posicion ' + tp + '.' : ''}${s ? ' Salario: ' + s + '.' : ''} Encuentra mas empleos en NOSSY.`,
  fr: (t, c, l, tp, s) => `Postulez pour ${t} chez ${c} a ${l}.${tp ? ' Poste ' + tp + '.' : ''}${s ? ' Salaire : ' + s + '.' : ''} Trouvez plus d'offres sur NOSSY.`,
  de: (t, c, l, tp, s) => `Bewerben Sie sich auf ${t} bei ${c} in ${l}.${tp ? ' ' + tp + '-Position.' : ''}${s ? ' Gehalt: ' + s + '.' : ''} Mehr Jobs auf NOSSY.`,
  it: (t, c, l, tp, s) => `Candidati per ${t} presso ${c} a ${l}.${tp ? ' Posizione ' + tp + '.' : ''}${s ? ' Stipendio: ' + s + '.' : ''} Trova piu offerte su NOSSY.`,
  nl: (t, c, l, tp, s) => `Solliciteer voor ${t} bij ${c} in ${l}.${tp ? ' ' + tp + ' positie.' : ''}${s ? ' Salaris: ' + s + '.' : ''} Meer vacatures op NOSSY.`,
  pl: (t, c, l, tp, s) => `Aplikuj na ${t} w ${c} w ${l}.${tp ? ' Stanowisko ' + tp + '.' : ''}${s ? ' Wynagrodzenie: ' + s + '.' : ''} Wiecej ofert na NOSSY.`,
  ru: (t, c, l, tp, s) => `Откликнитесь на ${t} в ${c} в ${l}.${tp ? ' ' + tp + '.' : ''}${s ? ' Зарплата: ' + s + '.' : ''} Больше вакансий на NOSSY.`,
  zh: (t, c, l, tp, s) => `${t} - ${c}${l}科技职位 | NOSSY`,
  ja: (t, c, l, tp, s) => `${t} - ${c}${l}テック求人 | NOSSY`,
  ko: (t, c, l, tp, s) => `${t} - ${c}${l} 기술 채용 | NOSSY`,
  hi: (t, c, l, tp, s) => `${t} - ${c}${l} टेक नौकरी | NOSSY`,
  bn: (t, c, l, tp, s) => `${t} - ${c}${l} টেক চাকরি | NOSSY`,
  ar: (t, c, l, tp, s) => `${t} - ${c}${l} وظيفة تقنية | NOSSY`,
  tr: (t, c, l, tp, s) => `${t} - ${c}${l} teknoloji işi | NOSSY`,
  vi: (t, c, l, tp, s) => `${t} - ${c}${l} việc làm công nghệ | NOSSY`,
  th: (t, c, l, tp, s) => `${t} - ${c}${l} งานด้านเทคโนโลยี | NOSSY`,
  ur: (t, c, l, tp, s) => `${t} - ${c}${l} ٹیک نوکری | NOSSY`,
  tl: (t, c, l, tp, s) => `${t} - ${c}${l} tech job | NOSSY`,
  sw: (t, c, l, tp, s) => `${t} - ${c}${l} kazi ya teknolojia | NOSSY`,
};

const FALLBACK_JOB_DESC: Record<string, (countryName: string, regionName: string) => string> = {
  en: (c, r) => `Browse tech jobs in ${c}, ${r}. Find software engineering, data science, cloud and remote positions on NOSSY.`,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string; region: string; country: string; id: string }>;
}): Promise<Metadata> {
  const { lang: langCode, slug, region: rc, country: cc, id: jobId } = await params;
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const job = findJob(rc, cc, jobId);
  const countryInfo = (countriesData as any[]).find(c => c.slug === cc);
  const regionInfo = REGIONS.find(r => r.code === rc);

  // BLOQUEIO DE CONCORRENTES: portais de emprego não são indexados nem
  // anunciados no NOSSY (pedido do dono).
  if (job && isCompetitorJob(job)) {
    return {
      title: "Job not found | NOSSY",
      robots: { index: false, follow: false },
    };
  }

  const countryName = job?.countryName || countryInfo?.name || cc;
  const countryNameTranslated = getCountryNameTranslated(cc, lang, countryName);
  const regionName = getRegionName(lang, rc);

  // Premium 0220: o nome da empresa NÃO pode aparecer em <title>, meta
  // description ou Open Graph de vaga bloqueada — o Google indexaria e a
  // pessoa encontraria a empresa no buscador sem pagar. Crawlers nunca
  // têm cookie de desbloqueio, então a máscara aqui é incondicional.
  const jobLocked = job ? shouldHavePaywall(job).paywall : false;
  const metaCompany = job && jobLocked ? "Confidential" : (job?.company || "");

  // Requisito SEO do dono: o nome COMPLETO do país entra no <title>
  // (abreviação só na URL — ex. /eua/united-states — nunca no título).
  // Formato clássico de job boards: "Vaga - Empresa - País | NOSSY"
  // (sem preposição — gramática correta nos 22 idiomas).
  const title = job
    ? `${job.title} - ${metaCompany} - ${countryNameTranslated} | NOSSY`
    : `${countryNameTranslated} Jobs | NOSSY`;

  const descFn = JOB_META_DESC[lang] || JOB_META_DESC["en"];
  const fallbackFn = FALLBACK_JOB_DESC[lang] || FALLBACK_JOB_DESC["en"];
  const description = job
    ? descFn(job.title, metaCompany, job.location, job.type || '', job.salary || '')
    : fallbackFn(countryNameTranslated, regionName);

  const url = `https://nossy.pro/${langCode}/${slug}/${rc}/${cc}/${jobId}`;

  const alternates: Record<string, string> = { "x-default": `/en/jobs/${rc}/${cc}/${jobId}` };
  for (const l of LANGUAGES) {
    alternates[l.code] = `/${l.code}/${LANG_SLUGS[l.code]}/${rc}/${cc}/${jobId}`;
  }

  const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: url, languages: alternates },
    robots: { index: true, follow: true },
  };

  if (job) {
    metadata.openGraph = {
      type: "article",
      title: `${job.title} - ${metaCompany}`,
      description,
      url,
      siteName: "NOSSY",
      images: [{ url: "https://nossy.pro/og/og-default.png", width: 1200, height: 630, alt: job.title }],
    };
  }

  return metadata;
}

function JobPostingSchema({ job, url }: { job: Job; url: string }) {
  const paywalled = shouldHavePaywall(job).paywall;
  const countryFull = job.countryName || job.country;

  // Endereço estruturado com nomes COMPLETos (cidade / estado / país).
  // "Austin, TX" -> locality "Austin", region "Texas"; "Krakow, Poland"
  // -> locality "Krakow", country "Poland"; "USA" (sem cidade) -> só país.
  const locRaw = (job.location || "").trim();
  const remoteJob = (job.type || "").toLowerCase() === "remote" || (job.type || "").toLowerCase() === "remoto";
  const worldMatch = locRaw.match(/^(remote|remoto|remota)\s*[-–]\s*(worldwide|global|mundial)$/i);
  let address: Record<string, unknown>;
  if (worldMatch) {
    // Remoto mundial: sem endereço físico — apenas requisito de país aberto
    address = { "@type": "PostalAddress", addressCountry: countryFull };
  } else {
    const cityState = locRaw.match(/^(.*?),\s*([A-Z]{2})$/);
    const cityCountry = locRaw.match(/^(.*?),\s*([^,]+)$/);
    if (cityState && job.country === "united-states" && US_STATES_EN[cityState[2]]) {
      address = {
        "@type": "PostalAddress",
        addressLocality: cityState[1].trim(),
        addressRegion: US_STATES_EN[cityState[2]],
        addressCountry: countryFull,
      };
    } else if (cityState && job.country === "canada" && CA_PROVINCES_EN[cityState[2]]) {
      address = {
        "@type": "PostalAddress",
        addressLocality: cityState[1].trim(),
        addressRegion: CA_PROVINCES_EN[cityState[2]],
        addressCountry: countryFull,
      };
    } else if (cityCountry && cityCountry[2] && cityCountry[2].length > 3) {
      address = {
        "@type": "PostalAddress",
        addressLocality: cityCountry[1].trim(),
        addressCountry: countryFull,
      };
    } else {
      address = {
        "@type": "PostalAddress",
        addressLocality: locRaw || undefined,
        addressCountry: countryFull,
      };
    }
  }

  // Descrição com abreviações expandidas ("Austin, TX, USA" ->
  // "Austin, Texas, United States") e limpa para o Google Jobs.
  // PADRÃO 1874: vaga bloqueada não cita o nome da empresa na descrição
  // (nem no schema) — a empresa só aparece após o pagamento.
  const rawDesc = job.description || `Tech job: ${job.title}${paywalled ? "" : ` at ${job.company}`}`;
  const desc = paywalled
    ? scrubCompanyFromText(
        expandLocationNames(rawDesc, { countrySlug: job.country, countryName: job.countryName }),
        job.company
      )
    : expandLocationNames(rawDesc, {
        countrySlug: job.country,
        countryName: job.countryName,
      });

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: desc,
    identifier: { "@type": "PropertyValue", name: "NOSSY", value: String(job.id) },
    // Google Jobs exige datePosted — fallback para hoje quando o dado
    // original não traz data (vaga não sai do índice por campo vazio).
    datePosted: job.posted || new Date().toISOString().slice(0, 10),
    // Google recomenda validThrough — janela rolante de 90 dias a partir
    // de HOJE (se calculasse de job.posted, vagas antigas ficariam com
    // validThrough no passado e o Google as descartaria do índice).
    validThrough: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
    url,
    directApply: true,
    hiringOrganization: {
      "@type": "Organization",
      name: paywalled ? "Confidential" : job.company,
      sameAs: !paywalled ? (job.companyUrl || undefined) : undefined,
    },
    jobLocation: remoteJob
      ? undefined
      : { "@type": "Place", address },
    jobLocationType: remoteJob ? "TELECOMMUTE" : undefined,
    employmentType: { "Remote": "FULL_TIME", "Contract": "CONTRACTOR", "Part-time": "PART_TIME", "Internship": "INTERN" }[job.type] || "FULL_TIME",
    applicantLocationRequirements: remoteJob
      ? { "@type": "Country", name: countryFull }
      : undefined,
  };

  if (job.salaryMin || job.salaryMax) {
    (schema as Record<string, unknown>).baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salaryCurrency || "USD",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salaryMin,
        maxValue: job.salaryMax,
        unitText: job.salaryPeriod || "YEAR",
      },
    };
  }

  if (job.sector) {
    (schema as Record<string, unknown>).industry = job.sector;
  }

  // Remove chaves com valor undefined para JSON limpo
  const cleaned = JSON.parse(safeJsonLd(schema)) as Record<string, unknown>;
  for (const k of Object.keys(cleaned)) {
    if (cleaned[k] === undefined) delete cleaned[k];
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(cleaned) }} />;
}

export default async function JobDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string; slug: string; region: string; country: string; id: string }>;
}) {
  const { lang: langCode, slug, region: rc, country: cc, id: jobId } = await params;
  const job = findJob(rc, cc, jobId);
  const url = `https://nossy.pro/${langCode}/${slug}/${rc}/${cc}/${jobId}`;

  // Portais concorrentes não recebem JSON-LD de vaga (JobPosting/Google Jobs)
  const blocked = job && isCompetitorJob(job);

  // BreadcrumbList (rich result do Google): Home > Região > País > Vaga —
  // nomes traduzidos no idioma da URL (requisito SEO do dono, top 10 global).
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const homeUrl = `https://nossy.pro/${langCode}/${slug}`;
  const regionUrl = `${homeUrl}/${rc}`;
  const countryUrl = `${regionUrl}/${cc}`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "NOSSY", item: "https://nossy.pro/" },
      { "@type": "ListItem", position: 2, name: getRegionName(lang, rc), item: regionUrl },
      { "@type": "ListItem", position: 3, name: getCountryNameTranslated(cc, lang, job?.countryName || cc), item: countryUrl },
      { "@type": "ListItem", position: 4, name: job?.title || jobId, item: url },
    ],
  };

  return (
    <>
      {job && !blocked && <JobPostingSchema job={job} url={url} />}
      {!blocked && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumb) }} />}
      {children}
    </>
  );
}

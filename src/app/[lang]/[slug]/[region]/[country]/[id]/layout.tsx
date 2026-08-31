import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { REGIONS } from "@/lib/countries";
import { getRegionName, shouldHavePaywall } from "@/lib/shared";
import { getCountryNameTranslated } from "@/lib/country-names";
import type { Lang } from "@/lib/i18n";
import countriesData from "@/data/countries.json";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface Job {
  id: number; title: string; company: string; companyUrl: string;
  location: string; country: string; countryName: string;
  salary: string; salaryMin: number | null; salaryMax: number | null;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  paywall: boolean; contactEmail: string;
}

function findJob(region: string, country: string, jobId: string): Job | null {
  const dataDir = join(process.cwd(), "public", "data");
  const baseName = `${region}_${country}`;

  // Try direct file first (small countries)
  const directPath = join(dataDir, `${baseName}.json`);
  if (existsSync(directPath)) {
    try {
      const raw = readFileSync(directPath, "utf-8");
      const jobs: Job[] = JSON.parse(raw);
      return jobs.find(j => String(j.id) === String(jobId)) || null;
    } catch { /* continue to chunked */ }
  }

  // Try split index + chunks (large countries like USA)
  const indexPath = join(dataDir, `${baseName}_index.json`);
  if (existsSync(indexPath)) {
    try {
      const idxRaw = readFileSync(indexPath, "utf-8");
      const idx = JSON.parse(idxRaw);
      for (const chunkFile of (idx.chunks || [])) {
        const chunkPath = join(dataDir, chunkFile);
        if (!existsSync(chunkPath)) continue;
        try {
          const chunkRaw = readFileSync(chunkPath, "utf-8");
          const chunkJobs: Job[] = JSON.parse(chunkRaw);
          const job = chunkJobs.find(j => String(j.id) === String(jobId));
          if (job) return job;
        } catch { /* continue */ }
      }
    } catch { /* ignore */ }
  }

  return null;
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

  const countryName = job?.countryName || countryInfo?.name || cc;
  const countryNameTranslated = getCountryNameTranslated(cc, lang, countryName);
  const regionName = getRegionName(lang, rc);
  const title = job ? `${job.title} - ${job.company} | NOSSY` : `${countryNameTranslated} Jobs | NOSSY`;

  const descFn = JOB_META_DESC[lang] || JOB_META_DESC["en"];
  const fallbackFn = FALLBACK_JOB_DESC[lang] || FALLBACK_JOB_DESC["en"];
  const description = job
    ? descFn(job.title, job.company, job.location, job.type || '', job.salary || '')
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
      title: `${job.title} - ${job.company}`,
      description,
      url,
      siteName: "NOSSY",
      images: [{ url: "https://nossy.pro/og/og-default.png", width: 1200, height: 630, alt: job.title }],
    };
  }

  return metadata;
}

function JobPostingSchema({ job, url }: { job: Job; url: string }) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || `Tech job: ${job.title} at ${job.company}`,
    identifier: { "@type": "PropertyValue", name: "NOSSY", value: String(job.id) },
    datePosted: job.posted,
    url,
    hiringOrganization: {
      "@type": "Organization",
      name: shouldHavePaywall(job).paywall ? "Confidential" : job.company,
      sameAs: !shouldHavePaywall(job).paywall ? (job.companyUrl || undefined) : undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: job.country,
      },
    },
    employmentType: { "Remote": "FULL_TIME", "Contract": "CONTRACTOR", "Part-time": "PART_TIME", "Internship": "INTERN" }[job.type] || "FULL_TIME",
    applicantLocationRequirements: { "@type": "Country", name: job.countryName || job.country },
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

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
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

  return (
    <>
      {job && <JobPostingSchema job={job} url={url} />}
      {children}
    </>
  );
}

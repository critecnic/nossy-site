import { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import { REGIONS } from "@/lib/countries";
import type { Lang } from "@/lib/i18n";
import countriesData from "@/data/countries.json";
import { readFileSync } from "fs";
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
  try {
    const filePath = join(process.cwd(), "public", "data", `${region}_${country}.json`);
    const raw = readFileSync(filePath, "utf-8");
    const jobs: Job[] = JSON.parse(raw);
    return jobs.find(j => String(j.id) === String(jobId)) || null;
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
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const job = findJob(rc, cc, jobId);
  const countryInfo = (countriesData as any[]).find(c => c.slug === cc);
  const regionInfo = REGIONS.find(r => r.code === rc);

  const countryName = job?.countryName || countryInfo?.name || cc;
  const regionName = regionInfo?.name || rc;
  const title = job ? `${job.title} - ${job.company} | NOSSY` : `${countryName} Jobs | NOSSY`;
  const description = job
    ? `Apply for ${job.title} at ${job.company} in ${job.location}. ${job.type ? job.type + ' position.' : ''} ${job.salary ? 'Salary: ' + job.salary + '.' : ''} Find more tech jobs on NOSSY.`
    : `Browse tech jobs in ${countryName}, ${regionName}. Find software engineering, data science, cloud and remote positions on NOSSY.`;

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
      images: [{ url: "/og/og-default.png", width: 1200, height: 630, alt: job.title }],
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
      name: job.paywall ? "Confidential" : job.company,
      sameAs: job.companyUrl || undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: job.country,
      },
    },
    employmentType: job.type === "Remote" ? "FULL_TIME" : "FULL_TIME",
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

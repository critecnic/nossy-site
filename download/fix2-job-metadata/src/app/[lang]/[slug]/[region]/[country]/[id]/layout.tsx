import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { LANGUAGES, LANG_SLUGS } from '@/lib/i18n';
import countriesData from '@/data/countries.json';
import { getLocalizedCountryName } from '@/lib/shared';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  country: string;
  countryName: string;
  salary: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: string;
  description: string;
  sector: string;
  posted: string;
  type: string;
  paywall: boolean;
  contactEmail: string;
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    lang: string;
    slug: string;
    region: string;
    country: string;
    id: string;
  }>;
}

function findJob(region: string, country: string, id: string): Job | null {
  const dataDir = path.resolve(process.cwd(), 'public', 'data');
  const baseName = `${region}_${country}`;

  // Try the single file first
  const singleFile = path.join(dataDir, `${baseName}.json`);

  if (fs.existsSync(singleFile)) {
    try {
      const raw = fs.readFileSync(singleFile, 'utf-8');
      const jobs: Job[] = JSON.parse(raw);
      const found = jobs.find((j) => String(j.id) === String(id));
      if (found) return found;
    } catch {
      // Continue to split files
    }
  }

  // Try split files (region_country-1.json, region_country-2.json, etc.)
  for (let i = 1; i <= 10; i++) {
    const splitFile = path.join(dataDir, `${baseName}-${i}.json`);
    if (!fs.existsSync(splitFile)) continue;
    try {
      const raw = fs.readFileSync(splitFile, 'utf-8');
      const jobs: Job[] = JSON.parse(raw);
      const found = jobs.find((j) => String(j.id) === String(id));
      if (found) return found;
    } catch {
      // Continue searching
    }
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    lang: string;
    slug: string;
    region: string;
    country: string;
    id: string;
  }>;
}): Promise<Metadata> {
  const { lang, slug, region, country, id } = await params;

  const langConfig = LANGUAGES.find((l) => l.code === lang);
  const langName = langConfig ? langConfig.name : lang;
  const localizedCountry = getLocalizedCountryName(country, lang);

  const fallbackTitle = `${localizedCountry} Jobs | NOSSY`;
  const fallbackDescription = `Browse available jobs in ${localizedCountry} on NOSSY. Find your next opportunity.`;
  const canonicalUrl = `https://nossy.pro/${lang}/${slug}/${region}/${country}/${id}`;

  // Build alternate language URLs
  const alternateLanguages: Record<string, string> = {};
  for (const language of LANGUAGES) {
    alternateLanguages[language.code] = `https://nossy.pro/${language.code}/${slug}/${region}/${country}/${id}`;
  }

  // Try to find the job
  let job: Job | null = null;
  try {
    job = findJob(region, country, id);
  } catch {
    job = null;
  }

  if (!job) {
    // Job not found — return fallback metadata (do NOT call notFound())
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      alternates: {
        canonical: canonicalUrl,
        languages: alternateLanguages,
      },
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        url: canonicalUrl,
        siteName: 'NOSSY',
        type: 'article',
        locale: lang,
      },
      twitter: {
        card: 'summary_large_image',
        title: fallbackTitle,
        description: fallbackDescription,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  // Job found — build rich metadata
  const title = `${job.title} at ${job.company} | NOSSY`;
  const description =
    job.description.length > 155
      ? job.description.substring(0, 152) + '...'
      : job.description;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: alternateLanguages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'NOSSY',
      type: 'article',
      locale: lang,
      publishedTime: job.posted,
      modifiedTime: job.posted,
      authors: [job.company],
      tags: [job.sector, job.type, job.location].filter(Boolean),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function JobLayout({ children, params }: LayoutProps) {
  const { lang, slug, region, country, id } = await params;
  return <>{children}</>;
}

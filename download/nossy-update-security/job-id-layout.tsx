import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LANGUAGES, LANG_SLUGS } from "@/lib/i18n";
import countriesData from "@/data/countries.json";
import { getLocalizedCountryName } from "@/lib/shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  countryName: string;
  salary: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  description: string;
  sector: string;
  posted: string;
  type: string;
  paywall: boolean;
  contactEmail?: string;
}

interface LayoutParams {
  lang: string;
  slug: string;
  region: string;
  country: string;
  id: string;
}

// ---------------------------------------------------------------------------
// Helper: read and merge split country JSON files
// ---------------------------------------------------------------------------

function readCountryJobs(region: string, country: string): Job[] {
  const dataDir = path.join(process.cwd(), "public", "data");
  const baseName = `${region}_${country}`;

  // Try single file first
  const singleFile = path.join(dataDir, `${baseName}.json`);
  if (fs.existsSync(singleFile)) {
    const raw = fs.readFileSync(singleFile, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  // Try split files
  const jobs: Job[] = [];
  let i = 1;
  while (true) {
    const splitFile = path.join(dataDir, `${baseName}-${i}.json`);
    if (!fs.existsSync(splitFile)) break;
    const raw = fs.readFileSync(splitFile, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      jobs.push(...parsed);
    } else {
      jobs.push(parsed);
    }
    i++;
  }

  return jobs;
}

// ---------------------------------------------------------------------------
// Helper: strip HTML tags and truncate
// ---------------------------------------------------------------------------

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "…";
}

// ---------------------------------------------------------------------------
// Helper: build the correct slug for a language
// ---------------------------------------------------------------------------

function getSlugForLang(lang: string): string {
  // LANG_SLUGS maps lang code -> slug (e.g. "en" -> "jobs", "pt" -> "empregos")
  return (LANG_SLUGS as Record<string, string>)[lang] || "jobs";
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<LayoutParams>;
}): Promise<Metadata> {
  const { lang, slug, region, country, id } = await params;

  // Default fallback metadata
  const defaultTitle = "Job Listing | NOSSY";
  const defaultDescription = "Browse job listings on NOSSY.";
  const baseUrl = "https://nossy.pro";
  const canonicalPath = `/${lang}/${slug}/${region}/${country}/${id}`;

  // Build alternates for all languages
  const languages: Record<string, string> = {};
  for (const code of LANGUAGES) {
    const localizedSlug = getSlugForLang(code);
    languages[code] = `${baseUrl}/${code}/${localizedSlug}/${region}/${country}/${id}`;
  }

  // Default metadata (used if job is not found)
  const fallbackMetadata: Metadata = {
    title: defaultTitle,
    description: defaultDescription,
    alternates: {
      canonical: `${baseUrl}${canonicalPath}`,
      languages,
    },
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      url: `${baseUrl}${canonicalPath}`,
      siteName: "NOSSY",
      type: "website",
      locale: lang,
    },
    robots: {
      index: true,
      follow: true,
    },
  };

  // Validate lang is a known language
  if (!LANGUAGES.some(l => l.code === lang)) {
    return fallbackMetadata;
  }

  try {
    const jobs = readCountryJobs(region, country);
    const job = jobs.find((j) => String(j.id) === String(id));

    if (!job) {
      return fallbackMetadata;
    }

    // Build metadata from job data
    const title = `${job.title} at ${job.company} | NOSSY`;
    const cleanDescription = stripHtml(job.description || "");
    const description = truncate(
      cleanDescription || `Find ${job.title} jobs at ${job.company} on NOSSY.`,
      160
    );

    const localizedCountryName = getLocalizedCountryName(country, lang);
    const locationText = job.location
      ? `${job.location}, ${localizedCountryName || job.countryName || country}`
      : localizedCountryName || job.countryName || country;

    return {
      title,
      description,
      alternates: {
        canonical: `${baseUrl}${canonicalPath}`,
        languages,
      },
      openGraph: {
        title,
        description,
        url: `${baseUrl}${canonicalPath}`,
        siteName: "NOSSY",
        type: "article",
        locale: lang,
        // Include some job details in OG for richer previews
        ...(job.sector && {
          "article:section": job.sector,
        }),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      robots: {
        index: true,
        follow: true,
      },
      // Additional metadata
      ...(job.sector && {
        keywords: [job.sector, job.title, job.company, locationText],
      }),
    };
  } catch (error) {
    console.error(
      `[job-id-layout] Error generating metadata for /${canonicalPath}:`,
      error
    );
    return fallbackMetadata;
  }
}

// ---------------------------------------------------------------------------
// Layout component
// ---------------------------------------------------------------------------

export default function JobIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

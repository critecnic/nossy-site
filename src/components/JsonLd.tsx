"use client";

import { COUNTRIES, type CountryConfig } from "@/lib/countries";

interface JobJsonLdProps {
  title: string;
  description: string;
  company: string;
  companyUrl: string;
  location: string;
  country: CountryConfig;
  salary: { min: number; max: number; currency: string; period?: string };
  type: string;
  sector: string;
  posted: string;
  datePosted?: string;
  jobId?: number;
  remote?: boolean;
}

const CURRENCY_PERIOD: Record<string, string> = {
  INR: "YEAR", JPY: "YEAR", KRW: "YEAR", BRL: "MONTH", MXN: "MONTH",
  NGN: "MONTH", TRY: "MONTH", PHP: "MONTH", IDR: "MONTH",
  PKR: "MONTH", BDT: "MONTH", KES: "MONTH", TZS: "MONTH",
  UGX: "MONTH", EGP: "MONTH", MAD: "MONTH", SAR: "MONTH",
  AED: "MONTH", USD: "YEAR", GBP: "YEAR", EUR: "YEAR",
  AUD: "YEAR", CAD: "YEAR", CNY: "YEAR",
};

function parsePosted(p: string): number {
  if (p.includes("hour")) return 3600000;
  if (p.includes("day")) { const n = parseInt(p) || 1; return n * 86400000; }
  if (p.includes("week")) return 7 * 86400000;
  if (p.includes("month")) return 30 * 86400000;
  return 86400000;
}

function mapEmploymentType(t: string): string {
  if (t === "Full-time" || t === "FULL_TIME") return "FULL_TIME";
  if (t === "Part-time" || t === "PART_TIME") return "PART_TIME";
  if (t === "Contract" || t === "CONTRACTOR") return "CONTRACTOR";
  if (t === "Freelance") return "CONTRACTOR";
  return "FULL_TIME";
}

export function JobJsonLd({
  title, description, company, companyUrl, location, country,
  salary, type, sector, posted, datePosted, jobId, remote
}: JobJsonLdProps) {
  const locParts = location.split(',').map(s => s.trim());
  const isRemote = remote || title.toLowerCase().includes('remote') || location.toLowerCase().includes('remote');
  const period = salary.period || CURRENCY_PERIOD[salary.currency] || "YEAR";

  const schema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "@id": `https://ww.jobs/job/${jobId || 0}`,
    title,
    description: `<p>${description}</p><p>Apply now on W-W World of Work.</p>`,
    datePosted: datePosted || new Date(Date.now() - parsePosted(posted)).toISOString().split('T')[0],
    validThrough: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    employmentType: mapEmploymentType(type),
    hiringOrganization: {
      "@type": "Organization",
      name: company,
      sameAs: companyUrl,
      logo: `${companyUrl}/logo.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: locParts[0] || location,
        addressRegion: locParts[1] || '',
        addressCountry: country.code.toUpperCase(),
      },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: salary.currency,
      value: {
        "@type": "QuantitativeValue",
        minValue: salary.min,
        maxValue: salary.max,
        unitText: period,
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: country.name,
    },
    directApply: true,
    ...(isRemote ? { jobLocationType: "TELECOMMUTE" } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Organization schema for the homepage
export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "W-W World of Work - All Countries",
    description: "Browse jobs across 20 countries worldwide",
    numberOfItems: COUNTRIES.length,
    itemListElement: COUNTRIES.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Jobs in ${c.name}`,
      url: `https://ww.jobs/en/jobs/${c.code}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function CountryListingJsonLd({ countryCode, countryName, jobCount, jobs }: {
  countryCode: string;
  countryName: string;
  jobCount: number;
  jobs?: Array<{ id: number; title: string; company: string; location: string; salary: string; salaryCurrency: string; type: string; posted: string; description: string; sector: string }>;
}) {
  const country = COUNTRIES.find(c => c.code === countryCode);
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Jobs in ${countryName} - W-W World of Work`,
    description: `Browse ${jobCount}+ job vacancies in ${countryName}. Top companies hiring now.`,
    url: `https://ww.jobs/en/jobs/${countryCode}`,
    about: { "@type": "Thing", name: `${countryName} Jobs` },
    mainEntity: {
      "@type": "ItemList",
      name: `Top Jobs in ${countryName}`,
      numberOfItems: jobCount,
      itemListElement: jobs ? jobs.map((job, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "JobPosting",
          title: job.title,
          description: job.description,
          datePosted: new Date(Date.now() - parsePosted(job.posted)).toISOString().split('T')[0],
          validThrough: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
          employmentType: mapEmploymentType(job.type),
          hiringOrganization: { "@type": "Organization", name: job.company },
          jobLocation: {
            "@type": "Place",
            address: { "@type": "PostalAddress", addressLocality: job.location, addressCountry: country?.code.toUpperCase() || countryCode.toUpperCase() },
          },
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: job.salaryCurrency,
            value: { "@type": "QuantitativeValue", unitText: CURRENCY_PERIOD[job.salaryCurrency] || "YEAR" },
          },
          applicantLocationRequirements: { "@type": "Country", name: country?.name || countryName },
        },
      })) : [],
    },
    isPartOf: { "@type": "WebSite", name: "W-W World of Work", url: "https://ww.jobs" },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

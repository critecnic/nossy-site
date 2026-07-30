"use client";

import { COUNTRIES, type CountryConfig } from "@/lib/countries";

interface JobJsonLdProps {
  title: string;
  description: string;
  company: string;
  companyUrl: string;
  location: string;
  country: CountryConfig;
  salary: { min: number; max: number; currency: string; };
  type: string;
  sector: string;
  posted: string;
  datePosted?: string;
  jobId?: number;
}

export function JobJsonLd({
  title, description, company, companyUrl, location, country,
  salary, type, sector, posted, datePosted, jobId
}: JobJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "@id": `https://ww.jobs/job/${jobId || 0}`,
    title,
    description: `${description} Apply now on W-W World of Work.`,
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
        addressLocality: location.split(',')[0]?.trim() || location,
        addressRegion: location.split(',')[1]?.trim() || '',
        addressCountry: country.code.toUpperCase(),
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: country.lat,
        longitude: country.lng,
      },
    },
    countryRequirement: {
      "@type": "CountryRequirement",
      name: country.name,
    },
    employmentType: type === "Full-time" ? "FULL_TIME"
      : type === "Part-time" ? "PART_TIME"
      : type === "Contract" ? "CONTRACTOR"
      : "FULL_TIME",
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: salary.currency,
      value: {
        "@type": "QuantitativeValue",
        minValue: salary.min,
        maxValue: salary.max,
        unitText: salary.currency === 'INR' || salary.currency === 'JPY' || salary.currency === 'KRW' || salary.currency === 'BRL' || salary.currency === 'MXN' || salary.currency === 'IDR' || salary.currency === 'NGN' || salary.currency === 'TRY' ? "YEAR" : "YEAR",
      },
    },
    industry: sector,
    occupationalCategory: sector,
    datePosted: datePosted || new Date(Date.now() - parsePosted(posted)).toISOString().split('T')[0],
    validThrough: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    applicantLocationRequirements: {
      "@type": "CountryRequirement",
      name: country.name,
    },
    directApply: true,
    identifier: {
      "@type": "PropertyValue",
      name: "W-W",
      value: `ww-${jobId || 0}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function parsePosted(p: string): number {
  if (p.includes("hour")) return 3600000;
  if (p.includes("day")) {
    const n = parseInt(p) || 1;
    return n * 86400000;
  }
  if (p.includes("week")) return 7 * 86400000;
  if (p.includes("month")) return 30 * 86400000;
  return 86400000;
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
      url: `https://ww.jobs/${c.code}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Country page JSON-LD with all 8 jobs as ItemList
export function CountryListingJsonLd({ countryCode, countryName, jobCount, jobs }: {
  countryCode: string;
  countryName: string;
  jobCount: number;
  jobs?: Array<{ id: number; title: string; company: string; location: string; }>; 
}) {
  const country = COUNTRIES.find(c => c.code === countryCode);
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Jobs in ${countryName} - W-W World of Work`,
    description: `Browse ${jobCount}+ job vacancies in ${countryName}. Top companies hiring now.`,
    url: `https://ww.jobs/${countryCode}`,
    about: {
      "@type": "Thing",
      name: `${countryName} Jobs`,
    },
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
          hiringOrganization: {
            "@type": "Organization",
            name: job.company,
          },
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: job.location,
              addressCountry: country?.code.toUpperCase() || countryCode.toUpperCase(),
            },
          },
        },
      })) : [],
    },
    isPartOf: {
      "@type": "WebSite",
      name: "W-W World of Work",
      url: "https://ww.jobs",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

"use client";

import { REGIONS, type RegionConfig } from "@/lib/countries";

// Organization + WebSite schema for homepage
export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Work Versaly - Tech Jobs in 3 Regions",
    description: "Browse 45,039+ tech jobs across 3 major regions: Europa, Asia, and EUA",
    numberOfItems: REGIONS.length,
    itemListElement: REGIONS.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Tech Jobs in ${r.name}`,
      url: `https://workversely.com/en/jobs/${r.code}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function JobJsonLd({ title, description, company, companyUrl, location, salary, type, posted }: {
  title: string; description: string; company: string; companyUrl: string;
  location: string; salary: { min: number; max: number; currency: string; period?: string };
  type: string; posted: string;
  country?: RegionConfig;
}) {
  const period = salary.period || "YEAR";
  const schema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title,
    description: `<p>${description}</p><p>Apply now on Work Versaly. Browse thousands of tech job vacancies across 3 major regions.</p>`,
    datePosted: posted,
    validThrough: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    employmentType: "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: company,
      sameAs: companyUrl,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: location,
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
    directApply: true,
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
  jobs?: Array<{ id: number; title: string; company: string; location: string; salary: string; salaryCurrency: string; type: string; posted: string; description: string; sector: string; salaryMin?: number; salaryMax?: number }>;
}) {
  const region = REGIONS.find(r => r.code === countryCode);
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Jobs in ${countryName} - Work Versaly`,
    description: `Browse ${jobCount}+ tech job vacancies in ${countryName}. Top companies hiring now in Software Engineering, Data Science, Cloud & more.`,
    url: `https://workversely.com/en/jobs/${countryCode}`,
    about: { "@type": "Thing", name: `${countryName} Jobs` },
    mainEntity: {
      "@type": "ItemList",
      name: `Top Jobs in ${countryName}`,
      numberOfItems: jobCount,
      itemListElement: jobs ? jobs.slice(0, 10).map((job, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "JobPosting",
          title: job.title,
          description: job.description,
          datePosted: job.posted,
          employmentType: "FULL_TIME",
          hiringOrganization: { "@type": "Organization", name: job.company },
          jobLocation: {
            "@type": "Place",
            address: { "@type": "PostalAddress", addressLocality: job.location },
          },
        },
      })) : [],
    },
    isPartOf: { "@type": "WebSite", name: "Work Versaly", url: "https://workversely.com" },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

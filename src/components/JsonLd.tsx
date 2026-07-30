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
}

export function JobJsonLd({
  title, description, company, companyUrl, location, country,
  salary, type, sector, posted, datePosted
}: JobJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
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
        addressCountry: country.code.toUpperCase(),
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
        unitText: "YEAR",
      },
    },
    industry: sector,
    datePosted: datePosted || new Date(Date.now() - parsePosted(posted)).toISOString().split('T')[0],
    applicantLocationRequirements: {
      "@type": "CountryRequirement",
      name: country.name,
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
    "@type": "WebSite",
    name: "W-W World of Work",
    url: "https://ww.jobs",
    description: "Global job platform connecting talent with opportunities in 20+ countries",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://ww.jobs/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Multi-country listing schema
export function CountryListingJsonLd({ countryCode, countryName, jobCount }: {
  countryCode: string;
  countryName: string;
  jobCount: number;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Jobs in ${countryName}`,
    numberOfItems: jobCount,
    itemListElement: {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "WebPage",
        name: `${countryName} Jobs - W-W`,
        url: `https://ww.jobs/${countryCode}`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

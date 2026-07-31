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
  educationRequirements?: string;
  experienceRequirements?: string;
}

const CURRENCY_PERIOD: Record<string, string> = {
  INR: "YEAR", JPY: "YEAR", KRW: "YEAR", BRL: "MONTH", MXN: "MONTH",
  NGN: "MONTH", TRY: "MONTH", PHP: "MONTH", IDR: "MONTH",
  PKR: "MONTH", BDT: "MONTH", KES: "MONTH", TZS: "MONTH",
  UGX: "MONTH", EGP: "MONTH", MAD: "MONTH", SAR: "MONTH",
  AED: "MONTH", USD: "YEAR", GBP: "YEAR", EUR: "YEAR",
  AUD: "YEAR", CAD: "YEAR", CNY: "YEAR", ZAR: "YEAR",
  GHS: "MONTH", COP: "MONTH",
};

const SECTOR_EDUCATION: Record<string, string> = {
  "Technology": "Bachelor's degree in Computer Science, Software Engineering or related field",
  "Data Science": "Bachelor's degree in Statistics, Mathematics, Computer Science or related field",
  "Finance": "Bachelor's degree in Finance, Accounting, Economics or related field",
  "Marketing": "Bachelor's degree in Marketing, Business Administration or related field",
  "Design": "Bachelor's degree in Design, Visual Arts, HCI or related field",
  "Sales": "Bachelor's degree in Business, Marketing or related field",
  "Management": "Bachelor's or Master's degree in Business Administration or related field",
  "Healthcare": "Bachelor's degree in Nursing, Medicine or related health science",
  "Engineering": "Bachelor's degree in Engineering (Civil, Mechanical, Electrical or related)",
  "Education": "Bachelor's degree in Education or relevant subject area",
  "Legal": "Bachelor's degree in Law (LLB) or equivalent",
  "HR": "Bachelor's degree in Human Resources, Business Administration or related field",
  "Logistics": "Bachelor's degree in Supply Chain, Logistics or Business Administration",
  "DevOps": "Bachelor's degree in Computer Science, IT or related field",
};

const SECTOR_EXPERIENCE: Record<string, string> = {
  "Technology": "3-5 years of professional experience in software development",
  "Data Science": "2-4 years of experience in data analysis, statistics or machine learning",
  "Finance": "3-5 years of experience in financial accounting or auditing",
  "Marketing": "3-5 years of experience in digital marketing and campaign management",
  "Design": "2-4 years of experience in UX/UI design with a strong portfolio",
  "Sales": "2-5 years of experience in B2B or B2C sales with proven track record",
  "Management": "5-8 years of experience with at least 3 years in a leadership role",
  "Healthcare": "1-3 years of clinical experience with valid professional license",
  "Engineering": "3-7 years of experience in engineering design and project management",
  "Education": "2-5 years of teaching or educational administration experience",
  "Legal": "3-5 years of experience in legal practice or corporate law",
  "HR": "2-5 years of experience in human resources management",
  "Logistics": "3-5 years of experience in supply chain or logistics operations",
  "DevOps": "2-4 years of experience in DevOps, SRE or cloud infrastructure",
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
  salary, type, sector, posted, datePosted, jobId, remote,
  educationRequirements, experienceRequirements,
}: JobJsonLdProps) {
  const locParts = location.split(',').map(s => s.trim());
  const isRemote = remote || title.toLowerCase().includes('remote') || location.toLowerCase().includes('remote');
  const period = salary.period || CURRENCY_PERIOD[salary.currency] || "YEAR";

  const schema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "@id": `https://ww.jobs/job/${jobId || 0}`,
    title,
    description: `<p>${description}</p><p>Apply now on W-W World of Work. Browse thousands of job vacancies across emerging markets.</p>`,
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
    ...(educationRequirements || SECTOR_EDUCATION[sector] ? {
      educationRequirements: educationRequirements || SECTOR_EDUCATION[sector]
    } : {}),
    ...(experienceRequirements || SECTOR_EXPERIENCE[sector] ? {
      experienceRequirements: {
        "@type": "OccupationalExperienceRequirements",
        monthsOfExperience: sector === "Management" ? 60 : sector === "Healthcare" ? 12 : 36,
      },
      description: experienceRequirements || SECTOR_EXPERIENCE[sector],
    } : {}),
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

// Organization + WebSite schema for homepage
export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "W-W World of Work - Jobs in 12 Countries",
    description: "Browse jobs across 12 emerging market countries worldwide",
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
  jobs?: Array<{ id: number; title: string; company: string; location: string; salary: string; salaryCurrency: string; type: string; posted: string; description: string; sector: string; salaryMin?: number; salaryMax?: number }>;
}) {
  const country = COUNTRIES.find(c => c.code === countryCode);
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Jobs in ${countryName} - W-W World of Work`,
    description: `Browse ${jobCount}+ job vacancies in ${countryName}. Top companies hiring now in Technology, Finance, Healthcare and more.`,
    url: `https://ww.jobs/en/jobs/${countryCode}`,
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
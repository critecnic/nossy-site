import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

interface RegionData {
  total: number;
  categories: { name: string; count: number; avgSalary: number; requirements: string }[];
  countries: Record<string, number>;
  jobs: Job[];
}

interface Job {
  id: number;
  title: string;
  company: string;
  companyUrl: string;
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
  contactEmail: string;
  paywall: boolean;
  regiao: string;
}

interface IndexData {
  total: number;
  regions: Record<string, { total: number; categories: number; countries: number }>;
  allCategories: string[];
}

// In-memory cache for loaded region data
const regionCache = new Map<string, RegionData>();
let indexCache: IndexData | null = null;

function loadRegionData(region: string): RegionData {
  const normalized = region.toLowerCase();
  const cached = regionCache.get(normalized);
  if (cached) return cached;

  const fileMap: Record<string, string> = {
    europa: "jobs_europa.json",
    asia: "jobs_asia.json",
    eua: "jobs_eua.json",
  };

  const fileName = fileMap[normalized];
  if (!fileName) return { total: 0, categories: [], countries: {}, jobs: [] };

  const raw = fs.readFileSync(path.join(DATA_DIR, fileName), "utf-8");
  const data: RegionData = JSON.parse(raw);
  regionCache.set(normalized, data);
  return data;
}

function loadIndex(): IndexData {
  if (indexCache) return indexCache;
  const raw = fs.readFileSync(path.join(DATA_DIR, "jobs_index.json"), "utf-8");
  indexCache = JSON.parse(raw);
  return indexCache!;
}

function formatSalary(min: number, max: number, currency: string, period: string): string {
  const symbols: Record<string, string> = {
    EUR: "€", USD: "$", GBP: "£", BRL: "R$", INR: "₹",
    JPY: "¥", CNY: "¥", SGD: "S$", KRW: "₩",
  };
  const sym = symbols[currency] || currency;
  const fmtMin = Math.round(min).toLocaleString();
  const fmtMax = Math.round(max).toLocaleString();
  if (period === "year") return `${sym} ${fmtMin} - ${fmtMax}/yr`;
  if (period === "month") return `${sym} ${fmtMin} - ${fmtMax}/mo`;
  return `${sym} ${fmtMin} - ${fmtMax}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") || "";
  const country = searchParams.get("country") || "";
  const category = searchParams.get("category") || "";
  const type = searchParams.get("type") || "";
  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "18", 10)));

  const index = loadIndex();

  // Determine which regions to load
  const regionsToLoad = region
    ? [region]
    : ["europa", "asia", "eua"];

  // Load and filter jobs
  let allFilteredJobs: Job[] = [];
  let mergedCountries: Record<string, number> = {};
  let mergedCategories: { name: string; count: number; avgSalary: number; requirements: string }[] = [];

  // Category count aggregation
  const catCounts: Record<string, { count: number; salarySum: number; requirements: string }> = {};

  for (const reg of regionsToLoad) {
    const data = loadRegionData(reg);

    // Merge countries
    for (const [cName, cCount] of Object.entries(data.countries)) {
      mergedCountries[cName] = (mergedCountries[cName] || 0) + cCount;
    }

    // Merge categories
    for (const cat of data.categories) {
      if (!catCounts[cat.name]) {
        catCounts[cat.name] = { count: 0, salarySum: 0, requirements: cat.requirements };
      }
      catCounts[cat.name].count += cat.count;
      catCounts[cat.name].salarySum += cat.avgSalary * cat.count;
    }

    // Filter jobs from this region
    let jobs = data.jobs;

    if (country) {
      const countryLower = country.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.country.toLowerCase() === countryLower ||
          j.countryName.toLowerCase() === countryLower
      );
    }

    if (category) {
      const catLower = category.toLowerCase();
      jobs = jobs.filter((j) => j.sector.toLowerCase() === catLower);
    }

    if (type) {
      const typeLower = type.toLowerCase();
      jobs = jobs.filter((j) => j.type.toLowerCase() === typeLower);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(searchLower) ||
          j.company.toLowerCase().includes(searchLower)
      );
    }

    allFilteredJobs = allFilteredJobs.concat(jobs);
  }

  // Build merged categories
  mergedCategories = Object.entries(catCounts)
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgSalary: Math.round(data.salarySum / data.count),
      requirements: data.requirements,
    }))
    .sort((a, b) => b.count - a.count);

  // Compute total before pagination
  const total = allFilteredJobs.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Paginate
  const start = (page - 1) * limit;
  const paginatedJobs = allFilteredJobs.slice(start, start + limit);

  // Format salary in returned jobs
  const resultJobs = paginatedJobs.map((j) => ({
    ...j,
    salary: formatSalary(j.salaryMin, j.salaryMax, j.salaryCurrency, j.salaryPeriod),
  }));

  return NextResponse.json({
    jobs: resultJobs,
    total,
    page,
    totalPages,
    categories: mergedCategories,
    countries: mergedCountries,
    allCategories: index.allCategories,
  });
}

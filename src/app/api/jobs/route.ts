import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import zlib from "zlib";

const DATA_DIR = path.join(process.cwd(), "data");

interface Job {
  id: number; title: string; company: string; companyUrl: string;
  location: string; country: string; countryName: string;
  salary: string; salaryMin: number; salaryMax: number;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  contactEmail: string; paywall: boolean; regiao: string;
}

interface RegionData {
  total: number;
  categories: { name: string; count: number; avgSalary: number; requirements: string }[];
  countries: Record<string, number>;
  jobs: Job[];
}

interface IndexData {
  total: number;
  regions: Record<string, { total: number; categories: number; countries: number }>;
  allCategories: string[];
}

interface CountryInfo {
  name: string; slug: string; region: string; count: number;
}

// Caches
const regionCache = new Map<string, RegionData>();
let indexCache: IndexData | null = null;
let countriesCache: CountryInfo[] | null = null;
let latestCache: Job[] | null = null;

function readGzipJson(filePath: string): any {
  const raw = fs.readFileSync(filePath);
  return JSON.parse(zlib.gunzipSync(raw).toString("utf-8"));
}

function loadRegionData(region: string): RegionData {
  const key = region.toLowerCase();
  const cached = regionCache.get(key);
  if (cached) return cached;
  const fileMap: Record<string, string> = {
    europa: "jobs_europa.json.gz",
    asia: "jobs_asia.json.gz",
    eua: "jobs_eua.json.gz",
  };
  const fileName = fileMap[key];
  if (!fileName) return { total: 0, categories: [], countries: {}, jobs: [] };
  try {
    const data: RegionData = readGzipJson(path.join(DATA_DIR, fileName));
    regionCache.set(key, data);
    return data;
  } catch {
    return { total: 0, categories: [], countries: {}, jobs: [] };
  }
}

function loadIndex(): IndexData {
  if (indexCache) return indexCache;
  try {
    indexCache = readGzipJson(path.join(DATA_DIR, "jobs_index.json.gz"));
  } catch {
    indexCache = { total: 45039, regions: {}, allCategories: [] };
  }
  return indexCache!;
}

function loadCountries(): CountryInfo[] {
  if (countriesCache) return countriesCache;
  try {
    countriesCache = readGzipJson(path.join(DATA_DIR, "countries_list.json.gz"));
  } catch {
    countriesCache = [];
  }
  return countriesCache!;
}

function loadLatest(): Job[] {
  if (latestCache) return latestCache;
  try {
    latestCache = readGzipJson(path.join(DATA_DIR, "latest_20.json.gz"));
  } catch {
    latestCache = [];
  }
  return latestCache!;
}

function formatSalary(min: number, max: number, currency: string, period: string): string {
  const symbols: Record<string, string> = {
    EUR: "€", USD: "$", GBP: "£", BRL: "R$", INR: "₹",
    JPY: "¥", CNY: "¥", SGD: "S$", KRW: "₩",
  };
  const sym = symbols[currency] || currency;
  const fmtMin = Math.round(min).toLocaleString();
  const fmtMax = Math.round(max).toLocaleString();
  if (period === "year") return sym + " " + fmtMin + " - " + fmtMax + "/yr";
  if (period === "month") return sym + " " + fmtMin + " - " + fmtMax + "/mo";
  return sym + " " + fmtMin + " - " + fmtMax;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "jobs";
  const region = searchParams.get("region") || "";
  const country = searchParams.get("country") || "";
  const category = searchParams.get("category") || "";
  const type = searchParams.get("type") || "";
  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "18", 10)));

  // Action: latest - return 20 newest jobs for homepage
  if (action === "latest") {
    const jobs = loadLatest().map((j) => ({
      ...j, salary: formatSalary(j.salaryMin, j.salaryMax, j.salaryCurrency, j.salaryPeriod),
    }));
    return NextResponse.json({ jobs, total: jobs.length });
  }

  // Action: countries - return country list for homepage buttons
  if (action === "countries") {
    const countries = loadCountries();
    const index = loadIndex();
    return NextResponse.json({ countries, regions: index.regions, total: index.total });
  }

  // Action: region-info - return region metadata (countries, categories) without jobs
  if (action === "region-info") {
    const data = loadRegionData(region);
    return NextResponse.json({
      total: data.total,
      countries: data.countries,
      categories: data.categories,
    });
  }

  // Default: return paginated jobs
  const index = loadIndex();
  const regionsToLoad = region ? [region] : ["europa", "asia", "eua"];

  let allFilteredJobs: Job[] = [];
  let mergedCountries: Record<string, number> = {};
  const catCounts: Record<string, { count: number; salarySum: number; requirements: string }> = {};

  for (const reg of regionsToLoad) {
    const data = loadRegionData(reg);
    for (const [cName, cCount] of Object.entries(data.countries)) {
      mergedCountries[cName] = (mergedCountries[cName] || 0) + cCount;
    }
    for (const cat of data.categories) {
      if (!catCounts[cat.name]) {
        catCounts[cat.name] = { count: 0, salarySum: 0, requirements: cat.requirements };
      }
      catCounts[cat.name].count += cat.count;
      catCounts[cat.name].salarySum += cat.avgSalary * cat.count;
    }
    let jobs = data.jobs;
    if (country) {
      const cl = country.toLowerCase().replace(/-/g, " ");
      jobs = jobs.filter((j) =>
        j.country.toLowerCase() === cl ||
        j.countryName.toLowerCase() === cl ||
        j.country.toLowerCase() === country.toLowerCase() ||
        j.countryName.toLowerCase() === country.toLowerCase()
      );
    }
    if (category) {
      jobs = jobs.filter((j) => j.sector.toLowerCase() === category.toLowerCase());
    }
    if (type) {
      jobs = jobs.filter((j) => j.type.toLowerCase() === type.toLowerCase());
    }
    if (search) {
      const sl = search.toLowerCase();
      jobs = jobs.filter((j) =>
        j.title.toLowerCase().includes(sl) || j.company.toLowerCase().includes(sl)
      );
    }
    allFilteredJobs = allFilteredJobs.concat(jobs);
  }

  const mergedCategories = Object.entries(catCounts)
    .map(([name, d]) => ({
      name, count: d.count, avgSalary: Math.round(d.salarySum / d.count), requirements: d.requirements,
    }))
    .sort((a, b) => b.count - a.count);

  const actualTotal = allFilteredJobs.length;
  const displayTotal = (!country && !category && !type && !search) ? (index.total || actualTotal) : actualTotal;
  const totalPages = Math.max(1, Math.ceil(actualTotal / limit));
  const start = (page - 1) * limit;
  const paginatedJobs = allFilteredJobs.slice(start, start + limit);

  const resultJobs = paginatedJobs.map((j) => ({
    ...j, salary: formatSalary(j.salaryMin, j.salaryMax, j.salaryCurrency, j.salaryPeriod),
  }));

  return NextResponse.json({
    jobs: resultJobs, total: displayTotal, actualTotal, page, totalPages,
    categories: mergedCategories, countries: mergedCountries, allCategories: index.allCategories,
  });
}

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const DATA_DIR = path.join(process.cwd(), 'data');
const BY_COUNTRY_DIR = path.join(DATA_DIR, 'by_country');

interface Job {
  id: number; title: string; company: string; companyUrl: string;
  location: string; country: string; countryName: string;
  salary: string; salaryMin: number; salaryMax: number;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  contactEmail: string; paywall: boolean; regiao: string;
}

interface CountryInfo { name: string; slug: string; region: string; count: number; }

let countriesCache: CountryInfo[] | null = null;
let latestCache: Job[] | null = null;

function fmt(min: number, max: number, cur: string, per: string): string {
  const S: Record<string, string> = { EUR: '€', USD: '$', GBP: '£', BRL: 'R$', INR: '₹', JPY: '¥', CNY: '¥', SGD: 'S$', KRW: '₩' };
  if (!min && !max) return '';
  const s = S[cur] || cur;
  const a = Math.round(min).toLocaleString(), b = Math.round(max).toLocaleString();
  if (per === 'year') return s + ' ' + a + ' - ' + b + '/yr';
  if (per === 'month') return s + ' ' + a + ' - ' + b + '/mo';
  return s + ' ' + a + ' - ' + b;
}

function loadCountries(): CountryInfo[] {
  if (countriesCache) return countriesCache;
  try { countriesCache = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'countries_index.json'), 'utf-8')); }
  catch { countriesCache = []; }
  return countriesCache!;
}

function loadLatest(): Job[] {
  if (latestCache) return latestCache;
  try { latestCache = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(DATA_DIR, 'latest_20.json.gz'))).toString('utf-8')); }
  catch { latestCache = []; }
  return latestCache!;
}

function loadCountryJobs(region: string, country: string): Job[] {
  try { return JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(BY_COUNTRY_DIR, region + '_' + country + '.json.gz'))).toString('utf-8')); }
  catch { return []; }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'jobs';
  const region = searchParams.get('region') || '';
  const country = searchParams.get('country') || '';
  const type = searchParams.get('type') || '';
  const search = searchParams.get('search') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '18', 10)));

  if (action === 'latest') {
    return NextResponse.json({ jobs: loadLatest().map(j => ({ ...j, salary: fmt(j.salaryMin, j.salaryMax, j.salaryCurrency, j.salaryPeriod) })), total: 20 });
  }
  if (action === 'countries') {
    return NextResponse.json({ countries: loadCountries(), total: 45039 });
  }
  if (region && country) {
    let jobs = loadCountryJobs(region, country);
    if (type) { const t = type.toLowerCase(); jobs = jobs.filter(j => j.type.toLowerCase() === t); }
    if (search) { const s = search.toLowerCase(); jobs = jobs.filter(j => j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s)); }
    const actualTotal = jobs.length;
    const totalPages = Math.max(1, Math.ceil(actualTotal / limit));
    return NextResponse.json({
      jobs: jobs.slice((page - 1) * limit, page * limit).map(j => ({ ...j, salary: fmt(j.salaryMin, j.salaryMax, j.salaryCurrency, j.salaryPeriod) })),
      actualTotal, totalPages, page,
    });
  }
  return NextResponse.json({ jobs: [], actualTotal: 0, totalPages: 0, page: 1 });
}
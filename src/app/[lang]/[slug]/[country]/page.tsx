"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { REGIONS, getRegion } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, sectorNames, default as i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import PaywallContact from "@/components/PaywallContact";
import SiteLogo from "@/components/SiteLogo";

interface Job {
  id: number; title: string; company: string; companyUrl: string;
  location: string; country: string; countryName: string;
  salary: string; salaryMin: number; salaryMax: number;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  contactEmail: string;
  paywall: boolean;
}

interface ApiResponse {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
  categories: { name: string; count: number; avgSalary: number; requirements: string }[];
  countries: Record<string, number>;
  allCategories: string[];
}

const JOB_TYPES = ["Remoto", "Hibrido", "Presencial"];

const CATEGORIES_META: Record<string, { icon: string; color: string }> = {
  "Software Engineering": { icon: "💻", color: "from-blue-500 to-cyan-400" },
  "Cloud & DevOps": { icon: "☁️", color: "from-sky-500 to-blue-400" },
  "Data Science & Analytics": { icon: "📊", color: "from-violet-500 to-purple-400" },
  "AI & Machine Learning": { icon: "🤖", color: "from-fuchsia-500 to-pink-400" },
  "Product Management": { icon: "📋", color: "from-amber-500 to-orange-400" },
  "Cybersecurity": { icon: "🔒", color: "from-red-500 to-rose-400" },
  "Mobile Development": { icon: "📱", color: "from-teal-500 to-emerald-400" },
  "UX/UI & Design": { icon: "🎨", color: "from-pink-500 to-rose-400" },
  "Engineering Leadership": { icon: "👔", color: "from-slate-600 to-gray-500" },
  "QA & Testing": { icon: "✅", color: "from-green-500 to-emerald-400" },
  "Data Engineering": { icon: "🗄️", color: "from-indigo-500 to-blue-400" },
  "Consulting": { icon: "💼", color: "from-cyan-500 to-teal-400" },
  "Sales & Marketing": { icon: "📣", color: "from-orange-500 to-amber-400" },
  "IT Support & Operations": { icon: "🖥️", color: "from-gray-500 to-slate-400" },
  "Research & Development": { icon: "🔬", color: "from-purple-500 to-indigo-400" },
  "Specialized Development": { icon: "⚡", color: "from-yellow-500 to-amber-400" },
  "Game Development": { icon: "🎮", color: "from-emerald-500 to-green-400" },
  "Embedded & IoT": { icon: "🔌", color: "from-stone-500 to-neutral-400" },
  "Writing & Content": { icon: "✍️", color: "from-lime-500 to-green-400" },
  "Finance Technology": { icon: "💰", color: "from-emerald-600 to-green-500" },
  "Other": { icon: "📋", color: "from-gray-400 to-slate-400" },
};

function getCatMeta(name: string) {
  return CATEGORIES_META[name] || { icon: "📂", color: "from-sky-400 to-blue-500" };
}

function JobCardWithSchema({ job, lang }: { job: Job; lang: Lang }) {
  const T = i18n[lang];
  const cm = getCatMeta(job.sector);
  const sName = sectorNames[lang]?.[job.sector] || job.sector;
  return (
    <article className="card-hover group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 border-gray-100">
      <div className={`h-1 w-full bg-gradient-to-r ${cm.color}`} />
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">{job.type}</span>
          <span className="text-xs text-gray-400">{T.posted} {job.posted}</span>
        </div>
        <h3 className="mb-1 text-lg font-bold text-gray-900 group-hover:text-sky-600 transition-colors">{job.title}</h3>
        <p className="my-2 text-sm font-medium text-gray-700">{job.company}</p>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {job.location}
          </span>
          <span className="text-gray-300">|</span>
          <span className="font-medium text-emerald-600">{job.salary}</span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-500">{job.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${cm.color} px-3 py-1 text-xs font-medium text-white`}>{cm.icon} {sName}</span>
          <a href={job.companyUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-sky-600 hover:text-sky-800">{T.viewDetails} &rarr;</a>
        </div>
        {job.paywall && (
          <PaywallContact
            contactEmail={job.contactEmail}
            companyData={{ company: job.company, companyUrl: job.companyUrl, location: job.location, salary: job.salary }}
            jobId={`job-${job.id}`}
            lang={lang}
          />
        )}
      </div>
    </article>
  );
}

// Country flag emoji map (best-effort)
const COUNTRY_FLAGS: Record<string, string> = {
  "united kingdom": "🇬🇧", "germany": "🇩🇪", "france": "🇫🇷", "spain": "🇪🇸", "sweden": "🇸🇪",
  "netherlands": "🇳🇱", "italy": "🇮🇹", "portugal": "🇵🇹", "ireland": "🇮🇪", "switzerland": "🇨🇭",
  "austria": "🇦🇹", "denmark": "🇩🇰", "norway": "🇳🇴", "finland": "🇫🇮", "belgium": "🇧🇪",
  "poland": "🇵🇱", "czech republic": "🇨🇿", "greece": "🇬🇷", "romania": "🇷🇴", "hungary": "🇭🇺",
  "luxembourg": "🇱🇺", "bulgaria": "🇧🇬", "croatia": "🇭🇷", "slovakia": "🇸🇰", "slovenia": "🇸🇮",
  "estonia": "🇪🇪", "latvia": "🇱🇻", "lithuania": "🇱🇹", "cyprus": "🇨🇾", "malta": "🇲🇹",
  "iceland": "🇮🇸", "bosnia and herzegovina": "🇧🇦", "albania": "🇦🇱", "serbia": "🇷🇸", "north macedonia": "🇲🇰",
  "moldova": "🇲🇩", "montenegro": "🇲🇪", "georgia": "🇬🇪", "ukraine": "🇺🇦",
  "india": "🇮🇳", "china": "🇨🇳", "japao": "🇯🇵", "japan": "🇯🇵", "singapura": "🇸🇬", "singapore": "🇸🇬",
  "hong kong": "🇭🇰", "taiwan": "🇹🇼", "coreia do sul": "🇰🇷", "malasia": "🇲🇾", "indonesia": "🇮🇩",
  "vietna": "🇻🇳", "thailand": "🇹🇭", "bangladesh": "🇧🇩", "sri lanka": "🇱🇰", "nepal": "🇳🇵",
  "pakistan": "🇵🇰", "philippines": "🇵🇭", "filipinas": "🇵🇭",
  "united states": "🇺🇸", "remote": "🌍", "remoto global": "🌍",
};

export default function LangSlugCountryPage({ params }: { params: Promise<{ lang: string; slug: string; country: string }> }) {
  const router = useRouter();
  const [resolved, setResolved] = useState<{ lang: Lang; slug: string; countryCode: string } | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterPulse, setFilterPulse] = useState(false);
  const [selType, setSelType] = useState("");
  const [selCategory, setSelCategory] = useState("");
  const [subCountries, setSubCountries] = useState<Record<string, number>>({});

  useEffect(() => {
    params.then((p) => {
      const langCode = p.lang as Lang;
      const expectedSlug = LANG_SLUGS[langCode];
      if (!expectedSlug || p.slug !== expectedSlug) {
        router.replace(`/${langCode}/${expectedSlug}/${p.country}`);
      } else {
        setResolved({ lang: langCode, slug: p.slug, countryCode: p.country.toLowerCase() });
      }
    });
  }, [params, router]);

  const lang = resolved?.lang || "en";
  const countryCode = resolved?.countryCode || "";
  const regionCfg = getRegion(countryCode);
  const T = i18n[lang];
  const dir = LANGUAGES.find((l) => l.code === lang)?.dir || "ltr";

  // Check if countryCode is a region code
  const isRegion = !!regionCfg;
  // If not a region, it's a country name slug
  const countryName = !isRegion ? countryCode.replace(/-/g, " ") : "";

  const fetchJobs = useCallback(async (p = 1) => {
    if (!countryCode) return;
    setLoading(true);
    setFilterPulse(true);
    setTimeout(() => setFilterPulse(false), 600);
    try {
      const sp = new URLSearchParams();
      sp.set("page", String(p));
      sp.set("limit", "18");
      if (isRegion) {
        sp.set("region", regionCfg!.code);
      } else {
        sp.set("country", countryName);
      }
      if (selType && selType !== "all") sp.set("type", selType);
      if (selCategory && selCategory !== "all") sp.set("category", selCategory);
      const r = await fetch(`/api/jobs?${sp.toString()}`);
      const data: ApiResponse = await r.json();
      setJobs(data.jobs);
      setTotalJobs(data.total);
      setTotalPages(data.totalPages);
      setPage(data.page);
      if (isRegion) {
        setSubCountries(data.countries);
      }
    } catch { setJobs([]); setTotalJobs(0); }
    setLoading(false);
  }, [countryCode, isRegion, regionCfg, selType, selCategory, countryName]);

  useEffect(() => {
    if (countryCode) fetchJobs(1);
  }, [fetchJobs, countryCode]);

  const clearFilters = () => { setSelType(""); setSelCategory(""); };
  const hasFilters = !!selType || !!selCategory;

  const pageTitle = isRegion ? regionCfg!.name : countryName;
  const pageJobCount = isRegion ? regionCfg!.jobCount : totalJobs;

  if (!resolved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <SiteLogo size={48} /><div className="mt-4 text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  const sortedCountries = Object.entries(subCountries).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/${lang}/${resolved.slug}`)} className="text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors">{T.backToGlobal}</button>
            <span className="text-gray-300">|</span>
            <SiteLogo size={28} />
            <span className="text-sm font-bold text-gray-900">{isRegion ? regionCfg!.flag : "🌍"} {pageTitle}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/${lang}/${resolved.slug}/company/post`)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-600 transition-all"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              {T.postJob}
            </button>
            <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm">
              <span className="text-lg leading-none">{LANGUAGES.find((l) => l.code === lang)?.flag}</span>
              <span className="hidden sm:inline text-xs font-semibold text-gray-600">{LANGUAGES.find((l) => l.code === lang)?.name}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 sm:py-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="text-6xl mb-4">{isRegion ? regionCfg!.flag : "🌍"}</div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{T.countryPageTitle} {pageTitle}</h1>
          <p className="text-gray-300 mb-6">{T.countryPageSub}</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-semibold">{pageJobCount.toLocaleString()}</span>
              <span className="text-sky-300">{T.openPositions}</span>
            </div>
            {isRegion && (
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <span className="text-sky-300">{T.salaryLocal}:</span>
                <span className="text-white font-semibold">{regionCfg!.currency.symbol} ({regionCfg!.currency.code})</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sub-countries grid (region level only) */}
      {isRegion && sortedCountries.length > 1 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">{T.exploreCountries}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-80 overflow-y-auto pr-2">
            {sortedCountries.map(([cName, cCount]) => {
              const slug = cName.toLowerCase().replace(/\s+/g, "-");
              const flag = COUNTRY_FLAGS[cName.toLowerCase()] || "🏳️";
              return (
                <button
                  key={cName}
                  onClick={() => router.push(`/${lang}/${resolved.slug}/${slug}`)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-sky-50 transition-colors border border-gray-100 hover:border-sky-200"
                >
                  <span className="text-2xl">{flag}</span>
                  <span className="text-[11px] font-medium text-gray-600 text-center leading-tight line-clamp-2">{cName}</span>
                  <span className="text-[10px] text-gray-400">{cCount.toLocaleString()}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* FILTER SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">{T.filterByType}</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelType("")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${!selType ? "bg-sky-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >{T.allTypes}</button>
              {JOB_TYPES.map((t) => {
                const tKey = t.toLowerCase() === "remoto" ? "remote" : t.toLowerCase() === "hibrido" ? "hibrido" : "presencial";
                const label = T[tKey] || t;
                return (
                  <button
                    key={t}
                    onClick={() => setSelType(selType === t ? "" : t)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${selType === t ? "bg-sky-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >{label}</button>
                );
              })}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">{T.filterBySector}</h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              <button
                onClick={() => setSelCategory("")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${!selCategory ? "bg-indigo-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >{T.allFunctions}</button>
              {Object.keys(CATEGORIES_META).map((s) => {
                const cm = CATEGORIES_META[s];
                const sName = sectorNames[lang]?.[s] || s;
                return (
                  <button
                    key={s}
                    onClick={() => setSelCategory(selCategory === s ? "" : s)}
                    className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${selCategory === s ? "bg-gradient-to-r " + cm.color + " text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >{cm.icon} {sName}</button>
                );
              })}
            </div>
          </div>
          {hasFilters && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
              <button onClick={clearFilters} className="text-xs font-medium text-red-500 hover:text-red-600">{T.clearFilters}</button>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">{T.topJobs} - {pageTitle}</h2>
          <div className="flex items-center gap-2">
            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-sky-500">
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                {T.filtering}
              </div>
            )}
            <span className={`text-sm font-medium transition-all ${filterPulse ? "text-sky-500" : "text-gray-500"}`}><span className="font-bold">{totalJobs.toLocaleString()}</span> {T.results}</span>
          </div>
        </div>
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map((i) => (<div key={i} className="rounded-xl border border-gray-100 bg-white p-5"><div className="h-5 w-20 rounded-full bg-gray-100 mb-3 animate-pulse" /><div className="h-6 w-3/4 rounded bg-gray-100 mb-2 animate-pulse" /><div className="h-4 w-1/2 rounded bg-gray-100 mb-4 animate-pulse" /></div>))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="mb-4 text-5xl">🔍</div>
            <h3 className="text-lg font-semibold text-gray-700">{T.noJobs}</h3>
            <p className="mt-2 text-sm text-gray-500">{T.noJobsSub}</p>
            {hasFilters && <button onClick={clearFilters} className="mt-5 rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-medium text-white shadow-md hover:bg-sky-600 transition-all">{T.clearFilters}</button>}
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (<JobCardWithSchema key={job.id} job={job} lang={lang} />))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => fetchJobs(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >&laquo; Prev</button>
                <span className="text-sm text-gray-500">{page} {T.pageOf} {totalPages}</span>
                <button
                  onClick={() => fetchJobs(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >Next &raquo;</button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Other regions */}
      <section className="bg-white border-t border-gray-100 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{T.allRegions}</h2>
          <div className="grid grid-cols-3 gap-4">
            {REGIONS.filter(r => r.code !== countryCode).map((r) => (
              <button key={r.code} onClick={() => router.push(`/${lang}/${resolved.slug}/${r.code}`)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-sky-50 transition-colors border border-gray-100 hover:border-sky-200">
                <span className="text-3xl">{r.flag}</span>
                <div className="text-left">
                  <span className="text-sm font-bold text-gray-700">{r.name}</span>
                  <span className="block text-xs text-gray-400">{r.jobCount.toLocaleString()} {T.jobCount}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-gray-50 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <SiteLogo size={20} />
            <span className="text-sm text-gray-500">{T.footer}</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-sky-600">{T.privacy}</a>
            <a href="#" className="hover:text-sky-600">{T.terms}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

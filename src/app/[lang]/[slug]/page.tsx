"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { REGIONS, TOTAL_JOBS, TOTAL_REGIONS, TOTAL_CATEGORIES, getRegion } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, sectorNames, default as i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { OrganizationJsonLd } from "@/components/JsonLd";
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

function JobCard({ job, lang }: { job: Job; lang: Lang }) {
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
        <h3 className="mb-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-sky-600">{job.title}</h3>
        <p className="my-2 text-sm font-medium text-gray-700">{job.company}</p>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">{job.location}</span>
          <span className="text-gray-300">|</span>
          <span className="font-medium text-emerald-600">{job.salary}</span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-500">{job.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${cm.color} px-3 py-1 text-xs font-medium text-white`}>{cm.icon} {sName}</span>
          <a href={job.companyUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-sky-600 hover:text-sky-800 transition-colors">{T.viewDetails} &rarr;</a>
        </div>
        {job.paywall && (
          <PaywallContact
            contactEmail={job.contactEmail}
            companyData={{ company: job.company, companyUrl: job.companyUrl, location: job.location, salary: job.salary }}
            jobId={`home-${job.id}`}
            lang={lang}
          />
        )}
      </div>
    </article>
  );
}

function AnimatedCounter({ end, label, suffix = "" }: { end: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const step = Math.max(1, Math.floor(end / 80));
        let c = 0;
        const t = setInterval(() => { c += step; if (c >= end) { setCount(end); clearInterval(t); } else setCount(c); }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return (<div ref={ref} className="text-center"><div className="text-3xl font-black text-white">{count.toLocaleString()}{suffix}</div><div className="mt-1 text-sm font-medium text-sky-200">{label}</div></div>);
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const [exiting, setExiting] = useState(false);
  const handleRemove = () => { setExiting(true); setTimeout(onRemove, 280); };
  if (exiting) return <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-medium text-sky-700">{label}</span>;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-medium text-sky-700 transition-all hover:bg-sky-100">
      {label}
      <button onClick={handleRemove} className="ml-0.5 rounded-full p-0.5 transition-all hover:bg-sky-200 hover:rotate-90 duration-300">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </span>
  );
}

export default function LangSlugPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const router = useRouter();
  const [resolved, setResolved] = useState<{ lang: Lang; slug: string } | null>(null);

  useEffect(() => {
    params.then((p) => {
      const langCode = p.lang as Lang;
      const expectedSlug = LANG_SLUGS[langCode];
      if (!expectedSlug || p.slug !== expectedSlug) {
        router.replace(`/${langCode}/${expectedSlug}`);
      } else {
        setResolved({ lang: langCode, slug: p.slug });
      }
    });
  }, [params, router]);

  const lang = resolved?.lang || "en";
  const slug = resolved?.slug || "";
  const [selType, setSelType] = useState("");
  const [selCategory, setSelCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [nlName, setNlName] = useState("");
  const [nlEmail, setNlEmail] = useState("");
  const [nlSent, setNlSent] = useState(false);
  const [filterPulse, setFilterPulse] = useState(false);
  const T = i18n[lang];
  const dir = LANGUAGES.find((l) => l.code === lang)?.dir || "ltr";

  const fetchJobs = useCallback(async (p = 1) => {
    setLoading(true);
    setFilterPulse(true);
    setTimeout(() => setFilterPulse(false), 600);
    try {
      const sp = new URLSearchParams();
      sp.set("page", String(p));
      sp.set("limit", "18");
      if (selType && selType !== "all") sp.set("type", selType);
      if (selCategory && selCategory !== "all") sp.set("category", selCategory);
      if (searchQuery) sp.set("search", searchQuery);
      const r = await fetch(`/api/jobs?${sp.toString()}`);
      const data: ApiResponse = await r.json();
      setJobs(data.jobs);
      setTotalJobs(data.total);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch { setJobs([]); setTotalJobs(0); }
    setLoading(false);
  }, [selType, selCategory, searchQuery]);

  useEffect(() => { fetchJobs(1); }, [fetchJobs]);

  const handleRegionClick = (code: string) => {
    router.push(`/${lang}/${slug}/${code}`);
  };

  const clearFilters = () => { setSelType(""); setSelCategory(""); setSearchQuery(""); setSearchInput(""); };
  const hasFilters = !!selType || !!selCategory || !!searchQuery;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  if (!resolved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <SiteLogo size={48} />
          <div className="mt-4 text-sm text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <OrganizationJsonLd />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <SiteLogo size={32} />
            <span className="text-lg font-bold tracking-tight text-gray-900">Work Versaly</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/${lang}/${slug}/company/post`)}
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

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-14 sm:py-18">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-sky-600/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/20 px-4 py-1.5 text-sm font-medium text-sky-300 backdrop-blur-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-sky-400 animate-pulse" />{T.statsJobs}: {TOTAL_JOBS.toLocaleString()}+
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-3">{T.heroTitle}</h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-gray-300 mb-6">{T.heroSub}</p>
          {/* Search input */}
          <form onSubmit={handleSearch} className="mx-auto max-w-lg">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={T.searchJobs}
                className="w-full rounded-xl border border-white/20 bg-white/10 pl-12 pr-4 py-3.5 text-sm text-white placeholder-sky-200/60 outline-none backdrop-blur-sm focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
              />
            </div>
          </form>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-8 border-t border-sky-500/20">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 sm:px-6 sm:grid-cols-4">
          <AnimatedCounter end={TOTAL_JOBS} suffix="+" label={T.statsJobs} />
          <AnimatedCounter end={3200} suffix="+" label={T.statsCompanies} />
          <AnimatedCounter end={TOTAL_REGIONS} suffix="" label={T.statsCountries} />
          <AnimatedCounter end={TOTAL_CATEGORIES} suffix="" label={T.statsCategories} />
        </div>
      </section>

      {/* REGION CARDS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">{T.exploreRegions}</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">{T.exploreRegionsSub}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {REGIONS.map((region) => (
            <button
              key={region.code}
              onClick={() => handleRegionClick(region.code)}
              className="group relative flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-sky-200 hover:-translate-y-1 active:scale-[0.97] cursor-pointer text-center"
            >
              <div className="text-5xl sm:text-6xl transition-transform duration-300 group-hover:scale-125">
                {region.flag}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-gray-800">{region.name}</span>
                <span className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  {region.jobCount.toLocaleString()} {T.jobCount}
                </span>
                <span className="mt-0.5 text-xs text-sky-600 font-medium">{region.currency.symbol} {region.currency.code}</span>
              </div>
              {/* Top 3 categories */}
              {region.topCategories && region.topCategories.length > 0 && (
                <div className="mt-2 flex flex-wrap justify-center gap-1">
                  {region.topCategories.slice(0, 3).map((cat) => {
                    const cm = getCatMeta(cat.name);
                    return (
                      <span key={cat.name} className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                        {cm.icon} {cat.name.split(" & ")[0].split(" ")[0]} ({cat.count.toLocaleString()})
                      </span>
                    );
                  })}
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* FILTER SECTION - Type & Category */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-4">
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
        </div>
      </section>

      {/* FILTER CHIPS */}
      {hasFilters && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-400">{T.filterChip}</span>
            {selType && <FilterChip label={T[selType.toLowerCase() === "remoto" ? "remote" : selType.toLowerCase() === "hibrido" ? "hibrido" : "presencial"] || selType} onRemove={() => setSelType("")} />}
            {selCategory && <FilterChip label={sectorNames[lang]?.[selCategory] || selCategory} onRemove={() => setSelCategory("")} />}
            {searchQuery && <FilterChip label={`🔍 ${searchQuery}`} onRemove={() => { setSearchQuery(""); setSearchInput(""); }} />}
            <button onClick={clearFilters} className="ml-auto text-xs font-medium text-red-500 hover:text-red-600">{T.clearFilters}</button>
          </div>
        </div>
      )}

      {/* JOBS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">{T.jobsHeader}</h2>
          </div>
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
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="h-5 w-20 rounded-full bg-gray-100 mb-3 animate-pulse" />
                <div className="h-6 w-3/4 rounded bg-gray-100 mb-2 animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-gray-100 mb-4 animate-pulse" />
                <div className="h-4 w-full rounded bg-gray-100 mb-2 animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-5xl">🔍</div>
            <h3 className="text-lg font-semibold text-gray-700">{T.noJobs}</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-xs">{T.noJobsSub}</p>
            {hasFilters && <button onClick={clearFilters} className="mt-5 rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-medium text-white shadow-md hover:bg-sky-600 transition-all">{T.clearFilters}</button>}
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => <JobCard key={`${job.id}-${page}`} job={job} lang={lang} />)}
            </div>
            {/* PAGINATION */}
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

      {/* FOR COMPANIES CTA */}
      <section className="bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500 py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">{T.forCompanies}</h2>
          <p className="mb-8 text-sky-100 max-w-xl mx-auto">{T.companyRegisterSub}</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm p-5 text-center">
              <div className="text-3xl mb-2">🔗</div>
              <h3 className="font-bold text-white text-sm">{T.benefit1Title}</h3>
              <p className="text-xs text-sky-100 mt-1">{T.benefit1Desc}</p>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm p-5 text-center">
              <div className="text-3xl mb-2">🌍</div>
              <h3 className="font-bold text-white text-sm">{T.benefit2Title}</h3>
              <p className="text-xs text-sky-100 mt-1">{T.benefit2Desc}</p>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm p-5 text-center">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-bold text-white text-sm">{T.benefit3Title}</h3>
              <p className="text-xs text-sky-100 mt-1">{T.benefit3Desc}</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/${lang}/${slug}/company/post`)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-sky-600 shadow-lg hover:bg-sky-50 transition-all active:scale-[0.98]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            {T.registerAndPost}
          </button>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
          <div className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-white/10">
            <svg className="h-6 w-6 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <p className="mb-6 text-sky-200">{T.newsletterSub}</p>
          {!nlSent ? (
            <div className="mx-auto max-w-md space-y-3">
              <input type="text" value={nlName} onChange={(e) => setNlName(e.target.value)} placeholder={T.name} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-sky-200/60 outline-none backdrop-blur-sm focus:border-sky-400" />
              <input type="email" value={nlEmail} onChange={(e) => setNlEmail(e.target.value)} placeholder={T.email} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-sky-200/60 outline-none backdrop-blur-sm focus:border-sky-400" />
              <button onClick={() => { if (nlName && nlEmail) setNlSent(true); }} className="w-full rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white shadow-lg hover:bg-sky-400 transition-all active:scale-[0.98]">{T.subscribe}</button>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/10 border border-sky-400/30 px-6 py-8 backdrop-blur-sm">
              <div className="mb-3 text-4xl">&#10003;</div>
              <p className="text-lg font-semibold text-white">{T.subscribed}</p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <SiteLogo size={20} />
            <span className="text-sm text-gray-500">{T.footer}</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-sky-600">{T.privacy}</a>
            <a href="#" className="hover:text-sky-600">{T.terms}</a>
            <a href="#" className="hover:text-sky-600">{T.contact}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

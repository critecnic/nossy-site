"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, TOTAL_JOBS, getCountry, type CountryConfig } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, sectorNames, countryNames, default as i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { OrganizationJsonLd } from "@/components/JsonLd";
import PaywallContact from "@/components/PaywallContact";
import SiteLogo from "@/components/SiteLogo";

interface Job {
  id: number; title: string; company: string; companyUrl: string;
  location: string; country: string; countryName: string;
  lat: number; lng: number;
  salary: string; salaryMin: number; salaryMax: number;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  contactEmail: string;
  paywall: boolean;
}

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Internship", "Freelance"];

const SECTORS = [
  { key: "Technology", icon: "\uD83D\uDCBB", color: "from-blue-500 to-cyan-400" },
  { key: "Finance", icon: "\uD83D\uDCB0", color: "from-emerald-500 to-green-400" },
  { key: "Design", icon: "\uD83C\uDFA8", color: "from-purple-500 to-pink-400" },
  { key: "Marketing", icon: "\uD83D\uDCE3", color: "from-orange-500 to-amber-400" },
  { key: "Data Science", icon: "\uD83D\uDCCA", color: "from-indigo-500 to-violet-400" },
  { key: "Sales", icon: "\uD83D\uDCC8", color: "from-red-500 to-rose-400" },
  { key: "Management", icon: "\uD83D\uDC65", color: "from-teal-500 to-emerald-400" },
  { key: "Healthcare", icon: "\uD83E\uDEBA", color: "from-pink-500 to-red-400" },
  { key: "Engineering", icon: "\uD83D\uDD27", color: "from-slate-500 to-gray-400" },
];



const TYPE_KEYS: Record<string, string> = {
  "Full-time": "fullTime",
  "Part-time": "partTime",
  "Contract": "contract",
  "Remote": "remote",
  "Internship": "internship",
  "Freelance": "freelance",
};

function JobCard({ job, lang }: { job: Job; index: number; lang: Lang; highlighted: boolean }) {
  const T = i18n[lang];
  const sd = SECTORS.find((s) => s.key === job.sector);
  const sName = sectorNames[lang]?.[job.sector] || job.sector;
  const countryCfg = getCountry(job.country);
  return (
    <article className="card-hover group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 border-gray-100">
      <div className={`h-1 w-full bg-gradient-to-r ${sd?.color || "from-sky-400 to-blue-500"}`} />
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">{job.type}</span>
          <span className="text-xs text-gray-400">{T.posted} {job.posted}</span>
        </div>
        <h3 className="mb-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-sky-600">{job.title}</h3>
        <p className="my-2 text-sm font-medium text-gray-700">{job.company}</p>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            {countryCfg?.flag || ""}
            {job.location}
          </span>
          <span className="text-gray-300">|</span>
          <span className="font-medium text-emerald-600">{job.salary}</span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-500">{job.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${sd?.color || "from-sky-400 to-blue-500"} px-3 py-1 text-xs font-medium text-white`}>{sd?.icon} {sName}</span>
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

function CountryCard({ country, T, onClick, lang }: { country: CountryConfig; T: Record<string, string>; onClick: () => void; lang: Lang }) {
  const [hovered, setHovered] = useState(false);
  const localName = countryNames[lang]?.[country.code] || country.name;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-sky-200 hover:-translate-y-1 active:scale-[0.97] cursor-pointer text-center"
    >
      <div className={`text-4xl sm:text-5xl transition-transform duration-300 ${hovered ? "scale-125" : "scale-100"}`}>
        {country.flag}
      </div>
      <div className="flex flex-col items-center">
        <span className="text-sm font-bold text-gray-800 leading-tight">{localName}</span>
        <span className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {country.jobCount.toLocaleString()} {T.openPositions}
        </span>
        <span className="mt-0.5 text-xs text-sky-600 font-medium">{country.currency.symbol} {country.currency.code}</span>
      </div>
      {hovered && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-sky-500 px-3 py-1 text-[10px] font-semibold text-white shadow-md whitespace-nowrap">
          {T.viewJobs} &rarr;
        </div>
      )}
    </button>
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
  const [selCountry, setSelCountry] = useState("");
  const [selType, setSelType] = useState("");
  const [selSector, setSelSector] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [nlName, setNlName] = useState("");
  const [nlEmail, setNlEmail] = useState("");
  const [nlSent, setNlSent] = useState(false);
  const [filterPulse, setFilterPulse] = useState(false);
  const T = i18n[lang];
  const dir = LANGUAGES.find((l) => l.code === lang)?.dir || "ltr";

  const fetchJobs = useCallback(async (country?: string) => {
    setLoading(true);
    setFilterPulse(true);
    setTimeout(() => setFilterPulse(false), 600);
    try {
      const p = new URLSearchParams();
      if (country) p.set("country", country);
      if (selType && selType !== "all") p.set("type", selType);
      if (selSector && selSector !== "all") p.set("sector", selSector);
      const r = await fetch(`/api/jobs?${p.toString()}`);
      const data = await r.json();
      setJobs(data);
    } catch { setJobs([]); }
    setLoading(false);
  }, [selType, selSector]);

  useEffect(() => { fetchJobs(selCountry); }, [fetchJobs, selCountry]);

  const handleCountryClick = (code: string) => {
    router.push(`/${lang}/${slug}/${code}`);
  };

  const clearFilters = () => { setSelCountry(""); setSelType(""); setSelSector(""); };
  const hasFilters = !!selCountry || !!selType || !!selSector;

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
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-gray-300">{T.heroSub}</p>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-8 border-t border-sky-500/20">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 sm:px-6 sm:grid-cols-4">
          <AnimatedCounter end={TOTAL_JOBS} suffix="+" label={T.statsJobs} />
          <AnimatedCounter end={3200} suffix="+" label={T.statsCompanies} />
          <AnimatedCounter end={12} suffix="" label={T.statsCountries} />
          <AnimatedCounter end={45000} suffix="+" label={T.statsUsers} />
        </div>
      </section>

      {/* COUNTRY GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">{T.exploreCountries}</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">{T.exploreCountriesSub}</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {COUNTRIES.map((country) => (
            <CountryCard key={country.code} country={country} T={T} onClick={() => handleCountryClick(country.code)} lang={lang} />
          ))}
        </div>
      </section>

      {/* FILTER SECTION - Type & Sector */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          {/* Job Type Filter */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">{T.filterByType}</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelType("")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${!selType ? "bg-sky-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >{T.allTypes}</button>
              {JOB_TYPES.map((t) => {
                const tKey = TYPE_KEYS[t];
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
          {/* Sector/Function Filter */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">{T.filterBySector}</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelSector("")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${!selSector ? "bg-indigo-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >{T.allFunctions}</button>
              {SECTORS.map((s) => {
                const sName = sectorNames[lang]?.[s.key] || s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setSelSector(selSector === s.key ? "" : s.key)}
                    className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${selSector === s.key ? "bg-gradient-to-r " + s.color + " text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >{s.icon} {sName}</button>
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
            {selCountry && (() => { const c = COUNTRIES.find(x => x.code === selCountry); return c ? <FilterChip label={`${c.flag} ${c.name}`} onRemove={() => setSelCountry("")} /> : null; })()}
            {selType && <FilterChip label={T[TYPE_KEYS[selType]] || selType} onRemove={() => setSelType("")} />}
            {selSector && <FilterChip label={sectorNames[lang]?.[selSector] || selSector} onRemove={() => setSelSector("")} />}
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
            <span className={`text-sm font-medium transition-all ${filterPulse ? "text-sky-500" : "text-gray-500"}`}><span className="font-bold">{jobs.length}</span> {T.results}</span>
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
            <div className="mb-4 text-5xl">\uD83D\uDD0D</div>
            <h3 className="text-lg font-semibold text-gray-700">{T.noJobs}</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-xs">{T.noJobsSub}</p>
            {hasFilters && <button onClick={clearFilters} className="mt-5 rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-medium text-white shadow-md hover:bg-sky-600 transition-all">{T.clearFilters}</button>}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, i) => <JobCard key={`${job.id}-${selCountry}-${selType}-${selSector}`} job={job} index={i} lang={lang} highlighted={false} />)}
          </div>
        )}
      </section>

      {/* FOR COMPANIES CTA */}
      <section className="bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500 py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">{T.forCompanies}</h2>
          <p className="mb-8 text-sky-100 max-w-xl mx-auto">{T.companyRegisterSub}</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm p-5 text-center">
              <div className="text-3xl mb-2">\uD83D\uDD17</div>
              <h3 className="font-bold text-white text-sm">{T.benefit1Title}</h3>
              <p className="text-xs text-sky-100 mt-1">{T.benefit1Desc}</p>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm p-5 text-center">
              <div className="text-3xl mb-2">\uD83C\uDF0D</div>
              <h3 className="font-bold text-white text-sm">{T.benefit2Title}</h3>
              <p className="text-xs text-sky-100 mt-1">{T.benefit2Desc}</p>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm p-5 text-center">
              <div className="text-3xl mb-2">\uD83D\uDCAC</div>
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

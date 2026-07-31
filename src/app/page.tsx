"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { COUNTRIES, TOTAL_JOBS, getCountry, type CountryConfig } from "@/lib/countries";
import { LANGUAGES, sectorNames, countryNames, default as i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { OrganizationJsonLd } from "@/components/JsonLd";
import PaywallContact from "@/components/PaywallContact";

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

function WWLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="lg1" x1="20" y1="30" x2="45" y2="95"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#38bdf8" /></linearGradient>
        <linearGradient id="lg2" x1="55" y1="30" x2="100" y2="95"><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#fff" /></linearGradient>
        <linearGradient id="lbg" x1="0" y1="0" x2="120" y2="120"><stop offset="0%" stopColor="#1e293b" /><stop offset="100%" stopColor="#0f172a" /></linearGradient>
      </defs>
      <rect width="120" height="120" rx="22" fill="url(#lbg)" />
      <rect x="1" y="1" width="118" height="118" rx="21" stroke="rgba(14,165,233,0.3)" strokeWidth="1" fill="none" />
      <text x="18" y="82" fontFamily="Arial Black, sans-serif" fontSize="52" fontWeight="900" fill="url(#lg1)">W</text>
      <text x="55" y="82" fontFamily="Arial Black, sans-serif" fontSize="52" fontWeight="900" fill="url(#lg2)">W</text>
      <circle cx="105" cy="20" r="5" fill="#0ea5e9"><animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" /></circle>
      <text x="14" y="108" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="600" fill="rgba(56,189,248,0.6)" letterSpacing="3">WORLD OF WORK</text>
    </svg>
  );
}

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
        {/* PAYPAL PAYWALL - only for jobs marked by admin */}
        {job.paywall && (
          <PaywallContact
            contactEmail={job.contactEmail}
            companyData={{
              company: job.company,
              companyUrl: job.companyUrl,
              location: job.location,
              salary: job.salary,
            }}
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

function LanguageDropdown({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang)!;
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const filtered = LANGUAGES.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div ref={ref} className="relative">
      <button onClick={() => { setOpen(!open); setSearch(""); }} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm transition-all hover:border-sky-300 hover:shadow-sm">
        <span className="text-lg leading-none">{current.flag}</span>
        <span className="hidden sm:inline text-xs font-semibold text-gray-600">{current.name}</span>
        <svg className={`h-3 w-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-52 rounded-xl border border-gray-200 bg-white py-1 shadow-xl z-50">
          <div className="px-2 pb-1">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={i18n[lang].searchLang} className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-sm outline-none focus:border-sky-300" autoFocus />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.map((l) => (
              <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); setSearch(""); }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-sky-50 ${l.code === lang ? "bg-sky-50 text-sky-700 font-semibold" : "text-gray-700"}`}>
                <span className="text-base leading-none">{l.flag}</span>
                <span className="font-medium">{l.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("en");
  const [selCountry, setSelCountry] = useState("");
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
      const r = await fetch(`/api/jobs?${p.toString()}`);
      const data = await r.json();
      setJobs(data);
    } catch { setJobs([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchJobs(selCountry); }, [fetchJobs, selCountry]);

  const handleCountryClick = (code: string) => {
    window.location.href = `/${code}`;
  };

  const clearFilters = () => { setSelCountry(""); };
  const hasFilters = !!selCountry;

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <OrganizationJsonLd />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <WWLogo size={32} />
            <span className="hidden sm:block text-lg font-bold tracking-tight text-gray-900">W-W</span>
          </div>
          <LanguageDropdown lang={lang} setLang={setLang} />
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
          <AnimatedCounter end={20} suffix="+" label={T.statsCountries} />
          <AnimatedCounter end={45000} suffix="+" label={T.statsUsers} />
        </div>
      </section>

      {/* COUNTRY GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">{T.exploreCountries}</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">{T.exploreCountriesSub}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {COUNTRIES.map((country) => (
            <CountryCard key={country.code} country={country} T={T} onClick={() => handleCountryClick(country.code)} lang={lang} />
          ))}
        </div>
      </section>

      {/* FILTER CHIPS */}
      {hasFilters && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-400">{T.filterChip}</span>
            {selCountry && (() => { const c = COUNTRIES.find(x => x.code === selCountry); return c ? <FilterChip label={`${c.flag} ${c.name}`} onRemove={() => setSelCountry("")} /> : null; })()}
            <button onClick={clearFilters} className="ml-auto text-xs font-medium text-red-500 hover:text-red-600">{T.clearFilters}</button>
          </div>
        </div>
      )}

      {/* JOBS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="mb-6 flex items-center justify-end">
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
            <div className="mb-4 text-5xl">🔍</div>
            <h3 className="text-lg font-semibold text-gray-700">{T.noJobs}</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-xs">{T.noJobsSub}</p>
            {hasFilters && <button onClick={clearFilters} className="mt-5 rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-medium text-white shadow-md hover:bg-sky-600 transition-all">{T.clearFilters}</button>}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, i) => <JobCard key={`${job.id}-${selCountry}-${selSector}`} job={job} index={i} lang={lang} highlighted={false} />)}
          </div>
        )}
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
              <div className="mb-3 text-4xl">✅</div>
              <p className="text-lg font-semibold text-white">{T.subscribed}</p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <WWLogo size={20} />
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

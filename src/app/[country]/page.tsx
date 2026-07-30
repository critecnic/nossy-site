"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, getCountry, type CountryConfig } from "@/lib/countries";
import { LANGUAGES, sectorNames, default as i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { JobJsonLd, CountryListingJsonLd } from "@/components/JsonLd";

interface Job {
  id: number; title: string; company: string; companyUrl: string;
  location: string; country: string; countryName: string;
  lat: number; lng: number;
  salary: string; salaryMin: number; salaryMax: number;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  contactEmail: string;
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
      <text x="14" y="108" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="600" fill="rgba(56,189,248,0.6)" letterSpacing="3">WORLD OF WORK</text>
    </svg>
  );
}

function JobCardWithSchema({ job, lang, countryCfg }: { job: Job; lang: Lang; countryCfg: CountryConfig }) {
  const [contactRevealed, setContactRevealed] = useState(false);
  const T = i18n[lang];
  const sd = SECTORS.find((s) => s.key === job.sector);
  const sName = sectorNames[lang]?.[job.sector] || job.sector;
  return (
    <article className="card-hover group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 border-gray-100">
      <JobJsonLd
        title={job.title} description={job.description} company={job.company}
        companyUrl={job.companyUrl} location={job.location} country={countryCfg}
        salary={{ min: job.salaryMin, max: job.salaryMax, currency: job.salaryCurrency }}
        type={job.type} sector={job.sector} posted={job.posted}
      />
      <div className={`h-1 w-full bg-gradient-to-r ${sd?.color || "from-sky-400 to-blue-500"}`} />
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
          <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${sd?.color || "from-sky-400 to-blue-500"} px-3 py-1 text-xs font-medium text-white`}>{sd?.icon} {sName}</span>
          <a href={job.companyUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-sky-600 hover:text-sky-800">{T.viewDetails} &rarr;</a>
        </div>
        {/* CONTACT - PAYWALL */}
        <div className="mt-4 border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">{T.contactInfo}</span>
            {!contactRevealed ? (
              <button onClick={() => setContactRevealed(true)} className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-sky-600 hover:shadow-md hover:scale-105 active:scale-95">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {T.unlock}
              </button>
            ) : (
              <span className="text-xs font-medium text-sky-600 truncate max-w-[180px]">{job.contactEmail}</span>
            )}
          </div>
          {!contactRevealed && (
            <p className="mt-1.5 text-[10px] text-gray-300">{T.contactLocked}</p>
          )}
        </div>
      </div>
    </article>
  );
}

function LanguageDropdown({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang)!;
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm hover:border-sky-300">
        <span className="text-lg leading-none">{current.flag}</span>
        <span className="hidden sm:inline text-xs font-semibold text-gray-600">{current.name}</span>
        <svg className={`h-3 w-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-xl z-50">
          {LANGUAGES.map((l) => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-sky-50 ${l.code === lang ? "bg-sky-50 text-sky-700 font-semibold" : "text-gray-700"}`}>
              <span>{l.flag}</span><span className="font-medium">{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CountryPage({ params }: { params: Promise<{ country: string }> }) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [countryCode, setCountryCode] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selSector, setSelSector] = useState("");
  const [filterPulse, setFilterPulse] = useState(false);
  const T = i18n[lang];
  const dir = LANGUAGES.find((l) => l.code === lang)?.dir || "ltr";

  useEffect(() => {
    params.then(p => {
      const code = p.country.toLowerCase();
      setCountryCode(code);
      if (!getCountry(code)) router.push("/");
    });
  }, [params, router]);

  const countryCfg = getCountry(countryCode);

  const fetchJobs = useCallback(async () => {
    if (!countryCode) return;
    setLoading(true);
    try {
      const p = new URLSearchParams();
      p.set("country", countryCode);
      if (selSector) p.set("sector", selSector);
      const r = await fetch(`/api/jobs?${p.toString()}`);
      const data = await r.json();
      setJobs(data);
    } catch { setJobs([]); }
    setLoading(false);
  }, [countryCode, selSector]);

  useEffect(() => {
    if (countryCode) {
      fetchJobs();
      setFilterPulse(true);
      setTimeout(() => setFilterPulse(false), 600);
    }
  }, [fetchJobs, countryCode]);

  if (!countryCfg) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">\uD83C\uDF0D</div>
          <h1 className="text-2xl font-bold text-gray-900">Country not found</h1>
          <button onClick={() => router.push("/")} className="mt-4 text-sky-600 hover:underline">Go back to Global</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {countryCfg && <CountryListingJsonLd countryCode={countryCfg.code} countryName={countryCfg.name} jobCount={jobs.length} />}

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors">
              {T.backToGlobal}
            </button>
            <span className="text-gray-300">|</span>
            <WWLogo size={28} />
            <span className="text-sm font-bold text-gray-900">{countryCfg.flag} {countryCfg.name}</span>
          </div>
          <LanguageDropdown lang={lang} setLang={setLang} />
        </div>
      </header>

      {/* COUNTRY HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 sm:py-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="text-6xl mb-4">{countryCfg.flag}</div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            {T.countryPageTitle} {countryCfg.name}
          </h1>
          <p className="text-gray-300 mb-6">{T.countryPageSub}</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-semibold">{countryCfg.jobCount.toLocaleString()}</span>
              <span className="text-sky-300">{T.openPositions}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <span className="text-sky-300">{T.salaryLocal}:</span>
              <span className="text-white font-semibold">{countryCfg.currency.symbol} ({countryCfg.currency.code})</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTORS FILTER */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setSelSector("")} className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${!selSector ? "bg-slate-800 text-white shadow-md" : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-sky-300"}`}>{T.allSectors}</button>
            {SECTORS.map((s) => {
              const sName = sectorNames[lang]?.[s.key] || s.key;
              const active = selSector === s.key;
              return (
                <button key={s.key} onClick={() => setSelSector(active ? "" : s.key)} className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105 active:scale-95 ${active ? `bg-gradient-to-r ${s.color} text-white shadow-lg` : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-sky-300"}`}>
                  <span className="text-base">{s.icon}</span><span>{sName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* JOBS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">{T.topJobs} - {countryCfg.name}</h2>
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
            {[1,2,3].map((i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="h-5 w-20 rounded-full bg-gray-100 mb-3 animate-pulse" />
                <div className="h-6 w-3/4 rounded bg-gray-100 mb-2 animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-gray-100 mb-4 animate-pulse" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="mb-4 text-5xl">\uD83D\uDD0D</div>
            <h3 className="text-lg font-semibold text-gray-700">{T.noJobs}</h3>
            <p className="mt-2 text-sm text-gray-500">{T.noJobsSub}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCardWithSchema key={job.id} job={job} lang={lang} countryCfg={countryCfg} />
            ))}
          </div>
        )}
      </section>

      {/* OTHER COUNTRIES */}
      <section className="bg-white border-t border-gray-100 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{T.featuredCountries}</h2>
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {COUNTRIES.filter(c => c.code !== countryCode).slice(0, 10).map((c) => (
              <button key={c.code} onClick={() => router.push(`/${c.code}`)} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-sky-50 transition-colors">
                <span className="text-2xl">{c.flag}</span>
                <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{c.name}</span>
                <span className="text-[9px] text-gray-400">{c.jobCount.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-gray-50 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <WWLogo size={20} />
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

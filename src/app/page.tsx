"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { countries, getCountryName } from "@/lib/locations";
import { LANGUAGES, sectorNames, default as i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

interface Job {
  id: number; title: string; company: string; companyUrl: string;
  location: string; country: string; lat: number; lng: number;
  salary: string; description: string; sector: string; posted: string; type: string;
}

function WWLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="lg1" x1="20" y1="30" x2="45" y2="95"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#38bdf8" /></linearGradient>
        <linearGradient id="lg2" x1="55" y1="30" x2="100" y2="95"><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#fff" /></linearGradient>
        <linearGradient id="lbg" x1="0" y1="0" x2="120" y2="120"><stop offset="0%" stopColor="#1e293b" /><stop offset="100%" stopColor="#0f172a" /></linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width="120" height="120" rx="22" fill="url(#lbg)" />
      <rect x="1" y="1" width="118" height="118" rx="21" stroke="rgba(14,165,233,0.3)" strokeWidth="1" fill="none" />
      <text x="18" y="82" fontFamily="Arial Black, sans-serif" fontSize="52" fontWeight="900" fill="url(#lg1)" filter="url(#glow)">W</text>
      <text x="55" y="82" fontFamily="Arial Black, sans-serif" fontSize="52" fontWeight="900" fill="url(#lg2)" filter="url(#glow)">W</text>
      <circle cx="105" cy="20" r="5" fill="#0ea5e9"><animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" /></circle>
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
  { key: "Education", icon: "\uD83C\uDF93", color: "from-yellow-500 to-orange-400" },
  { key: "Engineering", icon: "\uD83D\uDD27", color: "from-slate-500 to-gray-400" },
  { key: "Legal", icon: "\u2696\uFE0F", color: "from-amber-600 to-yellow-500" },
  { key: "HR", icon: "\uD83E\uDD1D", color: "from-sky-500 to-blue-400" },
];

function PayPalIcon() {
  return (<svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/></svg>);
}

function SimulatedMap({ jobs, onMarkerClick, T }: { jobs: Job[]; onMarkerClick: (job: Job) => void; T: Record<string, string> }) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const w = 900, h = 450;
  const toX = (lng: number) => ((lng + 180) / 360) * w;
  const toY = (lat: number) => ((90 - lat) / 180) * h;
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox={`0 0 ${w} ${h}`}>
        {Array.from({ length: 7 }, (_, i) => (<line key={`h${i}`} x1="0" y1={i*75} x2={w} y2={i*75} stroke="#38bdf8" strokeWidth="0.5" />))}
        {Array.from({ length: 13 }, (_, i) => (<line key={`v${i}`} x1={i*75} y1="0" x2={i*75} y2={h} stroke="#38bdf8" strokeWidth="0.5" />))}
        <ellipse cx="260" cy="180" rx="120" ry="80" fill="#38bdf8" opacity="0.08" />
        <ellipse cx="500" cy="160" rx="100" ry="70" fill="#38bdf8" opacity="0.06" />
        <ellipse cx="430" cy="300" rx="70" ry="90" fill="#38bdf8" opacity="0.07" />
        <ellipse cx="650" cy="200" rx="130" ry="80" fill="#38bdf8" opacity="0.06" />
        <ellipse cx="780" cy="280" rx="60" ry="40" fill="#38bdf8" opacity="0.05" />
      </svg>
      <svg className="relative w-full" viewBox={`0 0 ${w} ${h}`} style={{ height: "auto" }}>
        {jobs.map((job) => {
          const x = toX(job.lng), y = toY(job.lat);
          const isH = hoveredId === job.id;
          return (
            <g key={job.id} className="cursor-pointer" onClick={() => onMarkerClick(job)} onMouseEnter={() => setHoveredId(job.id)} onMouseLeave={() => setHoveredId(null)}>
              <circle cx={x} cy={y} r={isH ? 14 : 10} fill="#0ea5e9" opacity="0.2"><animate attributeName="r" values="8;14;8" dur="3s" repeatCount="indefinite" /></circle>
              <circle cx={x} cy={y} r={isH ? 6 : 4} fill="#0ea5e9" className={isH ? "" : "marker-bounce"} />
              {isH && (<g className="animate-scale-in"><rect x={x-70} y={y-40} width="140" height="28" rx="6" fill="rgba(15,23,42,0.9)" stroke="#0ea5e9" strokeWidth="1" /><text x={x} y={y-22} textAnchor="middle" fill="white" fontSize="11" fontWeight="600">{job.title.length > 22 ? job.title.slice(0,22)+"..." : job.title}</text></g>)}
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 text-xs text-sky-300 backdrop-blur-sm">
        <span className="inline-block h-2 w-2 rounded-full bg-sky-400 animate-pulse" />{jobs.length} {T.activePositions}
      </div>
    </div>
  );
}

function JobCard({ job, index, lang, highlighted }: { job: Job; index: number; lang: Lang; highlighted: boolean }) {
  const [revealed, setRevealed] = useState(false);
  const T = i18n[lang];
  const sd = SECTORS.find((s) => s.key === job.sector);
  const sName = sectorNames[lang]?.[job.sector] || job.sector;
  return (
    <article className={`card-hover animate-fade-in-up stagger-${(index % 12) + 1} group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 ${highlighted ? "border-sky-400 ring-2 ring-sky-100" : "border-gray-100"}`}>
      <div className={`h-1 w-full bg-gradient-to-r ${sd?.color || "from-sky-400 to-blue-500"}`} />
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">{job.type}</span>
          <span className="text-xs text-gray-400">{T.posted} {job.posted}</span>
        </div>
        <h3 className="mb-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-sky-600">{job.title}</h3>
        <div className="relative my-3">
          <p className={`text-sm text-gray-600 transition-all duration-300 ${!revealed ? "blur-[4px] select-none" : ""}`}>{job.company}</p>
          {!revealed && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] paywall-pulse">
              <button onClick={() => setRevealed(true)} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-amber-600 hover:shadow-lg hover:scale-105 active:scale-95">
                <PayPalIcon />{T.unlock}
              </button>
            </div>
          )}
        </div>
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
          <a href={job.companyUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-sky-600 hover:text-sky-800 transition-colors">{T.viewDetails} &rarr;</a>
        </div>
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
        const step = Math.max(1, Math.floor(end / 125));
        let c = 0;
        const t = setInterval(() => { c += step; if (c >= end) { setCount(end); clearInterval(t); } else setCount(c); }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return (<div ref={ref} className="text-center"><div className="text-3xl font-black text-white animate-count">{count.toLocaleString()}{suffix}</div><div className="mt-1 text-sm font-medium text-sky-200">{label}</div></div>);
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="animate-fade-in-up inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-medium text-sky-700 transition-all hover:bg-sky-100">
      {label}
      <button onClick={onRemove} className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-sky-200 hover:text-sky-900">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </span>
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

  const filtered = LANGUAGES.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <button onClick={() => { setOpen(!open); setSearch(""); }} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm transition-all hover:border-sky-300 hover:shadow-sm">
        <span className="text-lg leading-none">{current.flag}</span>
        <span className="hidden sm:inline text-xs font-semibold text-gray-600">{current.name}</span>
        <svg className={`h-3 w-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-xl animate-scale-in z-50">
          <div className="px-2 pb-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={i18n[lang].searchLang}
              className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-sm outline-none focus:border-sky-300 focus:ring-1 focus:ring-sky-100"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {filtered.map((l) => (
              <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); setSearch(""); }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-sky-50 ${l.code === lang ? "bg-sky-50 text-sky-700 font-semibold" : "text-gray-700"}`}>
                <span className="text-base leading-none">{l.flag}</span>
                <span className="font-medium">{l.name}</span>
                <span className="ml-auto text-[10px] text-gray-400 uppercase">{l.code}</span>
              </button>
            ))}
            {filtered.length === 0 && <div className="px-3 py-4 text-center text-xs text-gray-400">No results</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("en");
  const [selCountry, setSelCountry] = useState("");
  const [selState, setSelState] = useState("");
  const [selCity, setSelCity] = useState("");
  const [selSector, setSelSector] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [nlName, setNlName] = useState("");
  const [nlEmail, setNlEmail] = useState("");
  const [nlSent, setNlSent] = useState(false);
  const [highlightedJob, setHighlightedJob] = useState<number | null>(null);
  const [filterPulse, setFilterPulse] = useState(false);
  const [prevJobCount, setPrevJobCount] = useState(0);
  const T = i18n[lang];
  const dir = LANGUAGES.find((l) => l.code === lang)?.dir || "ltr";

  const countriesSorted = useMemo(() => [...countries].sort((a, b) => getCountryName(a, lang).localeCompare(getCountryName(b, lang))), [lang]);
  const states = useMemo(() => { if (!selCountry) return []; return countries.find((c) => c.code === selCountry)?.states || []; }, [selCountry]);
  const cities = useMemo(() => { if (!selCountry || !selState) return []; const s = countries.find((c) => c.code === selCountry)?.states.find((s) => s.name === selState); return s?.cities || []; }, [selCountry, selState]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setFilterPulse(true);
    setTimeout(() => setFilterPulse(false), 600);
    try {
      const p = new URLSearchParams();
      if (selSector) p.set("sector", selSector);
      if (selCity) p.set("location", selCity);
      else if (selState) p.set("location", selState);
      else if (selCountry) { const c = countries.find((co) => co.code === selCountry); if (c) p.set("location", c.name); }
      const r = await fetch(`/api/jobs?${p.toString()}`);
      const data = await r.json();
      setJobs(data);
      setPrevJobCount(data.length);
    } catch { setJobs([]); }
    setLoading(false);
  }, [selSector, selCity, selState, selCountry]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const clearFilters = () => { setSelCountry(""); setSelState(""); setSelCity(""); setSelSector(""); };

  const removeCountry = () => { setSelCountry(""); setSelState(""); setSelCity(""); };
  const removeState = () => { setSelState(""); setSelCity(""); };
  const removeCity = () => setSelCity("");
  const removeSector = () => setSelSector("");

  const hasFilters = selCountry || selState || selCity || selSector;

  const getCountryLabel = () => {
    if (!selCountry) return "";
    const c = countries.find((co) => co.code === selCountry);
    return c ? `${c.flag} ${getCountryName(c, lang)}` : "";
  };

  const handleMapClick = (job: Job) => {
    setHighlightedJob(job.id);
    setTimeout(() => {
      document.getElementById(`job-${job.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    setTimeout(() => setHighlightedJob(null), 3000);
  };

  const handleSectorClick = (key: string) => {
    const newSector = selSector === key ? "" : key;
    setSelSector(newSector);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <WWLogo size={36} />
            <span className="hidden sm:block text-lg font-bold tracking-tight text-gray-900">W-W</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageDropdown lang={lang} setLang={setLang} />
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileMenu ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 sm:py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-sky-600/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="mb-6 animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/20 px-4 py-1.5 text-sm font-medium text-sky-300 backdrop-blur-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-sky-400 animate-pulse" />{T.statsJobs}: 12,450+
            </span>
          </div>
          <h1 className="animate-fade-in-up stagger-1 text-3xl sm:text-5xl font-black text-white leading-tight mb-4">{T.heroTitle}</h1>
          <p className="animate-fade-in-up stagger-2 mx-auto max-w-2xl text-base sm:text-lg text-gray-300">{T.heroSub}</p>
        </div>
      </section>

      {/* LOCATION SELECTOR */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <svg className="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {T.filterByLocation}
            </div>
            <select value={selCountry} onChange={(e) => { setSelCountry(e.target.value); setSelState(""); setSelCity(""); }} className="location-select custom-scrollbar rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 outline-none transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-100 cursor-pointer">
              <option value="">{T.allCountries}</option>
              {countriesSorted.map((c) => (<option key={c.code} value={c.code}>{c.flag} {getCountryName(c, lang)}</option>))}
            </select>
            <select value={selState} onChange={(e) => { setSelState(e.target.value); setSelCity(""); }} disabled={!selCountry} className="location-select custom-scrollbar rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 outline-none transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              <option value="">{selCountry ? T.allStates : T.selectCountry}</option>
              {states.map((s) => (<option key={s.name} value={s.name}>{s.name}</option>))}
            </select>
            <select value={selCity} onChange={(e) => setSelCity(e.target.value)} disabled={!selState} className="location-select custom-scrollbar rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 outline-none transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              <option value="">{selState ? T.allCities : T.selectState}</option>
              {cities.map((c) => (<option key={c.name} value={c.name}>{c.name}</option>))}
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="ml-auto flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 active:scale-95">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                {T.clearFilters}
              </button>
            )}
          </div>
          {/* Active Filter Chips */}
          {hasFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2 animate-fade-in-up">
              <span className="text-xs font-medium text-gray-400">{T.filterChip}</span>
              {selCountry && <FilterChip label={getCountryLabel()} onRemove={removeCountry} />}
              {selState && <FilterChip label={selState} onRemove={removeState} />}
              {selCity && <FilterChip label={selCity} onRemove={removeCity} />}
              {selSector && <FilterChip label={sectorNames[lang]?.[selSector] || selSector} onRemove={removeSector} />}
            </div>
          )}
        </div>
      </section>

      {/* SECTORS */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-sm font-bold text-gray-700">{T.sectors}</h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="flex gap-2 overflow-x-auto sector-scroll pb-1">
            <button onClick={() => handleSectorClick("")} className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${!selSector ? "bg-slate-800 text-white shadow-md scale-105" : "bg-white text-gray-600 border border-gray-200 hover:border-sky-300 hover:text-sky-600"}`}>{T.allSectors}</button>
            {SECTORS.map((s) => {
              const sName = sectorNames[lang]?.[s.key] || s.key;
              const active = selSector === s.key;
              return (
                <button key={s.key} onClick={() => handleSectorClick(s.key)} className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${active ? `bg-gradient-to-r ${s.color} text-white shadow-md scale-105` : "bg-white text-gray-600 border border-gray-200 hover:border-sky-300 hover:text-sky-600"}`}>
                  <span>{s.icon}</span><span>{sName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 sm:px-6 sm:grid-cols-4">
          <AnimatedCounter end={12450} suffix="+" label={T.statsJobs} />
          <AnimatedCounter end={3200} suffix="+" label={T.statsCompanies} />
          <AnimatedCounter end={85} suffix="+" label={T.statsCountries} />
          <AnimatedCounter end={45000} suffix="+" label={T.statsUsers} />
        </div>
      </section>

      {/* MAP */}
      <section id="map" className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">{T.exploreMap}</h2>
        <SimulatedMap jobs={jobs} onMarkerClick={handleMapClick} T={T} />
      </section>

      {/* JOBS */}
      <section id="jobs" className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{T.recentJobs}</h2>
          <div className="flex items-center gap-2">
            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-sky-500 animate-fade-in-up">
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                {T.filtering}
              </div>
            )}
            <span className={`text-sm transition-all duration-300 ${filterPulse ? "text-sky-500 font-bold scale-105" : "text-gray-500"}`}>{jobs.length} {T.results}</span>
          </div>
        </div>
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="shimmer h-5 w-20 rounded-full mb-3" />
                <div className="shimmer h-6 w-3/4 rounded mb-2" />
                <div className="shimmer h-4 w-1/2 rounded mb-4" />
                <div className="shimmer h-4 w-full rounded mb-2" />
                <div className="shimmer h-4 w-2/3 rounded" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-5xl">{"\uD83D\uDD0D"}</div>
            <h3 className="text-lg font-semibold text-gray-700">{T.noJobs}</h3>
            <p className="mt-1 text-sm text-gray-500">{T.noJobsSub}</p>
            {hasFilters && (<button onClick={clearFilters} className="mt-4 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 transition-colors active:scale-95">{T.clearFilters}</button>)}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, i) => (<JobCard key={`${job.id}-${selCountry}-${selState}-${selCity}-${selSector}`} job={job} index={i} lang={lang} highlighted={highlightedJob === job.id} />))}
          </div>
        )}
      </section>

      {/* NEWSLETTER */}
      <section id="newsletter" className="newsletter-gradient py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
          <div className="mb-4 inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm">
            <svg className="h-7 w-7 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{T.newsletter}</h2>
          <p className="mb-8 text-sky-200">{T.newsletterSub}</p>
          {!nlSent ? (
            <div className="mx-auto max-w-md space-y-3">
              <input type="text" value={nlName} onChange={(e) => setNlName(e.target.value)} placeholder={T.name} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-sky-200/60 outline-none backdrop-blur-sm transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30" />
              <input type="email" value={nlEmail} onChange={(e) => setNlEmail(e.target.value)} placeholder={T.email} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-sky-200/60 outline-none backdrop-blur-sm transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30" />
              <button onClick={() => { if (nlName && nlEmail) setNlSent(true); }} className="w-full rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all hover:bg-sky-400 hover:shadow-xl active:scale-[0.98]">{T.subscribe}</button>
            </div>
          ) : (
            <div className="animate-scale-in rounded-2xl bg-white/10 border border-white/20 px-6 py-8 backdrop-blur-sm">
              <div className="mb-3 text-4xl">{"\u2705"}</div>
              <p className="text-lg font-semibold text-white">{T.subscribed}</p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <WWLogo size={24} />
            <span className="text-sm text-gray-500">{T.footer}</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="transition-colors hover:text-sky-600">{T.privacy}</a>
            <a href="#" className="transition-colors hover:text-sky-600">{T.terms}</a>
            <a href="#" className="transition-colors hover:text-sky-600">{T.contact}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
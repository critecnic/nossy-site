"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Briefcase, Globe, ChevronDown, Lock, DollarSign, Building2, ExternalLink, Menu, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Job {
  id: number;
  title: string;
  company: string;
  companyUrl: string;
  location: string;
  country: string;
  lat: number;
  lng: number;
  salary: string;
  description: string;
  sector: string;
  posted: string;
  type: string;
}

type Lang = "en" | "pt" | "es" | "fr";

const i18n: Record<Lang, Record<string, string>> = {
  en: {
    tagline: "Your Gateway to Global Careers",
    sectorPlaceholder: "Job Sector or Position",
    locationPlaceholder: "Country, City or Zip Code",
    search: "Search Jobs",
    results: "results found",
    posted: "Posted",
    salary: "Salary",
    description: "Description",
    type: "Type",
    unlockTitle: "Unlock Company Data & Direct Apply",
    unlockDesc: "for $10 USD",
    payWithPaypal: "Pay with PayPal",
    mapTitle: "Job Locations",
    noResults: "No jobs found. Try a different search.",
    loading: "Searching opportunities worldwide...",
    allCountries: "All Countries",
    allSectors: "All Sectors",
  },
  pt: {
    tagline: "Seu Portal para Carreiras Globais",
    sectorPlaceholder: "Setor de Trabalho ou Cargo",
    locationPlaceholder: "País, Cidade ou Código Postal",
    search: "Buscar Vagas",
    results: "resultados encontrados",
    posted: "Publicada",
    salary: "Salário",
    description: "Descrição",
    type: "Tipo",
    unlockTitle: "Desbloqueie Dados da Empresa & Candidatura Direta",
    unlockDesc: "por $10 USD",
    payWithPaypal: "Pagar com PayPal",
    mapTitle: "Locais de Trabalho",
    noResults: "Nenhuma vaga encontrada. Tente outra busca.",
    loading: "Buscando oportunidades pelo mundo...",
    allCountries: "Todos os Países",
    allSectors: "Todos os Setores",
  },
  es: {
    tagline: "Tu Puerta a Carreras Globales",
    sectorPlaceholder: "Sector Laboral o Cargo",
    locationPlaceholder: "País, Ciudad o Código Postal",
    search: "Buscar Empleos",
    results: "resultados encontrados",
    posted: "Publicada",
    salary: "Salario",
    description: "Descripción",
    type: "Tipo",
    unlockTitle: "Desbloquea Datos de la Empresa & Postulación Directa",
    unlockDesc: "por $10 USD",
    payWithPaypal: "Pagar con PayPal",
    mapTitle: "Ubicaciones Laborales",
    noResults: "No se encontraron empleos. Intenta otra búsqueda.",
    loading: "Buscando oportunidades en todo el mundo...",
    allCountries: "Todos los Países",
    allSectors: "Todos los Sectores",
  },
  fr: {
    tagline: "Votre Porte vers des Carrières Mondiales",
    sectorPlaceholder: "Secteur d'Activité ou Poste",
    locationPlaceholder: "Pays, Ville ou Code Postal",
    search: "Rechercher",
    results: "résultats trouvés",
    posted: "Publié",
    salary: "Salaire",
    description: "Description",
    type: "Type",
    unlockTitle: "Débloquez les Données Entreprise & Candidature Directe",
    unlockDesc: "pour 10 $ USD",
    payWithPaypal: "Payer avec PayPal",
    mapTitle: "Lieux d'Emploi",
    noResults: "Aucun emploi trouvé. Essayez une autre recherche.",
    loading: "Recherche d'opportunités dans le monde...",
    allCountries: "Tous les Pays",
    allSectors: "Tous les Secteurs",
  },
};

/* ------------------------------------------------------------------ */
/*  Flag SVG Components                                                 */
/* ------------------------------------------------------------------ */
function FlagUSA({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 60 30">
      <clipPath id="us-clip"><rect width="60" height="30" rx="2" /></clipPath>
      <g clipPath="url(#us-clip)">
        <rect width="60" height="30" fill="#B22234" />
        <g fill="#FFF">
          {[6, 12, 18, 24, 30, 36, 42, 48, 54].map((y) => (
            <rect key={y} y={y} width="60" height="1.5" />
          ))}
        </g>
        <rect width="25" height="16" fill="#3C3B6E" />
        <g fill="#FFF" fontSize="3" fontFamily="serif">
          {Array.from({ length: 5 }).map((_, r) =>
            Array.from({ length: 6 }).map((_, c) => (
              <circle
                key={`${r}-${c}`}
                cx={c * 4 + 2}
                cy={r * 3.2 + 2}
                r="0.9"
              />
            ))
          )}
        </g>
      </g>
    </svg>
  );
}

function FlagBrazil({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 60 42">
      <clipPath id="br-clip"><rect width="60" height="42" rx="2" /></clipPath>
      <g clipPath="url(#br-clip)">
        <rect width="60" height="42" fill="#009B3A" />
        <polygon points="30,4 56,21 30,38 4,21" fill="#FEDF00" />
        <circle cx="30" cy="21" r="10" fill="#002776" />
        <path d="M 20,21 Q 30,16 40,21 Q 30,26 20,21" fill="#FFF" />
      </g>
    </svg>
  );
}

function FlagSpain({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.67} viewBox="0 0 60 40">
      <clipPath id="es-clip"><rect width="60" height="40" rx="2" /></clipPath>
      <g clipPath="url(#es-clip)">
        <rect width="60" height="40" fill="#AA151B" />
        <rect y="10" width="60" height="20" fill="#F1BF00" />
      </g>
    </svg>
  );
}

function FlagFrance({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.67} viewBox="0 0 60 40">
      <clipPath id="fr-clip"><rect width="60" height="40" rx="2" /></clipPath>
      <g clipPath="url(#fr-clip)">
        <rect width="20" height="40" fill="#002395" />
        <rect x="20" width="20" height="40" fill="#FFF" />
        <rect x="40" width="20" height="40" fill="#ED2939" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  W-W Logo SVG                                                       */
/* ------------------------------------------------------------------ */
function WWLogo() {
  return (
    <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="16" fill="#1E293B" />
      <path
        d="M22 68V32h8v36H22z"
        fill="#7DD3FC"
      />
      <path
        d="M50 68V32c12 0 22 8 22 18s-10 18-22 18zm8-28v20c7 0 14-4 14-10s-7-10-14-10z"
        fill="#FFFFFF"
      />
      <circle cx="78" cy="30" r="6" fill="#7DD3FC" opacity="0.7" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Simulated Map Component                                             */
/* ------------------------------------------------------------------ */
function SimulatedMap({
  jobs,
  activeJobId,
  onSelectJob,
}: {
  jobs: Job[];
  activeJobId: number | null;
  onSelectJob: (id: number) => void;
}) {
  /* Simple mercator-ish projection for visual only */
  const toXY = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x, y };
  };

  return (
    <div className="relative w-full h-full min-h-[300px] md:min-h-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden border border-slate-200">
      {/* Grid lines to simulate map */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748B" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {/* Simplified continent shapes */}
        <ellipse cx="22%" cy="38%" rx="8%" ry="18%" fill="#94A3B8" opacity="0.3" />
        <ellipse cx="48%" cy="32%" rx="6%" ry="14%" fill="#94A3B8" opacity="0.3" />
        <ellipse cx="52%" cy="60%" rx="5%" ry="16%" fill="#94A3B8" opacity="0.3" />
        <ellipse cx="78%" cy="35%" rx="10%" ry="12%" fill="#94A3B8" opacity="0.3" />
        <ellipse cx="85%" cy="65%" rx="5%" ry="8%" fill="#94A3B8" opacity="0.3" />
      </svg>

      {/* Map label */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 shadow-sm flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-sky-500" />
        Job Locations Map
      </div>

      {/* Markers */}
      {jobs.map((job) => {
        const { x, y } = toXY(job.lat, job.lng);
        const isActive = job.id === activeJobId;
        return (
          <button
            key={job.id}
            onClick={() => onSelectJob(job.id)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300 ${
              isActive ? "scale-125" : "hover:scale-110"
            }`}
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={`View job: ${job.title} in ${job.location}`}
          >
            <div
              className={`marker-bounce ${
                isActive
                  ? "bg-sky-500 shadow-lg shadow-sky-500/40"
                  : "bg-slate-700 hover:bg-sky-600 shadow-md"
              } w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-2 border-white transition-colors`}
            />
            {isActive && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-lg">
                {job.title}
              </div>
            )}
          </button>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-[10px] text-slate-500 shadow-sm">
        {jobs.length} {jobs.length === 1 ? "position" : "positions"} shown
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Job Card with Paywall                                                */
/* ------------------------------------------------------------------ */
function JobCard({ job, t }: { job: Job; t: Record<string, string> }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className="group relative bg-white rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card header band */}
      <div className="h-1 bg-gradient-to-r from-slate-800 to-sky-500" />

      <div className="p-5">
        {/* Sector badge + posted time */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-medium rounded-full">
            <Briefcase className="w-3 h-3" />
            {job.sector}
          </span>
          <span className="text-xs text-slate-400">{t.posted}: {job.posted}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-sky-600 transition-colors leading-tight">
          {job.title}
        </h3>

        {/* Salary - always visible */}
        <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 mb-3">
          <DollarSign className="w-4 h-4" />
          {job.salary}
        </div>

        {/* Description - always visible */}
        <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-3">
          {job.description}
        </p>

        {/* Location & Type - always visible */}
        <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {job.location}
          </span>
          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-500">{job.type}</span>
        </div>

        {/* BLURRED PAYWALL SECTION - Company & Contact */}
        <div className="relative rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
          {/* Blurred content behind */}
          <div className={`p-4 transition-filter duration-300 ${hovered ? "blur-[3px]" : "blur-[4px]"}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-300" />
              <div className="h-4 w-36 rounded bg-slate-300" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-300" />
              <div className="h-3 w-44 rounded bg-slate-300" />
            </div>
          </div>

          {/* Paywall overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-[1px] paywall-pulse">
            <div className="flex items-center gap-1.5 text-slate-600 mb-1.5">
              <Lock className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-bold uppercase tracking-wider">{t.unlockTitle}</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">{t.unlockDesc}</p>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFC439] hover:bg-[#F0B72E] text-slate-900 text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all duration-200"
              onClick={(e) => e.preventDefault()}
            >
              {/* PayPal logo simplified */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.654h6.328c2.352 0 4.02.606 4.953 1.802.456.575.746 1.17.875 1.797.136.66.136 1.458-.003 2.442l-.01.067v.584l.46.26c.396.226.708.487.94.784.398.51.654 1.16.762 1.932.111.796.074 1.743-.11 2.815-.213 1.232-.56 2.258-1.03 3.052a5.092 5.092 0 0 1-1.74 1.796c-.706.433-1.507.747-2.38.932-.856.182-1.82.274-2.864.274H9.38a.96.96 0 0 0-.948.814l-.714 4.512-.204 1.289a.507.507 0 0 1-.438.43z" fill="#003087"/>
                <path d="M20.464 9.163c-.014.09-.03.183-.048.278-.618 3.178-2.735 4.276-5.44 4.276h-1.377a.67.67 0 0 0-.662.566l-.7 4.428-.198 1.257a.352.352 0 0 0 .348.408h2.588c.29 0 .536-.211.581-.498l.025-.131.49-3.108.031-.17a.583.583 0 0 1 .575-.498h.39c2.522 0 4.498-1.024 5.074-3.989.241-1.238.117-2.272-.52-2.999a2.49 2.49 0 0 0-.717-.599z" fill="#0070E0"/>
                <path d="M19.29 8.766a6.07 6.07 0 0 0-.747-.165 9.37 9.37 0 0 0-1.513-.111h-4.314a.583.583 0 0 0-.575.498l-.925 5.86a.35.35 0 0 0 .345.405h2.578l.648-4.107a.583.583 0 0 1 .575-.498h.39c2.522 0 4.498-1.024 5.074-3.99.01-.049.018-.097.026-.144a3.37 3.37 0 0 0-.514-.248z" fill="#003087"/>
              </svg>
              {t.payWithPaypal}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Language Selector                                                    */
/* ------------------------------------------------------------------ */
function LanguageSelector({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
}) {
  const [open, setOpen] = useState(false);
  const flags: { code: Lang; Flag: React.FC<{ size?: number }>; label: string }[] = [
    { code: "en", Flag: FlagUSA, label: "English" },
    { code: "pt", Flag: FlagBrazil, label: "Português" },
    { code: "es", Flag: FlagSpain, label: "Español" },
    { code: "fr", Flag: FlagFrance, label: "Français" },
  ];
  const current = flags.find((f) => f.code === lang)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-sky-300 transition-colors shadow-sm"
        aria-label="Select language"
      >
        <current.Flag size={20} />
        <span className="text-sm font-medium text-slate-600 hidden sm:inline">{current.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
            {flags.map(({ code, Flag, label }) => (
              <button
                key={code}
                onClick={() => {
                  onChange(code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-sky-50 transition-colors ${
                  code === lang ? "bg-sky-50 text-sky-700 font-medium" : "text-slate-600"
                }`}
              >
                <Flag size={20} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                           */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  const [lang, setLang] = useState<Lang>("en");
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = i18n[lang];

  const fetchJobs = useCallback(async (s?: string, l?: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (s) params.set("sector", s);
      if (l) params.set("location", l);
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(sector, location);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ==================== HEADER ==================== */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <WWLogo />
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl tracking-tight leading-none">
                  W-W
                </span>
                <span className="text-sky-400 text-[10px] font-medium tracking-widest uppercase leading-none mt-0.5">
                  World of Work
                </span>
              </div>
            </div>

            {/* Desktop nav items */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                Find Jobs
              </a>
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                Companies
              </a>
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                Salary Guide
              </a>
              <a href="#" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                For Employers
              </a>
            </nav>

            {/* Right side: Lang selector + mobile menu */}
            <div className="flex items-center gap-3">
              <LanguageSelector lang={lang} onChange={setLang} />
              <button
                className="md:hidden p-2 text-slate-300 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile nav dropdown */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 border-t border-slate-800 pt-3 flex flex-col gap-2">
              {[
                { label: "Find Jobs", labelKey: "Find Jobs" },
                { label: "Companies", labelKey: "Companies" },
                { label: "Salary Guide", labelKey: "Salary Guide" },
                { label: "For Employers", labelKey: "For Employers" },
              ].map((item) => (
                <a
                  key={item.label}
                  href="#"
                  className="text-slate-300 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* ==================== HERO / SEARCH ==================== */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
            W-W
          </h1>
          <p className="text-sky-300 text-base md:text-lg font-medium mb-8">
            {t.tagline}
          </p>

          {/* Search form */}
          <form
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder={t.sectorPlaceholder}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-lg"
              />
            </div>
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t.locationPlaceholder}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-lg"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <Search className="w-4 h-4" />
              {t.search}
            </button>
          </form>
        </div>
      </section>

      {/* ==================== CONTENT ==================== */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Results count */}
          {searched && !loading && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{jobs.length}</span> {t.results}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Building2 className="w-3.5 h-3.5" />
                <span>W-W Verified</span>
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                    <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
                    <div className="h-6 w-3/4 bg-slate-200 rounded mb-3" />
                    <div className="h-4 w-40 bg-slate-200 rounded mb-4" />
                    <div className="h-3 w-full bg-slate-100 rounded mb-2" />
                    <div className="h-3 w-5/6 bg-slate-100 rounded mb-4" />
                    <div className="h-20 bg-slate-50 rounded-lg border border-slate-100" />
                  </div>
                ))}
              </div>
              <div className="lg:w-[420px] h-[500px] bg-slate-200 rounded-xl animate-pulse" />
            </div>
          )}

          {/* No results */}
          {!loading && searched && jobs.length === 0 && (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">{t.noResults}</p>
            </div>
          )}

          {/* Results: Cards + Map */}
          {!loading && jobs.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Job cards list */}
              <div className="flex-1 space-y-4 custom-scrollbar max-h-[800px] overflow-y-auto pr-1">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} t={t} />
                ))}
              </div>

              {/* Map sidebar */}
              <aside className="lg:w-[420px] flex-shrink-0">
                <div className="lg:sticky lg:top-24 h-[500px]">
                  <SimulatedMap
                    jobs={jobs}
                    activeJobId={activeJobId}
                    onSelectJob={setActiveJobId}
                  />
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <WWLogo />
                <span className="text-white font-bold text-lg">W-W</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                World of Work — Connecting talented professionals with global opportunities since 2024.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white text-sm font-semibold mb-3">For Job Seekers</h4>
              <ul className="space-y-2">
                {"Browse Jobs,Salary Guide,Career Advice,Resume Builder".split(",").map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-sky-400 text-xs transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-3">For Employers</h4>
              <ul className="space-y-2">
                {"Post a Job,Search Candidates,Pricing,Enterprise".split(",").map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-sky-400 text-xs transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-3">Company</h4>
              <ul className="space-y-2">
                {"About Us,Contact,Privacy Policy,Terms of Service".split(",").map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-sky-400 text-xs transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-500 text-xs">&copy; 2024 W-W (World of Work). All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="text-slate-500 text-xs">Available worldwide</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

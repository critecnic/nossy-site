"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { REGIONS } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, sectorNames, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import SiteLogo from "@/components/SiteLogo";
import LangSelector from "@/components/LangSelector";
import PaywallModal from "@/components/PaywallModal";

interface Job {
  id: number; title: string; company: string; companyUrl: string;
  location: string; country: string; countryName: string;
  salary: string; salaryMin: number; salaryMax: number;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  paywall: boolean; contactEmail: string;
}

const RN: Record<string, Record<string, string>> = {
  en: { europa: "Europe", asia: "Asia", eua: "United States" },
  "pt-br": { europa: "Europa", asia: "Ásia", eua: "Estados Unidos" },
  "pt-pt": { europa: "Europa", asia: "Ásia", eua: "Estados Unidos" },
  es: { europa: "Europa", asia: "Asia", eua: "Estados Unidos" },
  fr: { europa: "Europe", asia: "Asie", eua: "États-Unis" },
  de: { europa: "Europa", asia: "Asien", eua: "USA" },
  it: { europa: "Europa", asia: "Asia", eua: "Stati Uniti" },
  nl: { europa: "Europa", asia: "Azië", eua: "VS" },
  pl: { europa: "Europa", asia: "Azja", eua: "USA" },
  ru: { europa: "Европа", asia: "Азия", eua: "США" },
  zh: { europa: "欧洲", asia: "亚洲", eua: "美国" },
  ja: { europa: "ヨーロッパ", asia: "アジア", eua: "アメリカ" },
  ko: { europa: "유럽", asia: "아시아", eua: "미국" },
  hi: { europa: "यूरोप", asia: "एशिया", eua: "अमेरिका" },
  bn: { europa: "ইউরোপ", asia: "এশিয়া", eua: "যুক্তরাষ্ট্র" },
  ar: { europa: "أوروبا", asia: "آسيا", eua: "الولايات المتحدة" },
  tr: { europa: "Avrupa", asia: "Asya", eua: "ABD" },
  vi: { europa: "Châu Âu", asia: "Châu Á", eua: "Mỹ" },
  th: { europa: "ยุโรป", asia: "เอเชีย", eua: "อเมริกา" },
  ur: { europa: "یورپ", asia: "ایشیا", eua: "امریکہ" },
  tl: { europa: "Europa", asia: "Asia", eua: "USA" },
  sw: { europa: "Ulaya", asia: "Asia", eua: "Marekani" },
};

const TC: Record<string, string> = {
  Remoto: "bg-green-50 text-green-700 border-green-200",
  Hibrido: "bg-amber-50 text-amber-700 border-amber-200",
  Presencial: "bg-blue-50 text-blue-700 border-blue-200",
  Remote: "bg-green-50 text-green-700 border-green-200",
  Hybrid: "bg-amber-50 text-amber-700 border-amber-200",
  "On-site": "bg-blue-50 text-blue-700 border-blue-200",
};

const TYPE_LABELS: Record<string, Record<string, string>> = {
  en: { all: "All Types", Remoto: "Remote", Hibrido: "Hybrid", Presencial: "On-site", Remote: "Remote", Hybrid: "Hybrid", "On-site": "On-site" },
  "pt-br": { all: "Todos", Remoto: "Remoto", Hibrido: "Híbrido", Presencial: "Presencial" },
  "pt-pt": { all: "Todos", Remoto: "Remoto", Hibrido: "Híbrido", Presencial: "Presencial" },
  es: { all: "Todos", Remoto: "Remoto", Hibrido: "Híbrido", Presencial: "Presencial" },
  fr: { all: "Tous", Remoto: "Télétravail", Hibrido: "Hybride", Presencial: "Présentiel" },
  de: { all: "Alle", Remoto: "Remote", Hibrido: "Hybrid", Presencial: "Vor Ort" },
  it: { all: "Tutti", Remoto: "Remoto", Hibrido: "Ibrido", Presencial: "In Presenza" },
  nl: { all: "Alle", Remoto: "Op Afstand", Hibrido: "Hybride", Presencial: "Op Locatie" },
  pl: { all: "Wszystkie", Remoto: "Zdalnie", Hibrido: "Hybrydowo", Presencial: "Stacjonarnie" },
  ru: { all: "Все", Remoto: "Удалённо", Hibrido: "Гибрид", Presencial: "В Офисе" },
  zh: { all: "全部", Remoto: "远程", Hibrido: "混合", Presencial: "现场" },
  ja: { all: "すべて", Remoto: "リモート", Hibrido: "ハイブリッド", Presencial: "オフィス" },
  ko: { all: "모두", Remoto: "원격", Hibrido: "하이브리드", Presencial: "현장" },
  hi: { all: "सभी", Remoto: "रिमोट", Hibrido: "हाइब्रिड", Presencial: "ऑनसाइट" },
  bn: { all: "সব", Remoto: "দূরবর্তী", Hibrido: "হাইব্রিড", Presencial: "অনসাইট" },
  ar: { all: "الكل", Remoto: "عن بُعد", Hibrido: "هجين", Presencial: "في الموقع" },
  tr: { all: "Tümü", Remoto: "Uzaktan", Hibrido: "Hibrit", Presencial: "Yüz Yüze" },
  vi: { all: "Tất cả", Remoto: "Từ xa", Hibrido: "Linh hoạt", Presencial: "Tại chỗ" },
  th: { all: "ทั้งหมด", Remoto: "ระยะไกล", Hibrido: "ไฮบริด", Presencial: "ที่สำนักงาน" },
  ur: { all: "تمام", Remoto: "ریموٹ", Hibrido: "ہائبرڈ", Presencial: "ان سائٹ" },
  tl: { all: "Lahat", Remoto: "Remote", Hibrido: "Hybrid", Presencial: "On-site" },
  sw: { all: "Yote", Remoto: "Umbali", Hibrido: "Mseto", Presencial: "Mahali" },
};

const SECTOR_ICONS: Record<string, { icon: string; color: string }> = {
  "Software Engineering": { icon: "💻", color: "from-blue-500 to-cyan-400" },
  "Cloud & DevOps": { icon: "☁️", color: "from-sky-500 to-blue-400" },
  "Data Science & Analytics": { icon: "📊", color: "from-violet-500 to-purple-400" },
  "AI & Machine Learning": { icon: "🤖", color: "from-fuchsia-500 to-pink-400" },
  "Product Management": { icon: "📋", color: "from-amber-500 to-orange-400" },
  Cybersecurity: { icon: "🔒", color: "from-red-500 to-rose-400" },
  "Engineering Leadership": { icon: "👑", color: "from-purple-500 to-indigo-400" },
  Consulting: { icon: "🤝", color: "from-teal-500 to-cyan-400" },
  "Data Engineering": { icon: "🗄️", color: "from-indigo-500 to-blue-400" },
  "UX/UI & Design": { icon: "🎨", color: "from-pink-500 to-rose-400" },
  "QA & Testing": { icon: "✅", color: "from-green-500 to-emerald-400" },
  "Mobile Development": { icon: "📱", color: "from-blue-600 to-violet-400" },
  "Game Development": { icon: "🎮", color: "from-emerald-500 to-green-400" },
  "Specialized Development": { icon: "⚡", color: "from-yellow-500 to-amber-400" },
  "Embedded & IoT": { icon: "🔌", color: "from-stone-500 to-neutral-400" },
  "Writing & Content": { icon: "✍️", color: "from-lime-500 to-green-400" },
  "Sales & Marketing": { icon: "📢", color: "from-orange-500 to-red-400" },
  "Finance Technology": { icon: "💰", color: "from-emerald-600 to-green-500" },
  "IT Support & Operations": { icon: "🔧", color: "from-gray-500 to-slate-400" },
  "Research & Development": { icon: "🔬", color: "from-cyan-500 to-teal-400" },
  Other: { icon: "📂", color: "from-sky-400 to-blue-500" },
};
function sIcon(n: string) { return SECTOR_ICONS[n] || { icon: "📂", color: "from-sky-400 to-blue-500" }; }

const PW_TEXT: Record<string, { unlock: string; premium: string }> = {
  en: { unlock: 'Unlock Contact', premium: 'Premium' },
  "pt-br": { unlock: 'Desbloquear Contato', premium: 'Premium' },
  es: { unlock: 'Desbloquear', premium: 'Premium' },
  fr: { unlock: 'Débloquer', premium: 'Premium' },
  de: { unlock: 'Freischalten', premium: 'Premium' },
};

function salaryStr(j: Job): string {
  const S: Record<string, string> = { EUR: '€', USD: '$', GBP: '£', BRL: 'R$', INR: '₹', JPY: '¥', CNY: '¥', SGD: 'S$', KRW: '₩' };
  const mn = j.salaryMin || 0, mx = j.salaryMax || 0;
  if (!mn && !mx) return j.salary || '';
  const s = S[j.salaryCurrency] || j.salaryCurrency || '';
  const a = Math.round(mn).toLocaleString(), b = Math.round(mx).toLocaleString();
  if (j.salaryPeriod === 'year') return s + ' ' + a + ' - ' + b + '/yr';
  if (j.salaryPeriod === 'month') return s + ' ' + a + ' - ' + b + '/mo';
  return s + ' ' + a + ' - ' + b;
}

export default function CountryPage({ params }: { params: Promise<{ lang: string; slug: string; region: string; country: string }> }) {
  const { lang: langCode, region: rc, country: cc } = use(params);
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [countryName, setCountryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [page, setPage] = useState(1);
  const [paywallJob, setPaywallJob] = useState<Job | null>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const router = useRouter();
  const PER = 18;

  useEffect(() => {
    fetch("/data/countries.json").then(r => r.json()).then(setCountries).catch(() => {});
  }, []);

  useEffect(() => {
    if (!rc || !cc) return;
    setLoading(true); setDataError(false); setLoadProgress(10);
    fetch("/data/" + rc + "_" + cc + ".json")
      .then(r => { setLoadProgress(50); if (!r.ok) throw new Error('not found'); return r.json(); })
      .then((data: Job[]) => {
        setLoadProgress(90);
        setAllJobs(data || []);
        if (data && data.length > 0) setCountryName(data[0].countryName || countries.find((c: any) => c.slug === cc)?.name || cc);
        setLoadProgress(100);
        setLoading(false);
      })
      .catch(() => { setDataError(true); setLoading(false); });
  }, [rc, cc]);

  useEffect(() => {
    if (countryName || !cc || countries.length === 0) return;
    const m = countries.find((c: any) => c.slug === cc);
    if (m) setCountryName(m.name);
  }, [countries, cc, countryName]);

  const filtered = allJobs.filter(j => {
    if (typeFilter && typeFilter !== 'all' && j.type?.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (sectorFilter && sectorFilter !== 'all' && j.sector !== sectorFilter) return false;
    if (search) { const s = search.toLowerCase(); if (!j.title?.toLowerCase().includes(s) && !j.company?.toLowerCase().includes(s) && !j.sector?.toLowerCase().includes(s)) return false; }
    return true;
  });

  const actualTotal = filtered.length;
  const totalPages = Math.max(1, Math.ceil(actualTotal / PER));
  const paged = filtered.slice((page - 1) * PER, page * PER);
  const workTypes = [...new Set(allJobs.map(j => j.type).filter(Boolean))];
  const sectors = [...new Set(allJobs.map(j => j.sector).filter(Boolean))].sort();

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  const rName = RN[lang]?.[rc] || rc;
  const tl = TYPE_LABELS[lang] || TYPE_LABELS["en"];
  const pw = PW_TEXT[lang] || PW_TEXT["en"];
  const getTypeLabel = (t: string) => tl[t] || t;

  const goHome = useCallback(() => router.push("/" + lang + "/" + (LANG_SLUGS[lang] || "jobs")), [lang, router]);
  const goRegion = useCallback(() => router.push("/" + lang + "/" + (LANG_SLUGS[lang] || "jobs") + "/" + rc), [lang, router, rc]);

  useEffect(() => { setPage(1); }, [search, typeFilter, sectorFilter]);

  const hasActiveFilters = typeFilter || sectorFilter || search;
  function clearFilters() { setTypeFilter(""); setSectorFilter(""); setSearch(""); }

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <PaywallModal isOpen={!!paywallJob} onClose={() => setPaywallJob(null)}
        jobId={paywallJob?.id || 0} jobTitle={paywallJob?.title || ''} lang={lang} company={paywallJob?.company || ''} />

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onClick={goHome} className="hover:opacity-80 transition-opacity flex-shrink-0"><SiteLogo size={36} /></button>
            <button onClick={goHome} className="text-lg font-bold text-gray-900 tracking-tight hover:text-sky-600 transition-colors hidden sm:block">Work Versaly</button>
            <span className="text-gray-300 mx-1 hidden md:inline">/</span>
            <button onClick={goRegion} className="text-sky-600 font-semibold hover:underline hidden md:inline truncate">{rName}</button>
            <span className="text-gray-300 mx-1 hidden md:inline">/</span>
            <span className="text-gray-700 font-semibold hidden md:inline truncate">{countryName}</span>
          </div>
          <LangSelector lang={lang} switchLang={(l) => router.push("/" + l + "/" + LANG_SLUGS[l] + "/" + rc + "/" + cc)} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <button onClick={goHome} className="hover:text-sky-600 transition-colors">{T.backToHome}</button>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <button onClick={goRegion} className="hover:text-sky-600 transition-colors">{rName}</button>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-900 font-medium">{countryName || cc}</span>
        </nav>

        {/* TITLE */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">{T.jobsIn.replace("{0}", countryName || cc)}</h1>
          <p className="text-gray-500 mt-1">{actualTotal.toLocaleString()} {T.vacancies}</p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full sm:w-80 mb-5">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={T.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white" />
        </div>

        {/* TYPE FILTERS */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{T.filterByType}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTypeFilter("")}
              className={"px-4 py-2 rounded-full text-sm font-medium border transition-all " +
                (!typeFilter ? "bg-sky-500 text-white border-sky-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:bg-sky-50")}>
              {T.allWorkTypes}
            </button>
            {workTypes.map((t) => (
              <button key={t} onClick={() => setTypeFilter(typeFilter === t ? "" : t)}
                className={"px-4 py-2 rounded-full text-sm font-medium border transition-all " +
                  (typeFilter === t ? "bg-sky-500 text-white border-sky-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:bg-sky-50")}>
                {getTypeLabel(t)}
              </button>
            ))}
          </div>
        </div>

        {/* SECTOR FILTERS */}
        {sectors.length > 1 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{T.filterByCategory}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSectorFilter("")}
                className={"px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all " +
                  (!sectorFilter ? "bg-sky-500 text-white border-sky-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-sky-300")}>
                {T.allCategories}
              </button>
              {sectors.map((s) => {
                const si = sIcon(s);
                return (
                  <button key={s} onClick={() => setSectorFilter(sectorFilter === s ? "" : s)}
                    className={"px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 " +
                      (sectorFilter === s ? "bg-sky-500 text-white border-sky-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-sky-300")}>
                    <span>{si.icon}</span>
                    {sectorNames[lang]?.[s] || s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CLEAR FILTERS */}
        {hasActiveFilters && (
          <div className="mb-4 flex items-center gap-3">
            <span className="text-xs text-gray-500">{filtered.length} {T.vacancies}</span>
            <button onClick={clearFilters} className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              {T.allTypes || "Limpar filtros"}
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="space-y-4">
            <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-sky-500 h-1.5 rounded-full transition-all" style={{ width: loadProgress + '%' }} /></div>
            <p className="text-center text-sm text-gray-400">{T.loading}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="animate-pulse rounded-xl border border-gray-100 p-5"><div className="h-4 bg-gray-200 rounded w-1/3 mb-3" /><div className="h-5 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2 mb-3" /></div>))}
            </div>
          </div>
        ) : dataError ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-lg">{T.error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">Recarregar</button>
          </div>
        ) : actualTotal === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-medium text-gray-600">{T.noJobsFound}</p>
            <p className="text-sm mt-1">Tente ajustar seus filtros</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-4 px-5 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">
                {T.allTypes || "Limpar filtros"}
              </button>
            )}
          </div>
        ) : (<>
          <p className="text-sm text-gray-500 mb-4">{T.showing.replace("{0}", String((page - 1) * PER + 1)).replace("{1}", String(Math.min(page * PER, actualTotal))).replace("{2}", actualTotal.toLocaleString())}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{paged.map((job) => {
            const m = sIcon(job.sector); const sn = sectorNames[lang]?.[job.sector] || job.sector; const tc = TC[job.type] || "bg-gray-50 text-gray-700 border-gray-200";
            return (
              <article key={job.id} className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-gray-100">
                <div className={"h-1.5 w-full bg-gradient-to-r " + m.color} />
                {job.paywall && <div className="absolute top-3 right-3 z-10"><span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200 shadow-sm">{pw.premium}</span></div>}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{getTypeLabel(job.type)}</span>
                    <span className="text-xs text-gray-400">{job.posted}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-sky-600 transition-colors">{job.title}</h3>
                  <p className="text-xs font-medium text-gray-600 mb-1">{job.company}</p>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-1">{job.location}</p>
                  <div className="flex items-center gap-2 text-xs mb-2"><span className="font-bold text-sky-600">{salaryStr(job)}</span></div>
                  <div className="mb-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sn}</span></div>
                  {job.paywall ? (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-2 line-clamp-1">{job.description || ''}</p>
                      <button onClick={() => setPaywallJob(job)} className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm flex items-center justify-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        {pw.unlock}
                      </button>
                    </div>
                  ) : (<>
                    {job.description && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{job.description}</p>}
                    {job.companyUrl && <a href={job.companyUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors">
                      {T.applyNow}<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>}
                  </>)}
                </div></article>
            );
          })}</div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{T.prevPage}</button>
              <span className="text-sm text-gray-600">{T.pageOf.replace("{0}", String(page)).replace("{1}", String(totalPages))}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{T.nextPage}</button>
            </div>
          )}
        </>)}
      </main>

      <footer className="bg-gray-900 text-white py-10 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3"><SiteLogo size={30} /><span className="font-bold text-lg">Work Versaly</span></div>
            <p className="text-gray-400 text-sm">{T.footerText}</p>
          </div>
        </div>
      </footer>
    </div>);
}
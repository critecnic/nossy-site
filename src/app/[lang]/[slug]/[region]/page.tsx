"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { REGIONS } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, sectorNames, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import SiteLogo from "@/components/SiteLogo";

interface CountryInfo { name: string; slug: string; region: string; count: number; }
interface Job {
  id: number; title: string; company: string; companyUrl: string;
  location: string; country: string; countryName: string;
  salary: string; description: string; sector: string; posted: string; type: string;
  paywall: boolean; salaryMin: number; salaryMax: number;
  salaryCurrency: string; salaryPeriod: string; contactEmail: string;
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

const CF: Record<string, string> = {
  "united-kingdom": "🇬🇧", "germany": "🇩🇪", "france": "🇫🇷",
  "sweden": "🇸🇪", "spain": "🇪🇸", "netherlands": "🇳🇱",
  "ireland": "🇮🇪", "switzerland": "🇨🇭", "italy": "🇮🇹",
  "belgium": "🇧🇪", "denmark": "🇩🇰", "norway": "🇳🇴",
  "finland": "🇫🇮", "austria": "🇦🇹", "poland": "🇵🇱",
  "portugal": "🇵🇹", "czech-republic": "🇨🇿", "romania": "🇷🇴",
  "greece": "🇬🇷", "hungary": "🇭🇺", "india": "🇮🇳",
  "china": "🇨🇳", "japao": "🇯🇵", "singapore": "🇸🇬",
  "south-korea": "🇰🇷", "hong-kong": "🇭🇰", "taiwan": "🇹🇼",
  "united-states": "🇺🇸", "remoto-global": "🌍",
};

const TC: Record<string, string> = {
  Remoto: "bg-green-50 text-green-700", Hibrido: "bg-amber-50 text-amber-700", Presencial: "bg-blue-50 text-blue-700",
  Remote: "bg-green-50 text-green-700", Hybrid: "bg-amber-50 text-amber-700", "On-site": "bg-blue-50 text-blue-700",
};

const CM: Record<string, { icon: string; color: string }> = {
  "Software Engineering": { icon: "💻", color: "from-blue-500 to-cyan-400" },
  "Cloud & DevOps": { icon: "☁️", color: "from-sky-500 to-blue-400" },
  "Data Science & Analytics": { icon: "📊", color: "from-violet-500 to-purple-400" },
  "AI & Machine Learning": { icon: "🤖", color: "from-fuchsia-500 to-pink-400" },
  "Product Management": { icon: "📋", color: "from-amber-500 to-orange-400" },
  "Cybersecurity": { icon: "🔒", color: "from-red-500 to-rose-400" },
  "Engineering Leadership": { icon: "👑", color: "from-purple-500 to-indigo-400" },
  "Consulting": { icon: "🤝", color: "from-teal-500 to-cyan-400" },
  "Data Engineering": { icon: "🗂️", color: "from-indigo-500 to-blue-400" },
  "UX/UI & Design": { icon: "🎨", color: "from-pink-500 to-rose-400" },
  "QA & Testing": { icon: "✅", color: "from-green-500 to-emerald-400" },
  "Mobile Development": { icon: "📱", color: "from-blue-600 to-violet-400" },
  "Game Development": { icon: "🎮", color: "from-emerald-500 to-green-400" },
  "Specialized Development": { icon: "⚡", color: "from-yellow-500 to-amber-400" },
  "Embedded & IoT": { icon: "🔌", color: "from-stone-500 to-neutral-400" },
  "Writing & Content": { icon: "✍️", color: "from-lime-500 to-green-400" },
  "Sales & Marketing": { icon: "📢", color: "from-orange-500 to-red-400" },
  "Finance Technology": { icon: "💰", color: "from-emerald-600 to-green-500" },
  "IT Support & Operations": { icon: "🛠️", color: "from-gray-500 to-slate-400" },
  "Research & Development": { icon: "🔬", color: "from-cyan-500 to-teal-400" },
  Other: { icon: "📂", color: "from-sky-400 to-blue-500" },
};

function cmf(n: string) { return CM[n] || { icon: "📂", color: "from-sky-400 to-blue-500" }; }

function LangSelector({ lang, switchLang }: { lang: Lang; switchLang: (l: Lang) => void }) {
  return (
    <select
      value={lang}
      onChange={(e) => switchLang(e.target.value as Lang)}
      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent cursor-pointer shadow-sm hover:border-sky-300 transition-colors"
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.flag} {l.name}
        </option>
      ))}
    </select>
  );
}

export default function RegionPage({ params }: { params: Promise<{ lang: string; slug: string; region: string }> }) {
  const [lang, setLang] = useState<Lang>("en");
  const [rc, setRc] = useState("");
  const [regionCountries, setRegionCountries] = useState<CountryInfo[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actualTotal, setActualTotal] = useState(0);
  const router = useRouter();

  useEffect(() => { params.then((p) => { setLang((LANGUAGES.find(l => l.code === p.lang)?.code || "en") as Lang); setRc(p.region); }); }, [params]);

  useEffect(() => {
    if (!rc) return; setLoading(true);
    Promise.all([
      fetch("/api/jobs?action=countries").then(r => r.json()),
      fetch("/api/jobs?region=" + rc + "&page=" + page + "&limit=18" + (search ? "&search=" + encodeURIComponent(search) : "")).then(r => r.json()),
    ]).then(([cd, jd]) => {
      const ac = (cd.countries || []).filter((c: CountryInfo) => c.region === rc).sort((a: CountryInfo, b: CountryInfo) => b.count - a.count);
      setRegionCountries(ac); setJobs(jd.jobs || []); setTotalPages(jd.totalPages || 1); setActualTotal(jd.actualTotal || 0); setLoading(false);
    }).catch(() => setLoading(false));
  }, [rc, page, search]);

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  const rCfg = REGIONS.find(r => r.code === rc);
  const rName = RN[lang]?.[rc] || rc;
  const PER = 18;

  function switchLang(l: Lang) { router.push("/" + l + "/" + LANG_SLUGS[l] + "/" + rc); }
  function goCountry(s: string) { router.push("/" + lang + "/" + LANG_SLUGS[lang] + "/" + rc + "/" + s); }
  function goHome() { router.push("/" + lang + "/" + LANG_SLUGS[lang]); }

  return (
    <div className={isRtl ? "rtl" : "ltr"} dir={isRtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goHome} className="hover:opacity-80 transition-opacity"><SiteLogo size={38} /></button>
            <button onClick={goHome} className="text-xl font-bold text-gray-900 tracking-tight hover:text-sky-600 transition-colors">Work Versaly</button>
            <span className="text-gray-300 mx-2 hidden sm:inline">/</span>
            <span className="text-sky-600 font-semibold hidden sm:inline">{rName}</span>
          </div>
          <LangSelector lang={lang} switchLang={switchLang} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={goHome} className="hover:text-sky-600 transition-colors">{T.backToHome}</button>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-900 font-medium">{rName}</span>
        </nav>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div><h1 className="text-3xl font-extrabold text-gray-900">{rCfg?.flag} {rName}</h1><p className="text-gray-500 mt-1">{(rCfg?.jobCount || actualTotal).toLocaleString()}+ {T.vacancies}</p></div>
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={T.searchPlaceholder} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{T.browseByCountry}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {regionCountries.map((c) => (
              <button key={c.slug} onClick={() => goCountry(c.slug)} className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-sky-200 hover:shadow-md transition-all text-left">
                <span className="text-2xl">{CF[c.slug] || "🏳️"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate group-hover:text-sky-600 transition-colors">{c.name}</p>
                  <p className="text-xs font-bold text-sky-600">{c.count.toLocaleString()} {T.jobCount}</p>
                </div>
              </button>))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{T.exploreJobs}</h2>
            {actualTotal > 0 && <span className="text-sm text-gray-500">{T.showing.replace("{0}", "1").replace("{1}", String(Math.min(PER, actualTotal))).replace("{2}", actualTotal.toLocaleString())}</span>}
          </div>
          {loading ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="animate-pulse rounded-xl border border-gray-100 p-5"><div className="h-4 bg-gray-200 rounded w-1/3 mb-3" /><div className="h-5 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>))}</div>
          ) : jobs.length === 0 ? (<div className="text-center py-16 text-gray-400"><p className="text-4xl mb-3">🔍</p><p>{T.noJobsFound}</p></div>
          ) : (<>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{jobs.map((job) => {
              const m = cmf(job.sector); const sn = sectorNames[lang]?.[job.sector] || job.sector; const tc = TC[job.type] || "bg-gray-50 text-gray-700";
              return (<article key={job.id} className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all border-gray-100">
                <div className={"h-1 w-full bg-gradient-to-r " + m.color} />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2"><span className={"rounded-full px-2.5 py-0.5 text-xs font-medium " + tc}>{job.type}</span><span className="text-xs text-gray-400">{job.posted}</span></div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">{job.title}</h3>
                  <p className="text-xs font-medium text-gray-600 mb-2">{job.company}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500"><span>{job.location}</span><span className="text-gray-300">|</span><span className="font-medium text-sky-600">{job.salary}</span></div>
                  <div className="mt-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sn}</span></div>
                </div></article>);
            })}</div>
            {totalPages > 1 && (<div className="flex items-center justify-center gap-3 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">{T.prevPage}</button>
              <span className="text-sm text-gray-600">{T.pageOf.replace("{0}", String(page)).replace("{1}", String(totalPages))}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">{T.nextPage}</button>
            </div>)}
          </>)}
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3"><SiteLogo size={30} /><span className="font-bold text-lg">Work Versaly</span></div>
            <p className="text-gray-400 text-sm">{T.footerText}</p>
          </div>
        </div>
      </footer>
    </div>);
}
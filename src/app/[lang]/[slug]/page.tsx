"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { REGIONS, TOTAL_JOBS } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, sectorNames, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import SiteLogo from "@/components/SiteLogo";

interface Job {
  id: number; title: string; company: string; companyUrl: string;
  location: string; country: string; countryName: string;
  salary: string; description: string; sector: string; posted: string; type: string; paywall: boolean;
}
interface CountryInfo { name: string; slug: string; region: string; count: number; }

const CM: Record<string, { icon: string; color: string }> = {
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
  "IT Support & Operations": { icon: "🛠️", color: "from-gray-500 to-slate-400" },
  "Research & Development": { icon: "🔬", color: "from-cyan-500 to-teal-400" },
  Other: { icon: "📂", color: "from-sky-400 to-blue-500" },
};
function cm(n: string) { return CM[n] || { icon: "📂", color: "from-sky-400 to-blue-500" }; }

const TC: Record<string, string> = {
  Remoto: "bg-green-50 text-green-700", Hibrido: "bg-amber-50 text-amber-700", Presencial: "bg-blue-50 text-blue-700",
  Remote: "bg-green-50 text-green-700", Hybrid: "bg-amber-50 text-amber-700", "On-site": "bg-blue-50 text-blue-700",
};

const FLAGS: Record<string, string> = {
  "united-kingdom": "🇬🇧", "germany": "🇩🇪", "france": "🇫🇷", "sweden": "🇸🇪", "spain": "🇪🇸", "netherlands": "🇳🇱",
  "ireland": "🇮🇪", "switzerland": "🇨🇭", "italy": "🇮🇹",
  "belgium": "🇧🇪", "denmark": "🇩🇰", "norway": "🇳🇴", "finland": "🇫🇮", "austria": "🇦🇹", "poland": "🇵🇱",
  "portugal": "🇵🇹", "czech-republic": "🇨🇿", "romania": "🇷🇴", "greece": "🇬🇷", "hungary": "🇭🇺",
  "india": "🇮🇳", "china": "🇨🇳", "japao": "🇯🇵", "singapore": "🇸🇬", "south-korea": "🇰🇷", "hong-kong": "🇭🇰", "taiwan": "🇹🇼",
  "united-states": "🇺🇸", "remoto-global": "🌍",
};

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
function LS({ lang, switchLang }: { lang: Lang; switchLang: (l: Lang) => void }) {
  return (<select value={lang} onChange={(e) => switchLang(e.target.value as Lang)} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent cursor-pointer shadow-sm hover:border-sky-300 transition-colors">
    {LANGUAGES.map((l) => (<option key={l.code} value={l.code}>{l.flag} {l.name}</option>))}
  </select>);
}
export default function HomePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: langCode } = use(params);
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const [latest, setLatest] = useState<Job[]>([]);
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/data/latest_20.json").then(r => r.json()),
      fetch("/data/countries.json").then(r => r.json()),
    ]).then(([j, c]) => { setLatest(j || []); setCountries(c || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  function goRegion(r: string) { router.push("/" + lang + "/" + LANG_SLUGS[lang] + "/" + r); }
  function goCountry(r: string, c: string) { router.push("/" + lang + "/" + LANG_SLUGS[lang] + "/" + r + "/" + c); }

  const byRegion: Record<string, CountryInfo[]> = {};
  for (const c of countries) { if (!byRegion[c.region]) byRegion[c.region] = []; byRegion[c.region].push(c); }

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3"><SiteLogo size={38} /><span className="text-xl font-bold text-gray-900 tracking-tight">Work Versaly</span></div>
          <LS lang={lang} switchLang={(l) => router.push("/" + l + "/" + LANG_SLUGS[l])} />
        </div>
      </header>
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">{T.heroTitle}</h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-8">{T.heroSubtitle}</p>
          <div className="flex items-center justify-center gap-6 text-blue-100 text-sm">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />{TOTAL_JOBS.toLocaleString()}+ {T.vacancies}</span>
            <span>58 {T.countries}</span><span>3 {T.allRegions}</span>
          </div>
        </div>
      </section>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{T.browseByRegion}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {REGIONS.map((r) => (
              <button key={r.code} onClick={() => goRegion(r.code)} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm hover:shadow-lg hover:border-sky-200 transition-all duration-300">
                <div className={"absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity " + cm(r.topCategories?.[0]?.name || "Other").color} />
                <div className="relative">
                  <span className="text-3xl mb-3 block">{r.flag}</span>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{RN[lang]?.[r.code] || r.name}</h3>
                  <p className="text-2xl font-extrabold text-sky-600">{r.jobCount.toLocaleString()}+</p>
                  <p className="text-sm text-gray-500 mt-1">{T.vacancies}</p>
                  {byRegion[r.code] && <p className="text-xs text-gray-400 mt-2">{byRegion[r.code].length} {T.countries}</p>}
                </div>
              </button>))}
          </div>
        </section>
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{T.latestJobs}</h2>
            <button onClick={() => goRegion("europa")} className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center gap-1">{T.viewAllJobs}<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
          </div>
          {loading ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => (<div key={i} className="animate-pulse rounded-xl border border-gray-100 p-5"><div className="h-4 bg-gray-200 rounded w-1/3 mb-3" /><div className="h-5 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2 mb-3" /><div className="h-3 bg-gray-200 rounded w-full" /></div>))}</div>
          ) : (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{latest.slice(0, 20).map((job) => {
            const m = cm(job.sector); const tc = TC[job.type] || "bg-gray-50 text-gray-700";
            return (<article key={job.id} className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all border-gray-100">
              <div className={"h-1 w-full bg-gradient-to-r " + m.color} />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2"><span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{job.type}</span><span className="text-xs text-gray-400">{job.posted}</span></div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">{job.title}</h3>
                <p className="text-xs font-medium text-gray-600 mb-2">{job.company}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500"><span>{job.location}</span><span className="text-gray-300">|</span><span className="font-medium text-sky-600">{job.salary}</span></div>
                <div className="mt-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sectorNames[lang]?.[job.sector] || job.sector}</span></div>
              </div></article>);
          })}</div>)}
        </section>
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{T.browseByCountry}</h2>
          {loading ? (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">{Array.from({ length: 12 }).map((_, i) => (<div key={i} className="animate-pulse h-20 rounded-xl bg-gray-100" />))}</div>
          ) : (<div className="space-y-8">{REGIONS.map((region) => {
            const rc = byRegion[region.code] || []; if (!rc.length) return null;
            return (<div key={region.code}><h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2"><span>{region.flag}</span> {RN[lang]?.[region.code] || region.name}<span className="text-sm font-normal text-gray-400">({rc.length} {T.countries})</span></h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">{rc.sort((a, b) => b.count - a.count).map((c) => (<button key={c.slug} onClick={() => goCountry(region.code, c.slug)} className="group flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-100 bg-white hover:border-sky-200 hover:shadow-md transition-all">
                <span className="text-2xl">{FLAGS[c.slug] || "🏳️"}</span>
                <span className="text-xs font-medium text-gray-800 text-center leading-tight line-clamp-2 group-hover:text-sky-600 transition-colors">{c.name}</span>
                <span className="text-xs font-bold text-sky-600">{c.count.toLocaleString()}</span>
              </button>))}</div></div>);
          })}</div>)}
        </section>
      </main>
      <footer className="bg-gray-900 text-white py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3"><SiteLogo size={30} /><span className="font-bold text-lg">Work Versaly</span></div>
            <p className="text-gray-400 text-sm">{T.footerText}</p>
            <div className="flex items-center gap-4 text-gray-400 text-xs"><span>{TOTAL_JOBS.toLocaleString()}+ {T.vacancies}</span><span>|</span><span>58 {T.countries}</span></div>
          </div>
        </div>
      </footer>
    </div>);
}

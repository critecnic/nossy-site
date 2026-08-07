"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { REGIONS, TOTAL_JOBS } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, sectorNames, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import SiteLogo from "@/components/SiteLogo";
import LangSelector from "@/components/LangSelector";

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
  "IT Support & Operations": { icon: "🔧", color: "from-gray-500 to-slate-400" },
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

export default function HomePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: langCode } = use(params);
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const [latest, setLatest] = useState<Job[]>([]);
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true); setDataError(false);
    Promise.all([
      fetch("/data/latest_20.json").then(r => { if (!r.ok) throw new Error('fetch error'); return r.json(); }),
      fetch("/data/countries.json").then(r => { if (!r.ok) throw new Error('fetch error'); return r.json(); }),
    ]).then(([j, c]) => { setLatest(j || []); setCountries(c || []); setLoading(false); })
      .catch(() => { setDataError(true); setLoading(false); });
  }, []);

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  function goRegion(r: string) { router.push("/" + lang + "/" + LANG_SLUGS[lang] + "/" + r); }
  function goCountry(r: string, c: string) { router.push("/" + lang + "/" + LANG_SLUGS[lang] + "/" + r + "/" + c); }

  const byRegion: Record<string, CountryInfo[]> = {};
  for (const c of countries) { if (!byRegion[c.region]) byRegion[c.region] = []; byRegion[c.region].push(c); }

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push("/" + lang + "/" + LANG_SLUGS[lang])} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <SiteLogo size={38} />
            <span className="text-xl font-bold text-gray-900 tracking-tight">Work Versaly</span>
          </button>
          <LangSelector lang={lang} switchLang={(l) => router.push("/" + l + "/" + LANG_SLUGS[l])} />
        </div>
      </header>

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 leading-tight drop-shadow-lg">{T.heroTitle}</h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10">{T.heroSubtitle}</p>
          <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-3 text-blue-100 text-sm">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" /><strong>{TOTAL_JOBS.toLocaleString()}+</strong> {T.vacancies}</span>
            <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg><strong>58</strong> {T.countries}</span>
            <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg><strong>3</strong> {T.allRegions}</span>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* REGIONS */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{T.browseByRegion}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {REGIONS.map((r) => (
              <button key={r.code} onClick={() => goRegion(r.code)} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm hover:shadow-xl hover:border-sky-200 transition-all duration-300">
                <div className={"absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity " + cm(r.topCategories?.[0]?.name || "Other").color} />
                <div className="relative">
                  <span className="text-4xl mb-3 block">{r.flag}</span>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{RN[lang]?.[r.code] || r.name}</h3>
                  <p className="text-3xl font-extrabold text-sky-600">{r.jobCount.toLocaleString()}+</p>
                  <p className="text-sm text-gray-500 mt-1">{T.vacancies}</p>
                  {byRegion[r.code] && <p className="text-xs text-gray-400 mt-2">{byRegion[r.code].length} {T.countries}</p>}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* LATEST JOBS */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{T.latestJobs}</h2>
            <button onClick={() => goRegion("europa")} className="text-sky-600 hover:text-sky-700 text-sm font-semibold flex items-center gap-1 group">
              {T.viewAllJobs}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {dataError ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">⚠️</p>
              <p>{T.error}</p>
              <button onClick={() => window.location.reload()} className="mt-3 text-sky-600 font-medium text-sm hover:underline">Recarregar</button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-100 p-5">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latest.slice(0, 20).map((job) => {
                const m = cm(job.sector); const tc = TC[job.type] || "bg-gray-50 text-gray-700";
                return (
                  <article key={job.id} className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all border-gray-100">
                    <div className={"h-1 w-full bg-gradient-to-r " + m.color} />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{job.type}</span>
                        <span className="text-xs text-gray-400">{job.posted}</span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">{job.title}</h3>
                      <p className="text-xs font-medium text-gray-600 mb-2">{job.company}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{job.location}</span>
                        <span className="text-gray-300">|</span>
                        <span className="font-medium text-sky-600">{job.salary}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sectorNames[lang]?.[job.sector] || job.sector}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* COUNTRIES */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{T.browseByCountry}</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (<div key={i} className="animate-pulse h-24 rounded-xl bg-gray-100" />))}
            </div>
          ) : (
            <div className="space-y-8">
              {REGIONS.map((region) => {
                const rc = byRegion[region.code] || []; if (!rc.length) return null;
                return (
                  <div key={region.code}>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="text-xl">{region.flag}</span>
                      {RN[lang]?.[region.code] || region.name}
                      <span className="text-sm font-normal text-gray-400">({rc.length} {T.countries})</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {rc.sort((a, b) => b.count - a.count).map((c) => (
                        <button key={c.slug} onClick={() => goCountry(region.code, c.slug)} className="group flex flex-col items-center gap-1.5 p-4 rounded-xl border border-gray-100 bg-white hover:border-sky-200 hover:shadow-lg transition-all">
                          <span className="text-3xl">{FLAGS[c.slug] || "🏳️"}</span>
                          <span className="text-xs font-medium text-gray-800 text-center leading-tight line-clamp-2 group-hover:text-sky-600 transition-colors">{c.name}</span>
                          <span className="text-xs font-bold text-sky-600">{c.count.toLocaleString()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-10 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SiteLogo size={30} />
              <span className="font-bold text-lg">Work Versaly</span>
            </div>
            <p className="text-gray-400 text-sm">{T.footerText}</p>
            <div className="flex items-center gap-4 text-gray-400 text-xs">
              <span>{TOTAL_JOBS.toLocaleString()}+ {T.vacancies}</span>
              <span className="text-gray-600">|</span>
              <span>58 {T.countries}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
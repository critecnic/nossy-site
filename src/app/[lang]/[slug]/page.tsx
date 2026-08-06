"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { REGIONS, TOTAL_JOBS } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, sectorNames, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import SiteLogo from "@/components/SiteLogo";

interface Job {
  id: number; title: string; company: string; companyUrl: string;
  location: string; country: string; countryName: string;
  salary: string; salaryMin: number; salaryMax: number;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  contactEmail: string; paywall: boolean;
}

interface CountryInfo {
  name: string; slug: string; region: string; count: number;
}

const CATEGORIES_META: Record<string, { icon: string; color: string }> = {
  "Software Engineering": { icon: "💻", color: "from-blue-500 to-cyan-400" },
  "Cloud & DevOps": { icon: "☁️", color: "from-sky-500 to-blue-400" },
  "Data Science & Analytics": { icon: "📊", color: "from-violet-500 to-purple-400" },
  "AI & Machine Learning": { icon: "🤖", color: "from-fuchsia-500 to-pink-400" },
  "Product Management": { icon: "📋", color: "from-amber-500 to-orange-400" },
  "Cybersecurity": { icon: "🔒", color: "from-red-500 to-rose-400" },
  "Engineering Leadership": { icon: "👑", color: "from-purple-500 to-indigo-400" },
  "Consulting": { icon: "🤝", color: "from-teal-500 to-cyan-400" },
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
  "Other": { icon: "📂", color: "from-sky-400 to-blue-500" },
};

function getCatMeta(name: string) {
  return CATEGORIES_META[name] || { icon: "📂", color: "from-sky-400 to-blue-500" };
}

const REGION_NAMES: Record<string, Record<string, string>> = {
  "en": { "europa": "Europe", "asia": "Asia", "eua": "United States" },
  "pt-br": { "europa": "Europa", "asia": "Ásia", "eua": "Estados Unidos" },
  "pt-pt": { "europa": "Europa", "asia": "Ásia", "eua": "Estados Unidos" },
  "es": { "europa": "Europa", "asia": "Asia", "eua": "Estados Unidos" },
  "fr": { "europa": "Europe", "asia": "Asie", "eua": "États-Unis" },
  "de": { "europa": "Europa", "asia": "Asien", "eua": "USA" },
  "it": { "europa": "Europa", "asia": "Asia", "eua": "Stati Uniti" },
  "nl": { "europa": "Europa", "asia": "Azië", "eua": "VS" },
  "pl": { "europa": "Europa", "asia": "Azja", "eua": "USA" },
  "ru": { "europa": "Европа", "asia": "Азия", "eua": "США" },
  "zh": { "europa": "欧洲", "asia": "亚洲", "eua": "美国" },
  "ja": { "europa": "ヨーロッパ", "asia": "アジア", "eua": "アメリカ" },
  "ko": { "europa": "유럽", "asia": "아시아", "eua": "미국" },
  "hi": { "europa": "यूरोप", "asia": "एशिया", "eua": "अमेरिका" },
  "bn": { "europa": "ইউরোপ", "asia": "এশিয়া", "eua": "যুক্তরাষ্ট্র" },
  "ar": { "europa": "أوروبا", "asia": "آسيا", "eua": "الولايات المتحدة" },
  "tr": { "europa": "Avrupa", "asia": "Asya", "eua": "ABD" },
  "vi": { "europa": "Châu Âu", "asia": "Châu Á", "eua": "Mỹ" },
  "th": { "europa": "ยุโรป", "asia": "เอเชีย", "eua": "อเมริกา" },
  "ur": { "europa": "یورپ", "asia": "ایشیا", "eua": "امریکہ" },
  "tl": { "europa": "Europa", "asia": "Asia", "eua": "USA" },
  "sw": { "europa": "Ulaya", "asia": "Asia", "eua": "Marekani" },
};

const REGION_FLAGS: Record<string, string> = { "europa": "🇪🇺", "asia": "🇨🇳", "eua": "🇺🇸" };

const TYPE_COLORS: Record<string, string> = {
  "Remoto": "bg-green-50 text-green-700 border-green-200",
  "Hibrido": "bg-amber-50 text-amber-700 border-amber-200",
  "Presencial": "bg-blue-50 text-blue-700 border-blue-200",
  "Remote": "bg-green-50 text-green-700 border-green-200",
  "Hybrid": "bg-amber-50 text-amber-700 border-amber-200",
  "On-site": "bg-blue-50 text-blue-700 border-blue-200",
};

const COUNTRY_FLAGS: Record<string, string> = {
  "united-kingdom": "🇬🇧", "germany": "🇩🇪", "france": "🇫🇷", "sweden": "🇸🇪", "spain": "🇪🇸",
  "netherlands": "🇳🇱", "ireland": "🇮🇪", "switzerland": "🇨🇭", "italy": "🇮🇹", "belgium": "🇧🇪",
  "denmark": "🇩🇰", "norway": "🇳🇴", "finland": "🇫🇮", "austria": "🇦🇹", "poland": "🇵🇱",
  "portugal": "🇵🇹", "czech-republic": "🇨🇿", "romania": "🇷🇴", "greece": "🇬🇷", "hungary": "🇭🇺",
  "india": "🇮🇳", "china": "🇨🇳", "japao": "🇯🇵", "singapore": "🇸🇬", "south-korea": "🇰🇷",
  "hong-kong": "🇭🇰", "taiwan": "🇹🇼", "united-states": "🇺🇸", "remoto-global": "🌍",
};

export default function HomePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const [lang, setLang] = useState<Lang>("en");
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    params.then((p) => {
      const validLang = (LANGUAGES.find(l => l.code === p.lang)?.code || "en") as Lang;
      setLang(validLang);
    });
  }, [params]);

  useEffect(() => {
    Promise.all([
      fetch("/api/jobs?action=latest").then(r => r.json()),
      fetch("/api/jobs?action=countries").then(r => r.json()),
    ]).then(([jobsData, countriesData]) => {
      setLatestJobs(jobsData.jobs || []);
      setCountries(countriesData.countries || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";

  function switchLang(newLang: Lang) {
    router.push("/" + newLang + "/" + LANG_SLUGS[newLang]);
  }

  function goToRegion(region: string) {
    router.push("/" + lang + "/" + LANG_SLUGS[lang] + "/" + region);
  }

  function goToCountry(region: string, country: string) {
    router.push("/" + lang + "/" + LANG_SLUGS[lang] + "/" + region + "/" + country);
  }

  const regionsByCode: Record<string, CountryInfo[]> = {};
  for (const c of countries) {
    if (!regionsByCode[c.region]) regionsByCode[c.region] = [];
    regionsByCode[c.region].push(c);
  }

  return (
    <div className={isRtl ? "rtl" : "ltr"} dir={isRtl ? "rtl" : "ltr"}>
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SiteLogo size={38} />
            <span className="text-xl font-bold text-gray-900 tracking-tight">Work Versaly</span>
          </div>

          {/* Language Selector - Desktop */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-50 rounded-xl p-1 max-h-10 overflow-y-auto">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => switchLang(l.code)}
                className={"px-2 py-1 text-xs rounded-lg transition-all whitespace-nowrap " +
                  (l.code === lang
                    ? "bg-sky-500 text-white font-medium shadow-sm"
                    : "text-gray-600 hover:bg-gray-200")}
              >
                {l.flag} {l.name.split(" (")[0]}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Language Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white p-3 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-3 gap-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { switchLang(l.code); setMobileMenuOpen(false); }}
                  className={"px-3 py-2 text-xs rounded-lg text-left transition-all " +
                    (l.code === lang ? "bg-sky-500 text-white font-medium" : "bg-gray-50 text-gray-700 hover:bg-gray-100")}
                >
                  {l.flag} {l.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* HERO */}
        <section className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            {T.heroTitle}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {T.heroSubtitle}
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {TOTAL_JOBS.toLocaleString()}+ {T.vacancies}
            </span>
            <span>58 {T.countries}</span>
            <span>3 {T.browseByRegion.replace("Browse by ", "")}</span>
          </div>
        </section>

        {/* 3 REGION CARDS */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{T.browseByRegion}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {REGIONS.map((r) => (
              <button
                key={r.code}
                onClick={() => goToRegion(r.code)}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm hover:shadow-lg hover:border-sky-200 transition-all duration-300"
              >
                <div className={"absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity " + getCatMeta(r.topCategories?.[0]?.name || "Other").color} />
                <div className="relative">
                  <span className="text-3xl mb-3 block">{r.flag}</span>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {REGION_NAMES[lang]?.[r.code] || r.name}
                  </h3>
                  <p className="text-2xl font-extrabold text-sky-600">
                    {r.jobCount.toLocaleString()}+
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{T.vacancies}</p>
                  {regionsByCode[r.code] && (
                    <p className="text-xs text-gray-400 mt-2">
                      {regionsByCode[r.code].length} {T.countries}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* LATEST 20 JOBS */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{T.latestJobs}</h2>
            <button
              onClick={() => goToRegion("europa")}
              className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center gap-1"
            >
              {T.viewAllJobs}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          {loading ? (
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
              {latestJobs.slice(0, 20).map((job) => {
                const cm = getCatMeta(job.sector);
                const sName = sectorNames[lang]?.[job.sector] || job.sector;
                const tc = TYPE_COLORS[job.type] || "bg-gray-50 text-gray-700";
                return (
                  <article key={job.id} className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all border-gray-100">
                    <div className={"h-1 w-full bg-gradient-to-r " + cm.color} />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{job.type}</span>
                        <span className="text-xs text-gray-400">{job.posted}</span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs font-medium text-gray-600 mb-2">{job.company}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{job.location}</span>
                        <span className="text-gray-300">|</span>
                        <span className="font-medium text-sky-600">{job.salary}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className={"text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600"}>
                          {cm.icon} {sName}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* BROWSE BY COUNTRY */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{T.browseByCountry}</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse h-20 rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {REGIONS.map((region) => {
                const regionCountries = regionsByCode[region.code] || [];
                if (regionCountries.length === 0) return null;
                const rName = REGION_NAMES[lang]?.[region.code] || region.name;
                return (
                  <div key={region.code}>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span>{region.flag}</span> {rName}
                      <span className="text-sm font-normal text-gray-400">({regionCountries.length} {T.countries})</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {regionCountries
                        .sort((a, b) => b.count - a.count)
                        .map((c) => {
                          const flag = COUNTRY_FLAGS[c.slug] || "🏳️";
                          return (
                            <button
                              key={c.slug}
                              onClick={() => goToCountry(region.code, c.slug)}
                              className="group flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-100 bg-white hover:border-sky-200 hover:shadow-md transition-all"
                            >
                              <span className="text-2xl">{flag}</span>
                              <span className="text-xs font-medium text-gray-800 text-center leading-tight line-clamp-2 group-hover:text-sky-600 transition-colors">
                                {c.name}
                              </span>
                              <span className="text-xs font-bold text-sky-600">
                                {c.count.toLocaleString()}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SiteLogo size={30} />
              <span className="font-bold text-lg">Work Versaly</span>
            </div>
            <p className="text-gray-400 text-sm">{T.footerText}</p>
            <div className="flex items-center gap-4 text-gray-400 text-xs">
              <span>{TOTAL_JOBS.toLocaleString()}+ {T.vacancies}</span>
              <span>|</span>
              <span>58 {T.countries}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
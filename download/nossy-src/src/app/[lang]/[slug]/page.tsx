"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { LANGUAGES, LANG_SLUGS, i18n, sectorNames } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getSectorMeta, getRegionName, formatSalary } from "@/lib/shared";
import SiteLogo from "@/components/SiteLogo";
import LangSelector from "@/components/LangSelector";
import countriesData from "@/data/countries.json";

export default function HomePage() {
  const params = useParams();
  const langCode = String(params.lang || "en");
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const [jobs, setJobs] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>(countriesData);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  const slug = LANG_SLUGS[lang] || "jobs";

  useEffect(() => {
    fetch("/data/latest_20.json").then(r => r.json()).then(d => { setJobs(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const regions = ["europa", "asia", "eua"];
  const goCountry = (r: string, c: string) => router.push("/" + lang + "/" + slug + "/" + r + "/" + c);

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3"><SiteLogo size={36} /><span className="text-lg font-bold text-gray-900 tracking-tight">NOSSY</span></div>
          <LangSelector lang={lang} switchLang={(l) => router.push("/" + l + "/" + LANG_SLUGS[l])} />
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{T.heroTitle || "Find your dream tech job"}</h1>
          <p className="text-gray-500 text-lg">{T.heroSubtitle || ""}</p>
          <div className="flex justify-center gap-8 mt-6">
            <div><p className="text-3xl font-bold text-sky-600">{T.totalJobs}</p><p className="text-xs text-gray-400 uppercase tracking-wider">{T.vacancies}</p></div>
            <div><p className="text-3xl font-bold text-sky-600">{countries.length}</p><p className="text-xs text-gray-400 uppercase tracking-wider">{T.countries || "Countries"}</p></div>
            <div><p className="text-3xl font-bold text-sky-600">{regions.length}</p><p className="text-xs text-gray-400 uppercase tracking-wider">{T.regions || "Regions"}</p></div>
          </div>
        </div>
        {regions.map(region => {
          const rName = getRegionName(lang, region);
          const rCountries = countries.filter((c: any) => c.region === region);
          const ogImage = region === "europa" ? "/og/og-europa.png" : region === "asia" ? "/og/og-asia.png" : "/og/og-eua.png";
          return (
            <section key={region} className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <img src={ogImage} alt={rName} className="w-10 h-10 rounded-lg" />
                <h2 className="text-2xl font-bold text-gray-900">{rName}</h2>
                <span className="text-sm text-gray-400">{rCountries.reduce((s: number, c: any) => s + c.count, 0).toLocaleString()}+ {T.vacancies}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {rCountries.map((c: any) => (
                  <button key={c.slug} onClick={() => goCountry(region, c.slug)} className="group p-4 rounded-xl border border-gray-100 bg-white hover:border-sky-300 hover:shadow-md transition-all text-left">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-sky-600 transition-colors">{c.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{c.count.toLocaleString()}+ {T.vacancies}</p>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        {!loading && jobs.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">{T.latestJobs || "Latest Jobs"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.slice(0, 6).map((job: any) => {
                const m = getSectorMeta(job.sector);
                return (
                  <div key={job.id} className="rounded-xl border bg-white shadow-sm p-4">
                    <div className={"h-1.5 w-full rounded-full bg-gradient-to-r " + m.color + " mb-3"} />
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-xs text-gray-600 mb-1">{job.company}</p>
                    <p className="text-xs text-gray-400 mb-2">{job.location}</p>
                    <p className="text-xs font-bold text-sky-600">{formatSalary(job)}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <footer className="bg-gray-900 text-white py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3"><img src="/logo.png" alt="NOSSY" className="w-10 h-10 rounded-[22%]" /><span className="font-extrabold text-xl tracking-tight">NOSSY</span></div>
          <p className="text-sky-400 text-sm italic">Seek and you shall find.</p>
          <p className="text-gray-400 text-xs">{T.footerText}</p>
        </div>
      </footer>
    </div>
  );
}

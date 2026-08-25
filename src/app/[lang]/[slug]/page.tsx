"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { REGIONS, TOTAL_JOBS } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, sectorNames, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getFlag } from "@/lib/flags";
import { getSectorMeta, getTypeStyle, getTypeLabel, getRegionName, getCompanyCareerUrl } from "@/lib/shared";
import { getCountryNameTranslated, getCountryCountLabel } from "@/lib/country-names";
import SiteLogo from "@/components/SiteLogo";
import NossyBrand from "@/components/NossyBrand";
import LangSelector from "@/components/LangSelector";
import LangUpdater from "@/components/LangUpdater";
import countriesData from "@/data/countries.json";

interface Job {
  id: number; title: string; company: string; companyUrl: string;
  location: string; country: string; countryName: string;
  salary: string; description: string; sector: string; posted: string; type: string; paywall: boolean;
  regiao?: string;
}
interface CountryInfo { name: string; slug: string; region: string; count: number; }

export default function HomePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const [langCode, setLangCode] = useState("");
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const [latest, setLatest] = useState<Job[]>([]);
  const [countries] = useState<CountryInfo[]>(countriesData as CountryInfo[]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);

  useEffect(() => { params.then(p => setLangCode(p.lang)); }, [params]);

  // Fetch latest jobs from API (with server-side translation)
  useEffect(() => {
    if (!langCode) return;
    setLoading(true);
    setDataError(false);
    fetch("/api/data/latest?lang=" + encodeURIComponent(langCode))
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: Job[]) => {
        setLatest((data || []).slice(0, 20));
        setLoading(false);
      })
      .catch(() => { setDataError(true); setLoading(false); });
  }, [langCode]);

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  const homeHref = "/" + lang + "/" + LANG_SLUGS[lang];

  const byRegion: Record<string, CountryInfo[]> = {};
  for (const c of countries) { if (!byRegion[c.region]) byRegion[c.region] = []; byRegion[c.region].push(c); }

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <LangUpdater lang={lang} />
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={homeHref} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <SiteLogo size={38} />
            <NossyBrand variant="dark" size={28} className="h-7 w-auto" />
          </Link>
          <LangSelector lang={lang} switchLang={(l) => window.location.href = "/" + l + "/" + LANG_SLUGS[l]} />
        </div>
      </header>

      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="NOSSY" className="w-28 h-28 sm:w-36 sm:h-36 rounded-[22%] shadow-2xl ring-4 ring-white/20" />
          </div>
          <div className="flex justify-center mb-4">
            <NossyBrand variant="white" size={48} className="w-48 sm:w-64 md:w-80 h-auto" />
          </div>
          <p className="text-lg sm:text-xl text-blue-100 max-w-xl mx-auto mb-2 italic">Seek and you shall find.</p>
          <p className="text-base sm:text-lg text-blue-200 max-w-2xl mx-auto mb-10">{T.heroSubtitle}</p>
          <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-3 text-blue-100 text-sm">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" /><strong>{TOTAL_JOBS.toLocaleString()}+</strong> {T.vacancies}</span>
            <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg><strong>58</strong> {T.countries}</span>
            <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg><strong>3</strong> {T.allRegions}</span>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <section className="mb-14">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{T.browseByRegion}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {REGIONS.map((r) => {
              const sm = getSectorMeta(r.topCategories?.[0]?.name || "Other");
              const rc = byRegion[r.code] || [];
              return (
              <Link key={r.code} href={homeHref + "/" + r.code} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm hover:shadow-xl hover:border-sky-200 transition-all duration-300">
                <div className={"absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity " + sm.color} />
                <div className="relative">
                  <span className="text-4xl mb-3 block">{r.flag}</span>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{getRegionName(lang, r.code)}</h2>
                  <p className="text-3xl font-extrabold text-sky-600">{r.jobCount.toLocaleString()}+</p>
                  <p className="text-sm text-gray-500 mt-1">{T.vacancies}</p>
                  {rc.length > 0 && <p className="text-xs text-gray-400 mt-2">{getCountryCountLabel(rc.length, lang, T.countries)}</p>}
                </div>
              </Link>);
            })}
          </div>
        </section>

        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{T.latestJobs}</h2>
            <Link href={homeHref + "/europa"} className="text-sky-600 hover:text-sky-700 text-sm font-semibold flex items-center gap-1 group">
              {T.viewAllJobs}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          {dataError ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">&#9888;&#65039;</p>
              <p>{T.error}</p>
              <button onClick={() => window.location.reload()} className="mt-3 text-sky-600 font-medium text-sm hover:underline">{T.reload}</button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="animate-pulse rounded-xl border border-gray-100 p-5"><div className="h-4 bg-gray-200 rounded w-1/3 mb-3" /><div className="h-5 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2 mb-3" /><div className="h-3 bg-gray-200 rounded w-full" /></div>))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latest.map((job) => {
                const m = getSectorMeta(job.sector); const tc = getTypeStyle(job.type);
                const jobRegion = job.regiao ? job.regiao.toLowerCase() : '';
                const jobDetailHref = jobRegion && job.country ? homeHref + "/" + jobRegion + "/" + job.country + "/" + job.id : '';
                const card = (
                  <article className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all border-gray-100">
                    <div className={"h-1 w-full bg-gradient-to-r " + m.color} />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2"><span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{getTypeLabel(lang, job.type)}</span><span className="text-xs text-gray-400">{job.posted}</span></div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">{job.title}</h3>
                      <p className="text-xs font-medium text-gray-600 mb-2">{job.company}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500"><span>{job.location}</span><span className="text-gray-300">|</span><span className="font-medium text-sky-600">{job.salary}</span></div>
                      <div className="mt-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sectorNames[lang]?.[job.sector] || job.sector}</span></div>
                    </div></article>);
                return jobDetailHref ? (
                  <Link key={job.id} href={jobDetailHref} className="block">{card}</Link>
                ) : (
                  <div key={job.id}>{card}</div>
                );
              })}
            </div>)}
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{T.browseByCountry}</h2>
          <div className="space-y-8">
            {REGIONS.map((region) => {
              const rc = byRegion[region.code] || []; if (!rc.length) return null;
              return (
                <div key={region.code}>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="text-xl">{region.flag}</span> {getRegionName(lang, region.code)}
                    <span className="text-sm font-normal text-gray-400"> ({getCountryCountLabel(rc.length, lang, T.countries)})</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {rc.sort((a, b) => b.count - a.count).map((c) => (
                      <Link key={c.slug} href={homeHref + "/" + region.code + "/" + c.slug} className="group flex flex-col items-center gap-1.5 p-4 rounded-xl border border-gray-100 bg-white hover:border-sky-200 hover:shadow-lg transition-all">
                        <span className="text-3xl">{getFlag(c.slug)}</span>
                        <span className="text-xs font-medium text-gray-800 text-center leading-tight line-clamp-2 group-hover:text-sky-600 transition-colors">{getCountryNameTranslated(c.slug, lang, c.name)}</span>
                        <span className="text-xs font-bold text-sky-600">{c.count.toLocaleString()}</span>
                      </Link>))}
                  </div></div>);
            })}
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-5">
            <Link href={homeHref} className="flex items-center gap-4">
              <SiteLogo size={48} />
              <div>
                <NossyBrand variant="white" size={36} className="h-9 w-auto" />
                <p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>
              </div>
            </Link>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <span>{TOTAL_JOBS.toLocaleString()}+ {T.vacancies}</span>
              <span className="text-gray-600">|</span>
              <span>58 {T.countries}</span>
              <span className="text-gray-600">|</span>
              <span>{T.footerText}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>);
}
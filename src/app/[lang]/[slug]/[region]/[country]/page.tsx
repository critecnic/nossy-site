"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { REGIONS } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, sectorNames, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getSectorMeta, getTypeStyle, getTypeLabel, formatSalary, getRegionName, shouldHavePaywall, getCompanyCareerUrl, getPaywallText } from "@/lib/shared";
import { getCountryNameTranslated } from "@/lib/country-names";
import SiteLogo from "@/components/SiteLogo";
import NossyBrand from "@/components/NossyBrand";
import LangSelector from "@/components/LangSelector";
import PaddlePayment from "@/components/PaddlePayment";
import countriesData from "@/data/countries.json";

interface Job {
  id: number; title: string; company: string; companyUrl: string;
  location: string; country: string; countryName: string;
  salary: string; salaryMin: number | null; salaryMax: number | null;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  paywall: boolean; contactEmail: string;
}

export default function CountryPage({ params }: { params: Promise<{ lang: string; slug: string; region: string; country: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ lang: string; slug: string; region: string; country: string } | null>(null);
  useEffect(() => { params.then(setResolvedParams); }, [params]);
  const langCode = resolvedParams?.lang || '';
  const rc = resolvedParams?.region || '';
  const cc = resolvedParams?.country || '';
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [countryNameRaw, setCountryNameRaw] = useState("");
  const countryName = countryNameRaw ? getCountryNameTranslated(cc, lang, countryNameRaw) : '';
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [page, setPage] = useState(1);
  const [countries] = useState<any[]>(countriesData);
  const [unlockingId, setUnlockingId] = useState<number | null>(null);
  const PER = 18;

  const homeHref = "/" + lang + "/" + (LANG_SLUGS[lang] || "jobs");
  const regionHref = homeHref + "/" + rc;
  const countryHref = regionHref + "/" + cc;

  // Load jobs from API (with server-side translation)
  useEffect(() => {
    if (!rc || !cc || !langCode) return;
    setLoading(true); setDataError(false); setLoadProgress(10);
    fetch("/api/data/country?file=" + encodeURIComponent(rc + "_" + cc + ".json") + "&lang=" + encodeURIComponent(langCode))
      .then(r => { setLoadProgress(50); if (!r.ok) throw new Error(); return r.json(); })
      .then((data: Job[]) => {
        setLoadProgress(90);
        setAllJobs(data || []);
        if (data && data.length > 0) setCountryNameRaw(data[0].countryName || countries.find((c: any) => c.slug === cc)?.name || cc);
        setLoadProgress(100); setLoading(false);
      }).catch(() => { setDataError(true); setLoading(false); });
  }, [rc, cc, langCode]);

  // Set country name from countries data if not set by jobs
  useEffect(() => {
    if (countryNameRaw || !cc || countries.length === 0) return;
    const m = countries.find((c: any) => c.slug === cc);
    if (m) setCountryNameRaw(m.name);
  }, [countries, cc, countryNameRaw]);

  // Computed: filtered jobs
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
  const rName = getRegionName(lang, rc);
  const pwText = getPaywallText(lang);

  useEffect(() => { setPage(1); }, [search, typeFilter, sectorFilter]);

  const hasActiveFilters = typeFilter || sectorFilter || search;
  function clearFilters() { setTypeFilter(""); setSectorFilter(""); setSearch(""); }

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href={homeHref} className="hover:opacity-80 transition-opacity flex-shrink-0"><SiteLogo size={36} /></Link>
            <Link href={homeHref} className="hover:opacity-80 transition-colors hidden sm:block"><NossyBrand variant="dark" size={24} className="h-6 w-auto" /></Link>
            <span className="text-gray-300 mx-1 hidden md:inline">/</span>
            <Link href={regionHref} className="text-sky-600 font-semibold hover:underline hidden md:inline truncate">{rName}</Link>
            <span className="text-gray-300 mx-1 hidden md:inline">/</span>
            <span className="text-gray-700 font-semibold hidden md:inline truncate">{countryName}</span>
          </div>
          <LangSelector lang={lang} switchLang={(l) => window.location.href = "/" + l + "/" + LANG_SLUGS[l] + "/" + rc + "/" + cc} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link href={homeHref} className="hover:text-sky-600 transition-colors">{T.backToHome}</Link>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link href={regionHref} className="hover:text-sky-600 transition-colors">{rName}</Link>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-900 font-medium">{countryName || cc}</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">{T.jobsIn.replace("{0}", countryName || cc)}</h1>
          <p className="text-gray-500 mt-1">{actualTotal.toLocaleString()} {T.vacancies}</p>
        </div>

        <div className="relative w-full sm:w-80 mb-5">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={T.searchPlaceholder} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white" />
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{T.filterByType}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTypeFilter("")} className={"px-4 py-2 rounded-full text-sm font-medium border transition-all " + (!typeFilter ? "bg-sky-500 text-white border-sky-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:bg-sky-50")}>{T.allWorkTypes}</button>
            {workTypes.map((t) => (
              <button key={t} onClick={() => setTypeFilter(typeFilter === t ? "" : t)} className={"px-4 py-2 rounded-full text-sm font-medium border transition-all " + (typeFilter === t ? "bg-sky-500 text-white border-sky-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:bg-sky-50")}>{getTypeLabel(lang, t)}</button>
            ))}
          </div>
        </div>

        {sectors.length > 1 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{T.filterByCategory}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSectorFilter("")} className={"px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all " + (!sectorFilter ? "bg-sky-500 text-white border-sky-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-sky-300")}>{T.allCategories}</button>
              {sectors.map((s) => {
                const si = getSectorMeta(s);
                return (<button key={s} onClick={() => setSectorFilter(sectorFilter === s ? "" : s)} className={"px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 " + (sectorFilter === s ? "bg-sky-500 text-white border-sky-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-sky-300")}><span>{si.icon}</span>{sectorNames[lang]?.[s] || s}</button>);
              })}
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="mb-4 flex items-center gap-3">
            <span className="text-xs text-gray-500">{filtered.length} {T.vacancies}</span>
            <button onClick={clearFilters} className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              {T.clearFilters}
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-sky-500 h-1.5 rounded-full transition-all" style={{ width: loadProgress + '%' }} /></div>
            <p className="text-center text-sm text-gray-400">{T.loading}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="animate-pulse rounded-xl border border-gray-100 p-5"><div className="h-4 bg-gray-200 rounded w-1/3 mb-3" /><div className="h-5 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2 mb-3" /></div>))}</div>
          </div>
        ) : dataError ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">&#128269;</p><p className="text-lg">{T.error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">{T.reload}</button>
          </div>
        ) : actualTotal === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">&#128269;</p>
            <p className="text-lg font-medium text-gray-600">{T.noJobsFound}</p>
            <p className="text-sm mt-1">{T.tryAdjustFilters}</p>
            {hasActiveFilters && (<button onClick={clearFilters} className="mt-4 px-5 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">{T.clearFilters}</button>)}
          </div>
        ) : (<>
          <p className="text-sm text-gray-500 mb-4">{T.showing.replace("{0}", String((page - 1) * PER + 1)).replace("{1}", String(Math.min(page * PER, actualTotal))).replace("{2}", actualTotal.toLocaleString())}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{paged.map((job) => {
            const m = getSectorMeta(job.sector); const sn = sectorNames[lang]?.[job.sector] || job.sector; const tc = getTypeStyle(job.type);
            const pw = shouldHavePaywall(job);
            const isLocked = pw.paywall;
            const detailHref = countryHref + "/" + job.id;
            const careerUrl = getCompanyCareerUrl(job);
            return (
              <article key={job.id} className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-gray-100">
                <div className={"h-1.5 w-full bg-gradient-to-r " + m.color} />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{getTypeLabel(lang, job.type)}</span>
                      {isLocked && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{pwText.premium}</span>}
                    </div>
                    <span className="text-xs text-gray-400">{job.posted}</span>
                  </div>
                  <Link href={detailHref} className="block">
                    <h2 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-sky-600 transition-colors">{job.title}</h2>
                  </Link>
                  <p className="text-xs font-medium text-gray-600 mb-1">{isLocked ? '***' : job.company}</p>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-1">{job.location}</p>
                  <div className="flex items-center gap-2 text-xs mb-2"><span className="font-bold text-sky-600">{formatSalary(job, lang)}</span></div>
                  <div className="mb-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sn}</span></div>
                  {job.description && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{job.description.slice(0, 200)}</p>}
                  {isLocked && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {unlockingId === job.id ? (
                        <PaddlePayment jobId={job.id} jobTitle={job.title} lang={lang} compact />
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            <span className="text-xs text-amber-700 font-medium">{T.contactAvailable}</span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setUnlockingId(job.id); }} className="text-xs px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm">
                            {pwText.unlock}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {!isLocked && job.contactEmail && (
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <a href={"mailto:" + job.contactEmail} className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors truncate">{job.contactEmail}</a>
                    </div>
                  )}
                  {!isLocked && !job.contactEmail && careerUrl && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <Link href={detailHref} className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        {T.viewJob}
                      </Link>
                    </div>
                  )}
                </div></article>);
          })}</div>
          {totalPages > 1 && (<div className="flex items-center justify-center gap-3 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{T.prevPage}</button>
            <span className="text-sm text-gray-600">{T.pageOf.replace("{0}", String(page)).replace("{1}", String(totalPages))}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{T.nextPage}</button>
          </div>)}
        </>)}
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
            <p className="text-gray-400 text-sm">{T.footerText}</p>
          </div>
        </div>
      </footer>
    </div>);
}
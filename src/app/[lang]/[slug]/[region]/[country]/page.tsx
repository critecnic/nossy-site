"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { REGIONS } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, sectorNames, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getSectorMeta, getTypeStyle, getTypeLabel, formatSalary, getRegionName, shouldHavePaywall, getCompanyCareerUrl, getPaywallText } from "@/lib/shared";
import { getCountryNameTranslated } from "@/lib/country-names";
import SiteLogo from "@/components/SiteLogo";
import NossyBrand from "@/components/NossyBrand";
import LangSelector from "@/components/LangSelector";
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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const initialCountryName = countriesData.find((c: any) => c.slug === cc)?.name || '';
  const [countryNameRaw, setCountryNameRaw] = useState(initialCountryName);
  const countryName = countryNameRaw ? getCountryNameTranslated(cc, lang, countryNameRaw) : '';
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [search, setSearch] = useState("");
  const PER = 18;
  const [countries] = useState<any[]>(countriesData);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Payment success notification (P8)
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setPaymentSuccess(true);
      // Auto-clear the URL param
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      router.replace(url.pathname + url.search, { scroll: false });
      const timer = setTimeout(() => setPaymentSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  const homeHref = "/" + lang + "/" + (LANG_SLUGS[lang] || "jobs");
  const regionHref = homeHref + "/" + rc;
  const countryHref = regionHref + "/" + cc;

  // Load jobs from paginated API (with server-side translation)
  const fetchPage = useCallback((p: number) => {
    if (!rc || !cc || !langCode) return;
    setLoading(true); setDataError(false); setLoadProgress(10);
    const sp = new URLSearchParams({
      file: rc + "_" + cc + ".json",
      lang: langCode,
      page: String(p),
      limit: String(PER),
    });
    fetch("/api/data/country?" + sp.toString())
      .then(r => { setLoadProgress(50); if (!r.ok) throw new Error(); return r.json(); })
      .then((data: { jobs: Job[]; total: number; page: number; totalPages: number }) => {
        setLoadProgress(90);
        setJobs(data.jobs || []);
        setTotalJobs(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || 1);
        if (data.jobs && data.jobs.length > 0) setCountryNameRaw(data.jobs[0].countryName || countries.find((c: any) => c.slug === cc)?.name || cc);
        setLoadProgress(100); setLoading(false);
      }).catch(() => { setDataError(true); setLoading(false); });
  }, [rc, cc, langCode, countries]);

  // Read ?page=N from URL on mount, then fetch that page
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
    fetchPage(pageFromUrl > 0 ? pageFromUrl : 1);
  }, [fetchPage, searchParams]);

  // Client-side search filter on current page
  const filtered = search
    ? jobs.filter(j => {
        const s = search.toLowerCase();
        return j.title?.toLowerCase().includes(s) || j.company?.toLowerCase().includes(s) || j.sector?.toLowerCase().includes(s);
      })
    : jobs;

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  const rName = getRegionName(lang, rc);
  const pwText = getPaywallText(lang);

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      {paymentSuccess && (
        <div className="fixed top-4 right-4 z-[60] bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
          ✓ {T.paymentSuccess || 'Payment successful! Access unlocked.'}
        </div>
      )}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">{T.jobsIn.replace("{0}", countryName || cc)}</h1>
              <p className="text-gray-500 mt-1">{totalJobs.toLocaleString()} {T.vacancies}</p>
            </div>
            <Link
              href={countryHref + "/sectors"}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-600 transition-colors shadow-sm self-start"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              {T.browseByCategory}
            </Link>
          </div>
        </div>

        <div className="relative w-full sm:w-80 mb-5">
          <svg className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={T.searchPlaceholder} className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white" />
        </div>

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
        ) : totalJobs === 0 && !loading ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">&#128269;</p>
            <p className="text-lg font-medium text-gray-600">{T.noJobsFound}</p>
            <p className="text-sm mt-1">{T.tryBrowseRegion || 'Try browsing the region'} <Link href={regionHref} className="text-sky-600 hover:text-sky-700 font-medium">{rName}</Link></p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">&#128269;</p>
            <p className="text-lg font-medium text-gray-600">{T.noJobsFound}</p>
            <p className="text-sm mt-1">{T.tryAdjustFilters}</p>
          </div>
        ) : (<>
          <p className="text-sm text-gray-500 mb-4">{T.showing.replace("{0}", String((currentPage - 1) * PER + 1)).replace("{1}", String(Math.min(currentPage * PER, totalJobs))).replace("{2}", totalJobs.toLocaleString())}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map((job) => {
            const m = getSectorMeta(job.sector); const sn = sectorNames[lang]?.[job.sector] || job.sector; const tc = getTypeStyle(job.type);
            const pw = shouldHavePaywall(job);
            const isLocked = pw.paywall;
            const detailHref = countryHref + "/" + job.id;
            const careerUrl = getCompanyCareerUrl(job);
            return (
              <Link key={job.id} href={detailHref} className="block">
              <article className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-gray-100">
                <div className={"h-1.5 w-full bg-gradient-to-r " + m.color} />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{getTypeLabel(lang, job.type)}</span>
                      {isLocked && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{pwText.premium}</span>}
                    </div>
                    <span className="text-xs text-gray-400">{job.posted}</span>
                  </div>
                  <h2 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-sky-600 transition-colors">{job.title}</h2>
                  <p className="text-xs font-medium text-gray-600 mb-1">{isLocked ? '***' : job.company}</p>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-1">{job.location}</p>
                  <div className="flex items-center gap-2 text-xs mb-2"><span className="font-bold text-sky-600">{formatSalary(job, lang)}</span></div>
                  <div className="mb-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sn}</span></div>
                  {job.description && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{job.description.slice(0, 200)}</p>}
                  {isLocked && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          <span className="text-xs text-amber-700 font-medium">{T.contactAvailable}</span>
                        </div>
                        <span className="text-xs px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg shadow-sm">
                          {pwText.unlock}
                        </span>
                      </div>
                    </div>
                  )}
                  {!isLocked && job.contactEmail && (
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <span className="text-xs font-medium text-sky-600 truncate">{job.contactEmail}</span>
                    </div>
                  )}
                  {!isLocked && !job.contactEmail && careerUrl && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        {T.viewJob}
                      </span>
                    </div>
                  )}
                </div></article>
              </Link>);
          })}</div>
          {totalPages > 1 && (<div className="flex items-center justify-center gap-3 mt-8">
            <button onClick={() => { fetchPage(currentPage - 1); router.push(countryHref + '?page=' + (currentPage - 1)); }} disabled={currentPage === 1} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{T.prevPage}</button>
            <span className="text-sm text-gray-600">{T.pageOf.replace("{0}", String(currentPage)).replace("{1}", String(totalPages))}</span>
            <button onClick={() => { fetchPage(currentPage + 1); router.push(countryHref + '?page=' + (currentPage + 1)); }} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{T.nextPage}</button>
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
            <div className="flex flex-col items-center gap-2 text-gray-400 text-sm">
              <a href="mailto:Cristecnic@outlook.com" className="text-sky-400 hover:text-sky-300 transition-colors">Contact: Cristecnic@outlook.com</a>
              <span>{T.footerText}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>);
}
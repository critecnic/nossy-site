"use client";

// Cliente da listagem de país — recebe a PÁGINA 1 já renderizada pelo
// servidor (SEO: vagas no HTML inicial, G4 COMPANY entre os 10 primeiros).
// Depois do mount: se o idioma pede tradução, busca a versão traduzida na
// API (mesma ordem — a rotação é determinística por janela de 6h) e troca
// em silêncio; paginação continua pela API.

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { LANGUAGES, LANG_SLUGS, sectorNames, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getSectorMeta, getTypeStyle, getTypeLabel, formatSalary, getRegionName, getCompanyCareerUrl } from "@/lib/shared";
import { getCountryNameTranslated } from "@/lib/country-names";
import { formatJobLocation } from "@/lib/location-names";
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
  contactEmail: string;
}

const SOURCE_LANGS = new Set(["pt-br", "pt-pt"]);

export default function CountryJobsClient({
  initialJobs,
  initialTotal,
  initialTotalPages,
  langCode,
  rc,
  cc,
}: {
  initialJobs: Job[];
  initialTotal: number;
  initialTotalPages: number;
  langCode: string;
  rc: string;
  cc: string;
}) {
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [totalJobs, setTotalJobs] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentPage, setCurrentPage] = useState(1);
  const countryNameRaw = countriesData.find((c: any) => c.slug === cc)?.name || cc;
  const countryName = getCountryNameTranslated(cc, lang, countryNameRaw);
  const [dataError, setDataError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const PER = 18;
  const searchParams = useSearchParams();
  const router = useRouter();

  const homeHref = "/" + lang + "/" + (LANG_SLUGS[lang] || "jobs");
  const regionHref = homeHref + "/" + rc;
  const countryHref = regionHref + "/" + cc;

  const fetchPage = useCallback((p: number, silent: boolean = false) => {
    if (!rc || !cc || !langCode) return;
    if (silent) setLoading(false);
    else { setLoading(true); setDataError(false); }
    const sp = new URLSearchParams({
      file: rc + "_" + cc + ".json",
      lang: langCode,
      page: String(p),
      limit: String(PER),
    });
    fetch("/api/data/country?" + sp.toString())
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: { jobs: Job[]; total: number; page: number; totalPages: number }) => {
        if (data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
          setTotalJobs(data.total || 0);
          setTotalPages(data.totalPages || 1);
          setCurrentPage(data.page || p);
        } else if (p > 1) {
          setJobs([]);
        }
        setLoading(false);
      })
      .catch(() => { if (!silent) setDataError(true); setLoading(false); });
  }, [rc, cc, langCode]);

  useEffect(() => {
    // Página via URL (?page=N) tem precedência; senão, troca silenciosa
    // pela versão traduzida da página 1 (SSR já entregou o conteúdo).
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
    if (pageFromUrl > 1) fetchPage(pageFromUrl);
    else if (!SOURCE_LANGS.has(langCode)) fetchPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Type filter aliases: PT and EN variants map to the same filter key
  const TYPE_ALIASES: Record<string, string[]> = {
    Remoto: ['Remoto', 'Remote'],
    Hibrido: ['Hibrido', 'Hybrid'],
    Presencial: ['Presencial', 'On-site'],
  };

  // Client-side search + type filter on current page
  const filtered = jobs.filter(j => {
    if (typeFilter !== 'all') {
      const aliases = TYPE_ALIASES[typeFilter] || [typeFilter];
      if (!aliases.includes(j.type)) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      return j.title?.toLowerCase().includes(s) || j.company?.toLowerCase().includes(s) || j.sector?.toLowerCase().includes(s);
    }
    return true;
  });

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  const rName = getRegionName(lang, rc);

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

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="relative w-full sm:w-80">
            <svg className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={T.searchPlaceholder} className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {["all", "Remoto", "Hibrido", "Presencial"].map(type => (
              <button key={type} onClick={() => setTypeFilter(type)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${typeFilter === type ? "bg-sky-500 text-white border-sky-500" : "bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:text-sky-600"}`}>
                {getTypeLabel(lang, type)}
              </button>
            ))}
          </div>
        </div>

        {dataError ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">&#128269;</p><p className="text-lg">{T.error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">{T.reload}</button>
          </div>
        ) : totalJobs === 0 ? (
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
            const detailHref = countryHref + "/" + job.id;
            const careerUrl = getCompanyCareerUrl(job);
            return (
              <Link key={job.id} href={detailHref} className="block">
              <article className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg transition-all duration-200 border-gray-100">
                <div className={"h-1.5 w-full bg-gradient-to-r " + m.color} />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={"rounded-full px-2.5 py-0.5 text-xs font-medium border " + tc}>{getTypeLabel(lang, job.type)}</span>
                    <span className="text-xs text-gray-400">{job.posted}</span>
                  </div>
                  <h2 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-sky-600 transition-colors">{job.title}</h2>
                  <p className="text-xs font-medium text-gray-600 mb-1">{job.company}</p>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-1">{formatJobLocation(job.location, { countrySlug: job.country, countryName: job.countryName, lang })}</p>
                  <div className="flex items-center gap-2 text-xs mb-2"><span className="font-bold text-sky-600">{formatSalary(job, lang)}</span></div>
                  <div className="mb-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{m.icon} {sn}</span></div>
                  {job.description && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{job.description.slice(0, 200)}</p>}
                  {job.contactEmail && (
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <span className="text-xs font-medium text-sky-600 truncate">{job.contactEmail}</span>
                    </div>
                  )}
                  {!job.contactEmail && careerUrl && (
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
              <a href="mailto:CRITECNIC@OUTLOOK.COM" className="text-sky-400 hover:text-sky-300 transition-colors">Contact: CRITECNIC@OUTLOOK.COM</a>
              <span>{T.footerText}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>);
}
